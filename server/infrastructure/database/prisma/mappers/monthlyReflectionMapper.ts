import { MonthlyReflection as PrismaMonthlyReflection } from "@prisma/client";
import {
  MonthlyReflection,
  ReflectionPlanSummary,
} from "../../../../domain/entities/monthlyReflection/index.js";

export type PrismaReflectionWithPlan = PrismaMonthlyReflection & {
  monthlyPlan?: ReflectionPlanSummary | null;
};

export class MonthlyReflectionMapper {
  static toEntity(raw: PrismaReflectionWithPlan): MonthlyReflection {
    return new MonthlyReflection({
      id: raw.id,
      monthlyPlanId: raw.monthlyPlanId,
      content: raw.content,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      monthlyPlan: raw.monthlyPlan || null,
    });
  }
}
