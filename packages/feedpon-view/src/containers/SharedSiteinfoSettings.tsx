import React, { PureComponent } from 'react';

import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { SiteinfoItem, State } from 'feedpon-messaging';
import { updateSiteinfo } from 'feedpon-messaging/sharedSiteinfo';
import debounce from 'feedpon-utils/debounce';
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

interface SharedSiteinfoState {
  testUrl: string;
}

class SharedSiteinfoSettings extends PureComponent<
  SharedSiteinfoProps,
  SharedSiteinfoState
> {
  private inputControl: HTMLInputElement | null = null;

  constructor(props: SharedSiteinfoProps) {
    super(props);

    this.state = {
      testUrl: '',
    };

    this.handleChangeTestUrl = debounce(
      this.handleChangeTestUrl.bind(this),
      100,
    );
    this.handleInputControlRef = this.handleInputControlRef.bind(this);
  }

  handleChangeTestUrl(_event: React.ChangeEvent<HTMLInputElement>) {
    if (this.inputControl) {
      const testUrl = this.inputControl.value;

      this.setState({ testUrl });
    }
  }

  handleInputControlRef(inputControl: HTMLInputElement | null) {
    this.inputControl = inputControl;
  }

  override render() {
    const { isLoading, items, lastUpdatedAt, onUpdateSiteinfo } = this.props;
    const { testUrl } = this.state;

    const matchedItems =
      testUrl !== ''
        ? items.filter((item) => tryMatch(item.urlPattern, testUrl))
        : items;

    const lastUpdate =
      lastUpdatedAt > 0 ? (
        <p>
          <strong>{matchedItems.length}</strong> items are available. Last
          update was{' '}
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
          <a
            target="_blank"
            href="http://wedata.net/databases/LDRFullFeed/items"
          >
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
            ref={this.handleInputControlRef}
            type="search"
            className="form-control"
            placeholder="Search by url..."
            onChange={this.handleChangeTestUrl}
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
          assumedItemHeight={24 * 7}
          idAttribute="id"
          items={matchedItems}
          renderItem={renderSiteinfoItem}
          renderList={renderSiteinfoList}
        />
      </section>
    );
  }
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
