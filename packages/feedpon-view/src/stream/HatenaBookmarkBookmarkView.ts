import { createComponent, type RenderContext } from 'barebind';
import type { HatenaBookmarkBookmark } from 'feedpon-store/state';

interface HatenaBookmarkBookmarkViewProps {
  bookmark: HatenaBookmarkBookmark;
}

export const HatenaBookmarkBookmarkView = createComponent(
  function HatenaBookmarkBookmarkView(
    { bookmark }: HatenaBookmarkBookmarkViewProps,
    $: RenderContext,
  ): unknown {
    return $.html`
    <div class="comment">
      <span class="comment-user">${bookmark.user}</span>
      <span class="comment-comment">${bookmark.comment}</span>
      <time class="comment-timestamp">${new Date(bookmark.timestamp).toLocaleDateString()}</time>
    </div>
  `;
  },
);
