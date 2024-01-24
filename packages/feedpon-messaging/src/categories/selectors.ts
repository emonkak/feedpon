import { createSelector } from 'reselect';

import createAscendingComparer from 'feedpon-utils/createAscendingComparer';
import type { Categories, Category, State } from '../index';

const labelComparer = createAscendingComparer<Category>('label');

export function selectSortedCategories(categories: Categories['items']) {
  return Object.values(categories).sort(labelComparer);
}

export function createSortedCategoriesSelector() {
  return createSelector(
    (state: State) => state.categories.items,
    (categories) => Object.values(categories).sort(labelComparer),
  );
}
