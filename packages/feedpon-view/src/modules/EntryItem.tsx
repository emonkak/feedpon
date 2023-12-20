import classnames from 'classnames';
import React, { forwardRef } from 'react';

import type { Entry } from 'feedpon-messaging';
import RelativeTime from '../components/RelativeTime';
import Sandbox from '../components/Sandbox';
import useEvent from '../hooks/useEvent';
import CommentPopover from '../modules/CommentPopover';
import EntryActionList from '../modules/EntryActionList';
import EntryNav from '../modules/EntryNav';
import FullContents from '../modules/FullContents';

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
  sameOrigin: boolean;
}

interface ExpandedEntryContentProps {
  entry: Entry;
  onFetchNextFullContent: React.MouseEventHandler<any>;
  onToggleComments: React.MouseEventHandler<any>;
  onToggleFullContent: React.MouseEventHandler<any>;
  onTogglePin: React.MouseEventHandler<any>;
  sameOrigin: boolean;
}

interface CollapsedEntryContentProps {
  entry: Entry;
  sameOrigin: boolean;
}

export default forwardRef(EntryItem);

function EntryItem(
  {
    entry,
    index,
    isActive,
    isExpanded,
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
  ref: React.ForwardedRef<HTMLElement>,
) {
  const handleExpand = useEvent((event: React.MouseEvent<any>) => {
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
  });

  const handleFetchNextFullContent = useEvent(() => {
    if (!entry.fullContents.isLoaded) {
      return;
    }

    const lastFullContent =
      entry.fullContents.items[entry.fullContents.items.length - 1];

    if (lastFullContent && lastFullContent.nextPageUrl) {
      onFetchFullContent(entry.entryId, lastFullContent.nextPageUrl);
    }
  });

  const handleToggleComments = useEvent((_event: React.MouseEvent<any>) => {
    if (entry.comments.isLoaded) {
      if (entry.comments.isShown) {
        onHideComments(entry.entryId);
      } else {
        onShowComments(entry.entryId);
      }
    } else {
      onFetchComments(entry.entryId, entry.url);
    }
  });

  const handleToggleFullContent = useEvent((_event: React.MouseEvent<any>) => {
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
  });

  const handleTogglePin = useEvent((_event: React.MouseEvent<any>) => {
    if (!entry.isPinning) {
      if (entry.isPinned) {
        onUnpin(entry.entryId);
      } else {
        onPin(entry.entryId);
      }
    }
  });

  return (
    <article
      lang={entry.language || undefined}
      className={classnames('entry', {
        'is-active': isActive,
        'is-expanded': isExpanded,
        'is-marked-as-read': entry.markedAsRead,
        'is-pinned': entry.isPinned,
      })}
      onClick={handleExpand}
      ref={ref}
    >
      {isExpanded ? (
        <ExpandedEntryContent
          entry={entry}
          onFetchNextFullContent={handleFetchNextFullContent}
          onToggleComments={handleToggleComments}
          onToggleFullContent={handleToggleFullContent}
          onTogglePin={handleTogglePin}
          sameOrigin={sameOrigin}
        />
      ) : (
        <CollapsedEntryContent entry={entry} sameOrigin={sameOrigin} />
      )}
    </article>
  );
}

function ExpandedEntryContent({
  entry,
  onFetchNextFullContent,
  onToggleComments,
  onToggleFullContent,
  onTogglePin,
  sameOrigin,
}: ExpandedEntryContentProps) {
  const content =
    entry.fullContents.isShown && entry.fullContents.isLoaded ? (
      <FullContents
        isLoading={entry.fullContents.isLoading}
        isNotFound={entry.fullContents.isNotFound}
        items={entry.fullContents.items}
        onFetchNext={onFetchNextFullContent}
      />
    ) : (
      <Sandbox
        baseUrl={entry.url}
        className="entry-content u-clearfix u-text-wrap"
        html={entry.content}
      />
    );

  return (
    <div className="container">
      <header className="entry-header">
        <EntryNav
          fullContentsIsLoading={entry.fullContents.isLoading}
          fullContentsIsShown={entry.fullContents.isShown}
          isPinned={entry.isPinned}
          isPinning={entry.isPinning}
          onToggleFullContent={onToggleFullContent}
          onTogglePin={onTogglePin}
          url={entry.url}
        />
        <h2 className="entry-title">
          <a className="link-soft" target="_blank" href={entry.url}>
            {entry.title || 'No Title'}
          </a>
          {renderReadMarker(entry)}
        </h2>
        <div className="entry-metadata">
          <ul className="list-inline list-inline-dotted">
            {renderBookmarks(entry)}
            {renderOrign(entry, sameOrigin)}
            {renderAuthor(entry)}
            {renderPublishedAt(entry)}
          </ul>
        </div>
      </header>
      {content}
      <footer className="entry-footer">
        <EntryActionList
          commentsIsLoading={entry.comments.isLoading}
          commentsIsShown={entry.comments.isShown}
          onToggleComments={onToggleComments}
          title={entry.title}
          url={entry.url}
        />
        {entry.comments.isShown && (
          <CommentPopover
            arrowOffset={-44}
            isLoading={entry.comments.isLoading}
            comments={entry.comments.items}
          />
        )}
      </footer>
    </div>
  );
}

function CollapsedEntryContent({
  entry,
  sameOrigin,
}: CollapsedEntryContentProps) {
  return (
    <div className="container">
      <div className="u-flex">
        <div className="u-flex-grow-1 u-flex-truncate">
          <header className="entry-header">
            <h2 className="entry-title">
              <a className="link-soft" target="_blank" href={entry.url}>
                {entry.title || 'No Title'}
              </a>
              {renderReadMarker(entry)}
            </h2>
            <div className="entry-metadata">
              <ul className="list-inline list-inline-dotted">
                {renderBookmarks(entry)}
                {renderOrign(entry, sameOrigin)}
                {renderAuthor(entry)}
                {renderPublishedAt(entry)}
              </ul>
            </div>
          </header>
          <div className="entry-summary">{entry.summary}</div>
        </div>
        <div className="entry-visual">
          {entry.visual && <img src={entry.visual.url} />}
        </div>
      </div>
    </div>
  );
}

function renderAuthor(entry: Entry) {
  if (!entry.author) {
    return null;
  }

  return (
    <li className="list-inline-item">
      <span>by {entry.author}</span>
    </li>
  );
}

function renderBookmarks(entry: Entry) {
  return (
    <li className="list-inline-item">
      <a
        className={classnames('link-soft badge badge-medium', {
          'u-text-negative': entry.bookmarkCount > 0,
          'badge-negative': entry.bookmarkCount >= 10,
        })}
        target="_blank"
        href={'http://b.hatena.ne.jp/entry/' + encodeURIComponent(entry.url)}
      >
        <i className="icon icon-16 icon-bookmark" />
        {entry.bookmarkCount > 0 ? entry.bookmarkCount : ''}
      </a>
    </li>
  );
}

function renderOrign(entry: Entry, sameOrigin: boolean) {
  if (sameOrigin || !entry.origin) {
    return null;
  }

  return (
    <li className="list-inline-item">
      <a className="link-strong" href={entry.origin.url} target="_blank">
        {entry.origin.title}
      </a>
    </li>
  );
}

function renderPublishedAt(entry: Entry) {
  if (!entry.publishedAt) {
    return null;
  }

  return (
    <li className="list-inline-item">
      <RelativeTime time={entry.publishedAt} />
    </li>
  );
}

function renderReadMarker(entry: Entry) {
  return entry.markedAsRead ? (
    <span className="badge badge-small badge-default">READ</span>
  ) : null;
}
