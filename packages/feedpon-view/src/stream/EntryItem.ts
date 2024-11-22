import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  type ElementRef,
  classMap,
  component,
  optional,
  ref,
} from '@emonkak/ebit/directives.js';
import type { Entry } from 'feedpon-messaging';

import { EmbeddedHTML } from '../common/components/EmbeddedHTML';
import { RelativeTime } from '../common/components/RelativeTime';
import { CommentPopover } from './CommentPopover';
import { EntryActionList } from './EntryActionList';
import { EntryNav } from './EntryNav';
import { FullContents } from './FullContents';

interface EntryItemProps {
  entry: Entry;
  index: number;
  isActive: boolean;
  isExpanded: boolean;
  onExpand: (index: number) => void;
  onFetchComments: (entryId: string | number, url: string) => void;
  onFetchFullContent: (entryId: string | number, url: string) => void;
  onHideComments: (entryId: string | number) => void;
  onHideFullContents: (entryId: string | number) => void;
  onPin: (entryId: string | number) => void;
  onShowComments: (entryId: string | number) => void;
  onShowFullContents: (entryId: string | number) => void;
  onUnpin: (entryId: string | number) => void;
  ref: ElementRef;
  sameOrigin: boolean;
}

interface ExpandedEntryContentProps {
  entry: Entry;
  onFetchNextFullContent: (event: Event) => void;
  onToggleComments: (event: Event) => void;
  onToggleFullContent: (event: Event) => void;
  onTogglePin: (event: Event) => void;
  sameOrigin: boolean;
}

interface CollapsedEntryContentProps {
  entry: Entry;
  sameOrigin: boolean;
}

export function EntryItem(
  {
    entry,
    index,
    isActive,
    isExpanded,
    ref: elementRef,
    onExpand,
    onFetchComments,
    onFetchFullContent,
    onHideComments,
    onHideFullContents,
    onPin,
    onShowComments,
    onShowFullContents,
    onUnpin,
    sameOrigin,
  }: EntryItemProps,
  context: RenderContext,
): TemplateResult {
  const handleExpand = context.useCallback(
    (event: Event) => {
      if (isExpanded) {
        return;
      }

      const target = event.target as HTMLElement;

      if (
        target === event.currentTarget ||
        (!target.closest('a') && !target.closest('button'))
      ) {
        event.preventDefault();

        onExpand(index);
      }
    },
    [isExpanded, onExpand],
  );

  const handleFetchNextFullContent = context.useCallback(() => {
    if (!entry.fullContents.isLoaded) {
      return;
    }

    const lastFullContent =
      entry.fullContents.items[entry.fullContents.items.length - 1];

    if (lastFullContent?.nextPageUrl) {
      onFetchFullContent(entry.entryId, lastFullContent.nextPageUrl);
    }
  }, [entry, onFetchFullContent]);

  const handleToggleComments = context.useCallback(
    (_event: Event) => {
      if (entry.comments.isLoaded) {
        if (entry.comments.isShown) {
          onHideComments(entry.entryId);
        } else {
          onShowComments(entry.entryId);
        }
      } else {
        onFetchComments(entry.entryId, entry.url);
      }
    },
    [entry, onHideComments, onShowComments, onFetchComments],
  );

  const handleToggleFullContent = context.useCallback(
    (_event: Event) => {
      if (entry.fullContents.isLoading) {
        return;
      }

      if (!entry.fullContents.isLoaded) {
        onFetchFullContent(entry.entryId, entry.url);
      }

      if (entry.fullContents.isShown) {
        onHideFullContents(entry.entryId);
      } else {
        onShowFullContents(entry.entryId);
      }
    },
    [entry, onFetchFullContent, onHideFullContents, onShowFullContents],
  );

  const handleTogglePin = context.useCallback(
    (_event: Event) => {
      if (!entry.isPinning) {
        if (entry.isPinned) {
          onUnpin(entry.entryId);
        } else {
          onPin(entry.entryId);
        }
      }
    },
    [entry, onUnpin, onPin],
  );

  return context.html`
    <article
      lang=${entry.language}
      class=${classMap({
        entry: true,
        'is-active': isActive,
        'is-expanded': isExpanded,
        'is-marked-as-read': entry.markedAsRead,
        'is-pinned': entry.isPinned,
      })}
      @click=${handleExpand}
      ref=${ref(elementRef)}
    >
      <${
        isExpanded
          ? component(ExpandedEntryContent, {
              entry: entry,
              onFetchNextFullContent: handleFetchNextFullContent,
              onToggleComments: handleToggleComments,
              onToggleFullContent: handleToggleFullContent,
              onTogglePin: handleTogglePin,
              sameOrigin: sameOrigin,
            })
          : component(CollapsedEntryContent, {
              entry,
              sameOrigin,
            })
      }>
    </article>
  `;
}

