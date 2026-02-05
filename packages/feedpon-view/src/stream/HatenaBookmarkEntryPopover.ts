import { createComponent, type RenderContext, Repeat } from 'barebind';
import type { HatenaBookmarkEntry } from 'feedpon-store';

import { HatenaBookmarkBookmarkView } from './HatenaBookmarkBookmarkView.ts';

interface HatenaBookmarkEntryPopoverProps {
  arrowOffset: number;
  hatenaBookmarkEntry: HatenaBookmarkEntry | null | undefined;
}

export const HatenaBookmarkEntryPopover = createComponent(
  function HatenaBookmarkEntryPopover(
    { arrowOffset, hatenaBookmarkEntry }: HatenaBookmarkEntryPopoverProps,
    $: RenderContext,
  ): unknown {
    const bookmarks =
      hatenaBookmarkEntry != null
        ? (hatenaBookmarkEntry?.bookmarks?.filter(
            (bookmark) => bookmark.comment !== '',
          ) ?? [])
        : null;

    const content =
      bookmarks === null
        ? $.html`
          <div class="comment">
            <span class="comment-user">
              <span class="placeholder placeholder-10 animation-shining"></span>
            </span>
            <span class="comment-comment">
              <span class="placeholder placeholder-60 animation-shining"></span>
            </span>
            <span class="comment-timestamp">
              <span class="placeholder placeholder-20 animation-shining"></span>
            </span>
          </div>
        `
        : bookmarks.length > 0
          ? Repeat({
              elementSelector: (bookmark) =>
                HatenaBookmarkBookmarkView({ bookmark }),
              source: bookmarks,
            })
          : $.html`No comments yet in this entry.`;

    return $.html`
      <div class="popover popover-default is-pull-down">
        <div class="popover-arrow" :style=${{ left: `calc(50% - ${arrowOffset}px)` }}></div>
        <div class="popover-content"><${content}></div>
      </div>
    `;
  },
);
