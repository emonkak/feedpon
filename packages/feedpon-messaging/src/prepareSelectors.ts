import { createAllSubscriptionsSelector, createVisibleSubscriptionsSelector, createGroupedSubscriptionsSelector, createTotalUnreadCountSelector } from './subscriptions/selectors';
import { createSortedCategoriesSelector } from './categories/selectors';
import type { Selectors } from './index';

export default function prepareSelectors(): Selectors {
    const sortedCategoriesSelector = createSortedCategoriesSelector();
    const allSubscriptionsSelector = createAllSubscriptionsSelector();
    const visibleSubscriptionsSelector = createVisibleSubscriptionsSelector(allSubscriptionsSelector);
    const groupedSubscriptionsSelector = createGroupedSubscriptionsSelector(visibleSubscriptionsSelector);
    const totalUnreadCountSelector = createTotalUnreadCountSelector(allSubscriptionsSelector);

    return {
        sortedCategoriesSelector,
        allSubscriptionsSelector,
        visibleSubscriptionsSelector,
        groupedSubscriptionsSelector,
        totalUnreadCountSelector
    };
}
