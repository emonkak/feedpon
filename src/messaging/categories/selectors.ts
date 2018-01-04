import { createSelector } from 'reselect';

import createAscendingComparer from 'utils/createAscendingComparer';
import { Category, State } from 'messaging/types';

const labelComparer = createAscendingComparer<Category>('label');

export function createSortedCategoriesSelector() {
    return createSelector(
        (state: State) => state.categories.items,
        (categories) => Object.values(categories).sort(labelComparer)
    );
}
