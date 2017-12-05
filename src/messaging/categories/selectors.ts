import Enumerable from '@emonkak/enumerable';
import { createSelector } from 'reselect';

import createAscendingComparer from 'utils/createAscendingComparer';
import { Category, GroupedSubscription, State } from 'messaging/types';

import '@emonkak/enumerable/extensions/join';
import '@emonkak/enumerable/extensions/toArray';

export const labelComparer = createAscendingComparer<Category>('label');

export function createSortedCategoriesSelector() {
    return createSelector(
        (state: State) => state.categories.items,
        (categories) => Object.values(categories).sort(labelComparer)
    );
}

export function createJoinedCategoriesSelector(
    categoriesSelector: (state: State) => Category[],
    groupedSubscriptionsSelector: (state: State) => { [key: string]: GroupedSubscription }
) {
    return createSelector(
        categoriesSelector,
        groupedSubscriptionsSelector,
        (categories, groupedSubscriptions) =>
            new Enumerable(Object.values(categories))
                .join(
                    Object.values(groupedSubscriptions),
                    (groupedSubscription) => groupedSubscription.label,
                    (category) => category.label,
                    (category, { items }) => ({ category, subscriptions: items })
                )
                .toArray()
    );
}
