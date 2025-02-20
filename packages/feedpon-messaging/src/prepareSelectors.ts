import { createSortedCategoriesSelector } from './categories/selectors.ts';
import {
  createAllSubscriptionsSelector,
  createGroupedSubscriptionsSelector,
  createTotalUnreadCountSelector,
  createVisibleSubscriptionsSelector,
} from './subscriptions/selectors.ts';
import type { Selectors } from './types.ts';

export function prepareSelectors(): Selectors {
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