function ExpandedEntryContent(
  {
    entry,
    onFetchNextFullContent,
    onToggleComments,
    onToggleFullContent,
    onTogglePin,
    sameOrigin,
  }: ExpandedEntryContentProps,
  context: RenderContext,
): TemplateResult {
  const content =
    entry.fullContents.isShown && entry.fullContents.isLoaded
      ? component(FullContents, {
          isLoading: entry.fullContents.isLoading,
          isNotFound: entry.fullContents.isNotFound,
          items: entry.fullContents.items,
          onFetchNext: onFetchNextFullContent,
        })
      : component(EmbeddedHTML, {
          baseUrl: entry.url,
          class: 'entry-content u-clearfix u-text-wrap',
          html: entry.content,
        });

  return context.html`
    <div class="container">
      <header class="entry-header">
        <${component(EntryNav, {
          fullContentsIsLoading: entry.fullContents.isLoading,
          fullContentsIsShown: entry.fullContents.isShown,
          isPinned: entry.isPinned,
          isPinning: entry.isPinning,
          onToggleFullContent,
          onTogglePin,
          url: entry.url,
        })}>
        <h2 class="entry-title">
          <a
            class="link-soft"
            target="_blank"
            href=${entry.url}
            rel="noreferrer"
          >
            ${entry.title || 'No Title'}
          </a>
          <${renderReadMarker(entry, context)}>
        </h2>
        <div class="entry-metadata">
          <ul class="list-inline list-inline-dotted">
            <${renderBookmarks(entry, context)}>
            <${renderOrign(entry, sameOrigin, context)}>
            <${renderAuthor(entry, context)}>
            <${renderPublishedAt(entry, context)}>
          </ul>
        </div>
      </header>
      <${content}>
      <footer class="entry-footer">
        <${component(EntryActionList, {
          commentsIsLoading: entry.comments.isLoading,
          commentsIsShown: entry.comments.isShown,
          onToggleComments,
          title: entry.title,
          url: entry.url,
        })}>
        <${optional(
          entry.comments.isShown
            ? component(CommentPopover, {
                arrowOffset: -44,
                isLoading: entry.comments.isLoading,
                comments: entry.comments.items,
              })
            : null,
        )}>
      </footer>
    </div>
  `;
}

function CollapsedEntryContent(
  { entry, sameOrigin }: CollapsedEntryContentProps,
  context: RenderContext,
): TemplateResult {
  return context.html`
    <div class="container">
      <div class="u-flex">
        <div class="u-flex-grow-1 u-flex-truncate">
          <header class="entry-header">
            <h2 class="entry-title">
              <a
                class="link-soft"
                target="_blank"
                href=${entry.url}
                rel="noreferrer"
              >
                ${entry.title || 'No Title'}
              </a>
              <${renderReadMarker(entry, context)}>
            </h2>
            <div class="entry-metadata">
              <ul class="list-inline list-inline-dotted">
                <${renderBookmarks(entry, context)}>
                <${renderOrign(entry, sameOrigin, context)}>
                <${renderAuthor(entry, context)}>
                <${renderPublishedAt(entry, context)}>
              </ul>
            </div>
          </header>
          <div class="entry-summary">${entry.summary}</div>
        </div>
        <div class="entry-visual">
          <${optional(
            entry.visual
              ? context.html`<img width=${entry.visual.width} height=${entry.visual.height} src=${entry.visual.url}>`
              : null,
          )}>
        </div>
      </div>
    </div>
  `;
}

function renderAuthor(entry: Entry, context: RenderContext): TemplateResult {
  if (!entry.author) {
    return context.html``;
  }

  return context.html`
    <li class="list-inline-item">
      <span>by ${entry.author}</span>
    </li>
  `;
}

function renderBookmarks(entry: Entry, context: RenderContext): TemplateResult {
  return context.html`
    <li class="list-inline-item">
      <a
        class=${classMap({
          badge: true,
          'badge-medium': true,
          'badge-negative': entry.bookmarkCount >= 10,
          'link-soft': true,
          'u-text-negative': entry.bookmarkCount > 0,
        })}
        target="_blank"
        href=${'https://b.hatena.ne.jp/entry/' + encodeURIComponent(entry.url)}
        rel="noreferrer"
      >
        <i class="icon icon-16 icon-bookmark"></i>${entry.bookmarkCount > 0 ? entry.bookmarkCount : ''}
      </a>
    </li>
  `;
}

function renderOrign(
  entry: Entry,
  sameOrigin: boolean,
  context: RenderContext,
): TemplateResult {
  if (sameOrigin || !entry.origin) {
    return context.html``;
  }

  return context.html`
    <li class="list-inline-item">
      <a
        class="link-strong"
        href=${entry.origin.url}
        target="_blank"
        rel="noreferrer"
      >
        ${entry.origin.title}
      </a>
    </li>
  `;
}

function renderPublishedAt(
  entry: Entry,
  context: RenderContext,
): TemplateResult {
  if (!entry.publishedAt) {
    return context.html``;
  }

  return context.html`
    <li class="list-inline-item">
      <${component(RelativeTime, { time: entry.publishedAt })}>
    </li>
  `;
}

function renderReadMarker(
  entry: Entry,
  context: RenderContext,
): TemplateResult {
  return entry.markedAsRead
    ? context.html`<span class="badge badge-small badge-default">READ</span>`
    : context.html``;
}
