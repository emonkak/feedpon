import { createComponent, type RenderContext } from 'barebind';
import type {
  Category,
  Feed,
  SearchResult,
  Subscription,
} from 'feedpon-store/state';
import { SubscriptionSettingsDropdown } from '../subscription/SubscriptionSettingsDropdown.ts';

interface SearchResultViewProps {
  categories: Category[];
  searchResult: SearchResult;
  onCategoryCreate: (label: string) => Promise<void>;
  onSubscriptionCreate: (feed: Feed, labels: string[]) => Promise<void>;
  onSubscriptionDelete: (subscriptionId: string) => Promise<void>;
  onSubscriptionUpdate: (
    subscriptionId: string,
    labels: string[],
  ) => Promise<void>;
  subscription: Subscription | null;
}

export const SearchResultView = createComponent(function SearchResultView(
  {
    categories,
    searchResult,
    onCategoryCreate,
    onSubscriptionCreate,
    onSubscriptionDelete,
    onSubscriptionUpdate,
    subscription,
  }: SearchResultViewProps,
  $: RenderContext,
): unknown {
  return $.html`
    <li class="list-group-item">
      <div class="u-flex u-flex-justify-content-between u-flex-align-items-center">
        <div class="u-flex-grow-1 u-margin-right-2">
          <a
            class="link-strong"
            href=${`#/streams/${encodeURIComponent(searchResult.feedId)}`}
          >
            ${searchResult.title}
          </a>
          <div class="u-text-7">
            <strong>${searchResult.subscribers}</strong> subscribers
          </div>
          <div class="u-text-muted">${searchResult.description}</div>
        </div>
        <${SubscriptionSettingsDropdown({
          categories,
          feed: { id: searchResult.feedId, ...searchResult },
          onCategoryCreate,
          onSubscriptionCreate,
          onSubscriptionDelete,
          onSubscriptionUpdate,
          subscription,
        })}>
      </div>
    </li>
  `;
});
