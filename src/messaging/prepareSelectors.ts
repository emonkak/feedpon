import { createAllSubscriptionsSelector, createVisibleSubscriptionsSelector, createGroupedSubscriptionsSelector, createTotalUnreadCountSelector } from 'messaging/subscriptions/selectors';
import { createSortedCategoriesSelector } from 'messaging/categories/selectors';
import { Selectors } from 'messaging/types';

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
