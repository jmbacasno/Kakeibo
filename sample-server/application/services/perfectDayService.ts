import { UnitOfWorkInterface } from "../../domain/repositories/unitOfWorkInterface.js";

export class PerfectDayService {
  constructor(private uow: UnitOfWorkInterface) {}

  async getPerfectDays(userId: number): Promise<string[]> {
    const perfectDays = await this.uow.perfectDays.findAllByUserId(userId);
    return perfectDays.map(p => p.date);
  }
}
