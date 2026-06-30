import { createComponent, html } from 'barebind';
import {
  type Entry,
  getEntryContent,
  getEntrySummary,
  getEntryUrl,
  parseStreamId,
} from 'feedpon-store';

import { EmbeddedHTML } from '../primitives/EmbeddedHTML.ts';
import { RelativeTime } from '../primitives/RelativeTime.ts';
import { EntryActionList } from './EntryActionList.ts';
import { EntryNav } from './EntryNav.ts';
import { FullContents } from './FullContents.ts';
import { HatenaBookmarkEntryPopover } from './HatenaBookmarkEntryPopover.ts';

interface EntryViewProps {
  entry: Entry;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  onEntryExpand: (index: number) => void;
  onFullContentsFetch: (entryId: string) => Promise<void>;
  onFullContentsToggle: (entryId: string, shown: boolean) => void;
  onHatenaBookmarkEntryFetch: (entryId: string) => Promise<void>;
  onHatenaBookmarkEntryToggle: (entryId: string, shown: boolean) => void;
}

interface FullEntryViewProps {
  entry: Entry;
  onFullContentsFetch: (entryId: string) => void;
  onFullContentsToggle: (entryId: string, shown: boolean) => void;
  onHatenaBookmarkEntryFetch: (entryId: string) => void;
  onHatenaBookmarkEntryToggle: (entryId: string, shown: boolean) => void;
}

interface CompactEntryViewProps {
  entry: Entry;
}

export const EntryView = createComponent<EntryViewProps>(function EntryView({
  entry,
  index,
  isSelected,
  isExpanded,
  onEntryExpand,
  onFullContentsFetch,
  onFullContentsToggle,
  onHatenaBookmarkEntryFetch,
  onHatenaBookmarkEntryToggle,
}) {
  const handleEntryExpand = (event: Event) => {
    const target = event.target as HTMLElement;
    if (isExpanded || target.closest('a, button') !== null) {
      return;
    }

    event.preventDefault();
    onEntryExpand(index);
  };

  return html`
    <article
      class=${{
        entry: true,
        'is-selected': isSelected,
        'is-expanded': isExpanded,
      }}
      lang=${entry.language}
      @click=${handleEntryExpand}
    >
      <${
        isExpanded
          ? FullEntryView({
              entry,
              onFullContentsFetch,
              onFullContentsToggle,
              onHatenaBookmarkEntryFetch,
              onHatenaBookmarkEntryToggle,
            })
          : CompactEntryView({
              entry,
            })
      }>
    </article>
  `;
});

const FullEntryView = createComponent<FullEntryViewProps>(
  function FullEntryView({
    entry,
    onFullContentsFetch,
    onFullContentsToggle,
    onHatenaBookmarkEntryFetch,
    onHatenaBookmarkEntryToggle,
  }) {
    this.useEffect(() => {
      if (
        entry.hatenaBookmarkEntry === undefined &&
        entry.hatenaBookmarkEntryShown
      ) {
        onHatenaBookmarkEntryFetch(entry.id);
      }
    }, [entry.hatenaBookmarkEntry, entry.hatenaBookmarkEntryShown]);

    this.useEffect(() => {
      if (entry.fullContents === undefined && entry.fullContentsShown) {
        onFullContentsFetch(entry.id);
      }
    }, [entry.fullContents, entry.fullContentsShown]);

    const handleFullContentsFetch = () => {
      onFullContentsFetch(entry.id);
    };

    const content =
      entry.fullContents !== undefined && entry.fullContentsShown
        ? FullContents({
            isLoading: entry.fullContentsLoading ?? false,
            fullContents: entry.fullContents,
            onFullContentsFetch: handleFullContentsFetch,
          })
        : EmbeddedHTML({
            html: getEntryContent(entry),
            origin: getEntryUrl(entry),
          });

    return html`
      <div class="container">
        <header class="entry-header">
          <${EntryNav({
            isFullContentsLoading:
              (entry.fullContentsShown && entry.fullContents === undefined) ||
              (entry.fullContentsLoading ?? false),
            isFullContentsShown: entry.fullContentsShown ?? false,
            onFullContentsToggle,
            entry: entry,
          })}>
          <h2 class="entry-title">
            <a
              class="link-soft"
              target="_blank"
              href=${getEntryUrl(entry)}
              rel="noreferrer"
            >
              ${entry.title || 'No Title'}
            </a>
          </h2>
          <div class="entry-metadata">
            <ul class="list-inline list-inline-dotted">
              <${renderBookmarks(entry)}>
              <${renderOrign(entry)}>
              <${renderAuthor(entry)}>
              <${renderUpdated(entry)}>
            </ul>
          </div>
        </header>
        <${content}>
        <footer class="entry-footer">
          <${EntryActionList({
            isHatenaBookmarkEntryLoading:
              entry.hatenaBookmarkEntryLoading ?? false,
            isHatenaBookmarkEntryShown: entry.hatenaBookmarkEntryShown ?? false,
            onHatenaBookmarkEntryToggle,
            entry,
          })}>
          <${
            entry.hatenaBookmarkEntryShown
              ? HatenaBookmarkEntryPopover({
                  arrowOffset: -44,
                  hatenaBookmarkEntry: entry.hatenaBookmarkEntry ?? null,
                })
              : null
          }>
        </footer>
      </div>
    `;
  },
);

