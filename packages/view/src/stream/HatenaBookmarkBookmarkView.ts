import type * as hatenaBookmark from '@feedpon/hatena-bookmark-client';
import { createComponent, html } from 'barebind';

export interface HatenaBookmarkBookmarkViewProps {
  bookmark: hatenaBookmark.Bookmark;
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
