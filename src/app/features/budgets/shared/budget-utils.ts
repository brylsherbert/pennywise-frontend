import { Budget, BUDGET_OTHERS_CATEGORY_KEY, BudgetCategoryGroup, DEFAULT_CATEGORY_COLOR } from '../../../core/models/budgets.model';
import { Category } from '../../../core/models/categories.model';

export function buildGroupedBudgets(
    budgets: Budget[],
    categories: Category[],
    searchQuery?: string,
): BudgetCategoryGroup[] {
    const categoriesById = new Map(categories.map(category => [category.id, category]));
    const groups = new Map<string, Budget[]>();

    for (const budget of budgets) {
        if (searchQuery && !budget.name.toLowerCase().includes(searchQuery)) {
            continue;
        }

        const key = budget.category_id ?? BUDGET_OTHERS_CATEGORY_KEY;
        const group = groups.get(key);

        if (group) {
            group.push(budget);
        } else {
            groups.set(key, [budget]);
        }
    }

    const result: BudgetCategoryGroup[] = [];

    for (const [key, groupBudgets] of groups) {
        const category = key === BUDGET_OTHERS_CATEGORY_KEY ? null : categoriesById.get(key);

        result.push({
            category_id: key === BUDGET_OTHERS_CATEGORY_KEY ? null : key,
            category_label:
                key === BUDGET_OTHERS_CATEGORY_KEY
                    ? 'Others'
                    : (category?.name ?? 'Uncategorized'),
            category_color: category?.color ?? DEFAULT_CATEGORY_COLOR,
            budgets: groupBudgets,
        });
    }

    result.sort((a, b) => {
        if (a.category_id === null) return 1;
        if (b.category_id === null) return -1;
        return a.category_label.localeCompare(b.category_label);
    });

    return result;
}