const CompactEntryView = createComponent<CompactEntryViewProps>(
  function CompactEntryView({ entry }) {
    return html`
      <div class="container">
        <div class="u-flex">
          <div class="u-flex-grow-1 u-flex-truncate">
            <header class="entry-header">
              <h2 class="entry-title">
                <a
                  class="link-soft"
                  target="_blank"
                  href=${getEntryUrl(entry)}
                  rel="noreferrer"
                >
                  ${entry.title || 'No Title'}
                </a>
              </h2>
              <div class="entry-metadata">
                <ul class="list-inline list-inline-dotted">
                  <${renderBookmarks(entry)}>
                  <${renderOrign(entry)}>
                  <${renderAuthor(entry)}>
                  <${renderUpdated(entry)}>
                </ul>
              </div>
            </header>
            <div class="entry-summary">${getEntrySummary(entry)}</div>
          </div>
          <div class="entry-visual">
            <${
              entry.visual
                ? html`
                  <img
                    width=${entry.visual.width}
                    height=${entry.visual.height}
                    src=${entry.visual.edgeCacheUrl ?? entry.visual.url}
                  >
                `
                : null
            }>
          </div>
        </div>
      </div>
    `;
  },
);

function renderAuthor(entry: Entry): unknown {
  if (entry.author === undefined) {
    return html``;
  }

  return html`
    <li class="list-inline-item">
      <span>by ${entry.author}</span>
    </li>
  `;
}

function renderBookmarks(entry: Entry): unknown {
  const bookmarkCount = entry.hatenaBookmarkCount ?? 0;

  return html`
    <li class="list-inline-item">
      <a
        class=${{
          'badge badge-medium link-soft': true,
          'badge-negative': bookmarkCount >= 10,
          'u-text-negative': bookmarkCount > 0,
        }}
        target="_blank"
        href=${'https://b.hatena.ne.jp/entry/' + encodeURIComponent(getEntryUrl(entry))}
        rel="noreferrer"
      >
        <i class="icon icon-16 icon-bookmark"></i>${bookmarkCount > 0 ? bookmarkCount : ''}
      </a>
    </li>
  `;
}

function renderOrign(entry: Entry): unknown {
  const parsedId = parseStreamId(entry.originId);
  if (parsedId.type === 'feed') {
    return null;
  }

  return html`
    <li class="list-inline-item">
      <a
        class="link-strong"
        href=${`#/streams/${encodeURIComponent(entry.origin.streamId)}`}
      >
        ${entry.origin.title}
      </a>
    </li>
  `;
}

function renderUpdated(entry: Entry): unknown {
  if (entry.updated === undefined) {
    return null;
  }

  return html`
    <li class="list-inline-item">
      <${RelativeTime({ time: entry.updated })}>
    </li>
  `;
}
