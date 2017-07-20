import { createSelector } from 'reselect';

import createAscendingComparer from 'utils/createAscendingComparer';
import { Category, GroupedSubscription, State } from 'messaging/types';

export const labelComparer = createAscendingComparer<Category>('label');

export function createSortedCategoriesSelector() {
    return createSelector(
        (state: State) => state.categories.items,
        (categories) => Object.values(categories).sort(labelComparer)
    );
}

export function createVisibleCategoriesSelector(groupedSubscriptionsSelector: (state: State) => { [key: string]: GroupedSubscription }) {
    return createSelector(
        (state: State) => state.categories.items,
        groupedSubscriptionsSelector,
        (categories, groupedSubscriptions) => {
            return Object.values(categories)
                .filter((category) => groupedSubscriptions.hasOwnProperty(category.label))
                .sort(labelComparer)
        }
    );
}
