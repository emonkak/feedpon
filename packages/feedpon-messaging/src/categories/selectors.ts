import createAscendingComparer from 'feedpon-utils/createAscendingComparer.ts';
import { createSelector } from 'reselect';
import type { Categories, Category, State } from '../types.ts';

const labelComparer = createAscendingComparer<Category>('label');

export function getSortedCategories(categories: Categories['items']) {
  return Object.values(categories).sort(labelComparer);
}

export function createSortedCategoriesSelector() {
  return createSelector(
    (state: State) => state.categories.items,
    getSortedCategories,
  );
}
