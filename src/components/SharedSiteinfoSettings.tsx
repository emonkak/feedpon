import React, { PureComponent } from 'react';

import LazyList from 'components/parts/LazyList';
import RelativeTime from 'components/parts/RelativeTime';
import SharedSiteinfoItem from 'components/parts/SharedSiteinfoItem';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, SiteinfoItem } from 'messaging/types';
import { updateSiteinfo } from 'messaging/sharedSiteinfo/actions';

interface SharedSiteinfoProps {
    isLoading: boolean;
    items: SiteinfoItem[];
    lastUpdatedAt: number;
    onUpdateSiteinfo: typeof updateSiteinfo;
}

class SharedSiteinfoSettings extends PureComponent<SharedSiteinfoProps, {}> {
    render() {
        const { isLoading, items, lastUpdatedAt, onUpdateSiteinfo } = this.props;

        const lastUpdate = lastUpdatedAt > 0
            ? <p><strong>{items.length}</strong> items are available. Last update was <strong><RelativeTime time={lastUpdatedAt} /></strong>.</p>
            : <p>Not update yet.</p>;

        return (
            <section className="section">
                <h2 className="display-2">Shared siteinfo</h2>
                <p>This siteinfo is shared by <a target="_blank" href="http://wedata.net/">Wedata</a>. It uses <a target="_blank" href="http://wedata.net/databases/LDRFullFeed/items">LDRFullFeed</a> and <a target="_blank" href="http://wedata.net/databases/AutoPagerize/items">AutoPagerize</a> databases for updating.</p>
                {lastUpdate}
                <p>
                    <button className="button button-positive" onClick={onUpdateSiteinfo} disabled={isLoading}>
                        Update
                    </button>
                </p>
                <LazyList
                    assumedItemHeight={24 * 7}
                    getKey={getSiteinfoItemKey}
                    items={items}
                    renderItem={renderSiteinfoItem}
                    renderList={renderSiteinfoList} />
            </section>
        );
    }
}

function getSiteinfoItemKey(item: SiteinfoItem) {
    return item.id;
}

function renderSiteinfoList(children: React.ReactNode, aboveSpace: number, belowSpace: number) {
    return (
        <div className="u-responsive">
            <ul className="list-group" style={{ paddingTop: aboveSpace, paddingBottom: belowSpace }}>
                {children}
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
        lastUpdatedAt: state.sharedSiteinfo.lastUpdatedAt
    }),
    mapDispatchToProps: bindActions({
        onUpdateSiteinfo: updateSiteinfo
    })
})(SharedSiteinfoSettings);
