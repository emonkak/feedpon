import { createComponent, html } from 'barebind';
import type { HatenaBookmarkBookmark } from 'feedpon-store';

interface HatenaBookmarkBookmarkViewProps {
  bookmark: HatenaBookmarkBookmark;
}

export const HatenaBookmarkBookmarkView =
  createComponent<HatenaBookmarkBookmarkViewProps>(
    function HatenaBookmarkBookmarkView({ bookmark }) {
      return html`
        <div class="comment">
          <span class="comment-user">${bookmark.user}</span>
          <span class="comment-comment">${bookmark.comment}</span>
          <time class="comment-timestamp">${new Date(bookmark.timestamp).toLocaleDateString()}</time>
        </div>
      `;
    },
  );
