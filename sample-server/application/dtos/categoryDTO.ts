import { CategoryEntity } from "../../domain/entities/category/index.js";
import { z } from "zod";
import { ValidationError } from "../errors.js";

export const categoryInputSchema = z.object({
  name: z.string().min(1, "Category name is required.").max(50, "Category name cannot exceed 50 characters."),
  color: z.string().refine(val => {
    const validColors = [
      "blue", "orange", "red", "green", "yellow", "purple", "indigo", "brown", "pink", "teal",
      "emerald", "amber", "cyan"
    ];
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const nameRegex = /^[a-zA-Z]+$/;
    return hexRegex.test(val) || validColors.includes(val.toLowerCase()) || nameRegex.test(val);
  }, "Category color must be a valid hex color code or color name.").optional(),
  customOrder: z.number().int().optional()
});

export type CategoryInputDTO = z.infer<typeof categoryInputSchema>;


export class CategoryDTO {
  id!: number;
  name!: string;
  color!: string;
  customOrder!: number;
  userId!: number;
  createdAt!: string | null;
  updatedAt!: string | null;

  static fromEntity(category: CategoryEntity | null | undefined): CategoryDTO | null {
    if (!category) return null;
    if (typeof category.id !== "number" || isNaN(category.id) || category.id <= 0) {
      throw new ValidationError(
        "Database persistence validation failed for Category: id must be a valid positive number."
      );
    }
    if (!category.createdAt || !(category.createdAt instanceof Date) || isNaN(category.createdAt.getTime())) {
      throw new ValidationError(
        "Database persistence validation failed for Category: createdAt must be a valid Date object."
      );
    }
    if (!category.updatedAt || !(category.updatedAt instanceof Date) || isNaN(category.updatedAt.getTime())) {
      throw new ValidationError(
        "Database persistence validation failed for Category: updatedAt must be a valid Date object."
      );
    }
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      customOrder: category.customOrder || 0,
      userId: category.userId,
      createdAt: category.createdAt ? category.createdAt.toISOString() : null,
      updatedAt: category.updatedAt ? category.updatedAt.toISOString() : null,
    };
  }
}
