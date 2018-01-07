import React, { PureComponent } from 'react';
import debounce from 'lodash.debounce';

import LazyListRenderer from 'components/widgets/LazyListRenderer';
import RelativeTime from 'components/widgets/RelativeTime';
import SharedSiteinfoItem from 'components/parts/SharedSiteinfoItem';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import tryMatch from 'utils/tryMatch';
import { State, SiteinfoItem } from 'messaging/types';
import { updateSiteinfo } from 'messaging/sharedSiteinfo/actions';

interface SharedSiteinfoProps {
    isLoading: boolean;
    items: SiteinfoItem[];
    lastUpdatedAt: number;
    onUpdateSiteinfo: typeof updateSiteinfo;
}

interface SharedSiteinfoState {
    testUrl: string;
}

class SharedSiteinfoSettings extends PureComponent<SharedSiteinfoProps, SharedSiteinfoState> {
    private inputControl: HTMLInputElement | null = null;

    constructor(props: SharedSiteinfoProps, context: any) {
        super(props, context);

        this.state = {
            testUrl: ''
        };

        this.handleChangeTestUrl = debounce(this.handleChangeTestUrl.bind(this), 100);
        this.handleInputControlRef = this.handleInputControlRef.bind(this);
    }

    handleChangeTestUrl(event: React.ChangeEvent<HTMLInputElement>) {
        if (this.inputControl) {
            const testUrl = this.inputControl.value;

            this.setState({ testUrl });
        }
    }

    handleInputControlRef(inputControl: HTMLInputElement | null) {
        this.inputControl = inputControl;
    }

    render() {
        const { isLoading, items, lastUpdatedAt, onUpdateSiteinfo } = this.props;
        const { testUrl } = this.state;

        const matchedItems = testUrl !== ''
            ? items.filter((item) => tryMatch(item.urlPattern, testUrl))
            : items;

        const lastUpdate = lastUpdatedAt > 0
            ? <p><strong>{matchedItems.length}</strong> items are available. Last update was <strong><RelativeTime time={lastUpdatedAt} /></strong>.</p>
            : <p>Not update yet.</p>;

        return (
            <section className="section">
                <h2 className="display-2">Shared siteinfo</h2>
                <p>This siteinfo is shared by <a target="_blank" href="http://wedata.net/">Wedata</a>. It uses <a target="_blank" href="http://wedata.net/databases/LDRFullFeed/items">LDRFullFeed</a> and <a target="_blank" href="http://wedata.net/databases/AutoPagerize/items">AutoPagerize</a> databases for updating.</p>
                <p>
                    <input
                        ref={this.handleInputControlRef}
                        type="search"
                        className="form-control"
                        placeholder="Search by url..."
                        onChange={this.handleChangeTestUrl} />
                </p>
                {lastUpdate}
                <p>
                    <button className="button button-positive" onClick={onUpdateSiteinfo} disabled={isLoading}>
                        Update
                    </button>
                </p>
                <LazyListRenderer
                    assumedItemHeight={24 * 7}
                    idAttribute="id"
                    items={matchedItems}
                    renderItem={renderSiteinfoItem}
                    renderList={renderSiteinfoList} />
            </section>
        );
    }
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
