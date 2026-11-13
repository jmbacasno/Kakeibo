import { PerfectDayEntity } from "../entities/perfectDay/index.js";

export interface PerfectDayRepositoryInterface {
  findByUserIdAndDate(userId: number, date: string): Promise<PerfectDayEntity | null>;
  findAllByUserId(userId: number): Promise<PerfectDayEntity[]>;
  create(perfectDay: PerfectDayEntity): Promise<PerfectDayEntity>;
  update(perfectDay: PerfectDayEntity): Promise<PerfectDayEntity>;
  delete(userId: number, date: string): Promise<void>;
}
