import React, { useMemo, useState, useDeferredValue } from 'react';

import { bindActions } from 'feedpon-flux';
import { useStore } from 'feedpon-flux/react';
import type { SiteinfoItem, State } from 'feedpon-messaging';
import { updateSiteinfo } from 'feedpon-messaging/sharedSiteinfo';
import tryMatch from 'feedpon-utils/tryMatch';
import RelativeTime from '../components/RelativeTime';
import VirtualList, { type BlankSpaces } from '../components/VirtualList';
import SharedSiteinfoItem from '../modules/SharedSiteinfoItem';

export interface SharedSiteinfoProps {}

export function SharedSiteinfoSettings(_props: SharedSiteinfoProps) {
  const { isLoading, items, lastUpdatedAt, onUpdateSiteinfo } = useStore({
    mapStateToProps: (state: State) => ({
      isLoading: state.sharedSiteinfo.isLoading,
      items: state.sharedSiteinfo.items,
      lastUpdatedAt: state.sharedSiteinfo.lastUpdatedAt,
    }),
    mapDispatchToProps: bindActions({
      onUpdateSiteinfo: updateSiteinfo,
    }),
  });

  const [testUrl, setTestUrl] = useState('');
  const defferedTestUrl = useDeferredValue(testUrl);

  const matchedItems = useMemo(
    () =>
      defferedTestUrl !== ''
        ? items.filter((item) => tryMatch(item.urlPattern, defferedTestUrl))
        : items,
    [defferedTestUrl],
  );

  const handleChangeTestUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTestUrl = event.target.value;
    setTestUrl(newTestUrl);
  };

  const lastUpdate =
    lastUpdatedAt > 0 ? (
      <p>
        <strong>{matchedItems.length}</strong> items are available. Last update
        was{' '}
        <strong>
          <RelativeTime time={lastUpdatedAt} />
        </strong>
        .
      </p>
    ) : (
      <p>Not update yet.</p>
    );

  return (
    <section className="section">
      <h2 className="display-2">Shared siteinfo</h2>
      <p>
        This siteinfo is shared by{' '}
        <a target="_blank" href="http://wedata.net/" rel="noreferrer">
          Wedata
        </a>
        . It uses{' '}
        <a
          target="_blank"
          href="http://wedata.net/databases/LDRFullFeed/items"
          rel="noreferrer"
        >
          LDRFullFeed
        </a>{' '}
        and{' '}
        <a
          target="_blank"
          href="http://wedata.net/databases/AutoPagerize/items"
          rel="noreferrer"
        >
          AutoPagerize
        </a>{' '}
        databases for updating.
      </p>
      <p>
        <input
          type="search"
          className="form-control"
          placeholder="Search by url..."
          onChange={handleChangeTestUrl}
        />
      </p>
      {lastUpdate}
      <p>
        <button
          type="button"
          className="button button-positive"
          onClick={onUpdateSiteinfo}
          disabled={isLoading}
        >
          Update
        </button>
      </p>
      <VirtualList
        assumedItemSize={24 * 7}
        idAttribute="id"
        items={matchedItems}
        renderItem={renderSiteinfoItem}
        renderList={renderSiteinfoList}
      />
    </section>
  );
}

function renderSiteinfoList(
  children: React.ReactNode,
  blankSpaces: BlankSpaces,
) {
  return (
    <div className="u-responsive">
      <ul className="list-group">
        <div style={{ height: blankSpaces.above }} />
        {children}
        <div style={{ height: blankSpaces.below }} />
      </ul>
    </div>
  );
}

function renderSiteinfoItem(item: SiteinfoItem) {
  return <SharedSiteinfoItem key={item.id} item={item} />;
}
