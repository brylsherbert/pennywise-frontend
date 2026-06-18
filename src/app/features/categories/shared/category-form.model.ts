import { WritableSignal } from '@angular/core';
import { form, required } from '@angular/forms/signals';

export interface CategoryFormData {
  name: string;
  color: string;
}

export const CATEGORY_COLOR_PRESETS = [
  '#3880ff',
  '#2dd36f',
  '#ffc409',
  '#eb445a',
  '#92949c',
  '#7044ff',
  '#0cd1e8',
  '#f04141',
] as const;

export function createCategorySignalForm(model: WritableSignal<CategoryFormData>) {
  return form(model, (schemaPath) => {
    required(schemaPath.name, { message: 'Name is required' });
    required(schemaPath.color, { message: 'Color is required' });
  });
}

export type CategorySignalForm = ReturnType<typeof createCategorySignalForm>;

export function createDefaultCategoryFormData(): CategoryFormData {
  return {
    name: '',
    color: CATEGORY_COLOR_PRESETS[0],
  };
}

export function toCategoryFormData(category: { name: string; color: string }): CategoryFormData {
  return {
    name: category.name,
    color: category.color,
  };
}
