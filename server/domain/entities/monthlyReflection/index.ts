import { validateReflectionContent } from "./validators.js";

export interface ReflectionPlanSummary {
  id: number;
  month: number;
  year: number;
}

export interface MonthlyReflectionEntity {
  id: number | null;
  monthlyPlanId: number;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  monthlyPlan?: ReflectionPlanSummary | null;
}

export class MonthlyReflection implements MonthlyReflectionEntity {
  id: number | null;
  monthlyPlanId: number;
  content: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  monthlyPlan?: ReflectionPlanSummary | null;

  constructor(data: MonthlyReflectionEntity) {
    this.id = data.id;
    this.monthlyPlanId = data.monthlyPlanId;
    this.content = data.content.trim();
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.monthlyPlan = data.monthlyPlan;

    this.validate();
  }

  validate(): void {
    validateReflectionContent(this.content);
  }
}
