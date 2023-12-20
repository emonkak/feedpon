import React from 'react';

import useEvent from '../hooks/useEvent';

interface StreamFooterProps {
  canMarkAllEntriesAsRead: boolean;
  hasMoreEntries: boolean;
  isLoading: boolean;
  onLoadMoreEntries: () => void;
  onMarkAllEntiresAsRead: () => void;
}

export default function StreamFooter({
  canMarkAllEntriesAsRead,
  hasMoreEntries,
  isLoading,
  onMarkAllEntiresAsRead,
  onLoadMoreEntries,
}: StreamFooterProps) {
  const handleLoadMoreEntries = useEvent((event: React.MouseEvent<unknown>) => {
    event.preventDefault();

    onLoadMoreEntries();
  });

  if (hasMoreEntries) {
    if (isLoading) {
      return (
        <footer className="stream-footer">
          <i className="icon icon-32 icon-spinner animation-rotating" />
        </footer>
      );
    } else {
      return (
        <footer className="stream-footer">
          <a className="link-strong" href="#" onClick={handleLoadMoreEntries}>
            Load more entries...
          </a>
        </footer>
      );
    }
  } else {
    return (
      <footer className="stream-footer">
        <p>No more entries here.</p>
        <p>
          <button
            className="button button-positive"
            onClick={onMarkAllEntiresAsRead}
            disabled={!canMarkAllEntriesAsRead}
          >
            Mark all entries as read
          </button>
        </p>
      </footer>
    );
  }
}
