import React, { useMemo, useState, useDeferredValue } from 'react';

import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { SiteinfoItem, State } from 'feedpon-messaging';
import { updateSiteinfo } from 'feedpon-messaging/sharedSiteinfo';
import tryMatch from 'feedpon-utils/tryMatch';
import RelativeTime from '../components/RelativeTime';
import VirtualList, { BlankSpaces } from '../components/VirtualList';
import SharedSiteinfoItem from '../modules/SharedSiteinfoItem';

interface SharedSiteinfoProps {
  isLoading: boolean;
  items: SiteinfoItem[];
  lastUpdatedAt: number;
  onUpdateSiteinfo: typeof updateSiteinfo;
}

function SharedSiteinfoSettings({
  isLoading,
  items,
  lastUpdatedAt,
  onUpdateSiteinfo,
}: SharedSiteinfoProps) {
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
        <a target="_blank" href="http://wedata.net/">
          Wedata
        </a>
        . It uses{' '}
        <a target="_blank" href="http://wedata.net/databases/LDRFullFeed/items">
          LDRFullFeed
        </a>{' '}
        and{' '}
        <a
          target="_blank"
          href="http://wedata.net/databases/AutoPagerize/items"
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
        <div style={{ height: blankSpaces.above }}></div>
        {children}
        <div style={{ height: blankSpaces.below }}></div>
      </ul>
    </div>
  );
}

function renderSiteinfoItem(item: SiteinfoItem) {
  return <SharedSiteinfoItem key={item.id} item={item} />;
}

export default connect({
  mapStateToProps: (state: State) => ({
    isLoading: state.sharedSiteinfo.isLoading,
    items: state.sharedSiteinfo.items,
    lastUpdatedAt: state.sharedSiteinfo.lastUpdatedAt,
  }),
  mapDispatchToProps: bindActions({
    onUpdateSiteinfo: updateSiteinfo,
  }),
})(SharedSiteinfoSettings);
