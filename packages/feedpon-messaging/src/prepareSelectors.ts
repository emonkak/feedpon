import { createSortedCategoriesSelector } from './categories/selectors';
import type { Selectors } from './index';
import {
  createAllSubscriptionsSelector,
  createGroupedSubscriptionsSelector,
  createTotalUnreadCountSelector,
  createVisibleSubscriptionsSelector,
} from './subscriptions/selectors';

export default function prepareSelectors(): Selectors {
  const sortedCategoriesSelector = createSortedCategoriesSelector();
  const allSubscriptionsSelector = createAllSubscriptionsSelector();
  const visibleSubscriptionsSelector = createVisibleSubscriptionsSelector(
    allSubscriptionsSelector,
  );
  const groupedSubscriptionsSelector = createGroupedSubscriptionsSelector(
    visibleSubscriptionsSelector,
  );
  const totalUnreadCountSelector = createTotalUnreadCountSelector(
    allSubscriptionsSelector,
  );

  return {
    sortedCategoriesSelector,
    allSubscriptionsSelector,
    visibleSubscriptionsSelector,
    groupedSubscriptionsSelector,
    totalUnreadCountSelector,
  };
}
