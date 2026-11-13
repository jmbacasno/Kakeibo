import { PlanStatus } from "../../domain/entities/monthlyPlan/index.js";
import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";
import { DashboardDTO, dashboardQuerySchema } from "../dtos/dashboardDTO.js";
import { MonthlyPlanDTO } from "../dtos/monthlyPlanDTO.js";
import { TransactionDTO } from "../dtos/transactionDTO.js";
import { parseDTO } from "../validation.js";

export class DashboardService {
  constructor(private readonly uow: UnitOfWorkInterface) {}

  async getDashboard(userId: number, rawQuery: unknown): Promise<DashboardDTO> {
    const query = parseDTO(dashboardQuerySchema, rawQuery || {});
    const now = new Date();
    const month = query.month ?? now.getMonth() + 1;
    const year = query.year ?? now.getFullYear();

    const [plan, availablePeriods] = await Promise.all([
      this.uow.monthlyPlans.findByPeriodAndUserId(month, year, userId),
      this.uow.monthlyPlans.findAvailablePeriodsByUserId(userId),
    ]);

    const availableMonths = availablePeriods.map((p) => ({
      id: p.id,
      month: p.month,
      year: p.year,
      status: p.status as PlanStatus,
    }));

    if (!plan) {
      return {
        month,
        year,
        hasPlan: false,
        plan: null,
        summary: null,
        recentTransactions: [],
        availableMonths,
      };
    }

    const planDto = MonthlyPlanDTO.fromEntity(plan);
    const { transactions: recentTxEntities } = await this.uow.transactions.findManyByUserId(
      userId,
      {
        planId: plan.id!,
        sortBy: "date",
        sortOrder: "desc",
        page: 1,
        limit: 8,
      }
    );

    return {
      month,
      year,
      hasPlan: true,
      plan: planDto,
      summary: planDto.summary,
      recentTransactions: recentTxEntities.map((t) => TransactionDTO.fromEntity(t)),
      availableMonths,
    };
  }
}
