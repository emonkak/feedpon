import { createSelector } from 'reselect';

import { Category, State } from 'messaging/types';
import createAscendingComparer from 'utils/createAscendingComparer';

export const labelComparer = createAscendingComparer<Category>('label');

export function createSortedCategoriesSelector() {
    return createSelector(
        (state: State) => state.categories.items,
        (categories) => Object.values(categories).sort(labelComparer)
    );
}
