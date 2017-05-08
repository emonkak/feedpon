import React, { PureComponent } from 'react';
import classnames from 'classnames';

import LazyRenderer from 'components/parts/LazyRenderer';
import RelativeTime from 'components/parts/RelativeTime';
import bindAction from 'utils/bindAction';
import connect from 'utils/react/connect';
import { State, Siteinfo, SiteinfoItem } from 'messaging/types';
import { updateSiteinfo } from 'messaging/siteinfo/actions';

interface SiteinfoProps {
    onUpdateSiteinfo: () => void;
    siteinfo: Siteinfo;
}

const ASSUMED_ITEM_HEIGHT = 72;  // baseline height * 3

function getKey(item: SiteinfoItem) {
    return item.id;
}

function renderUserTable(children: React.ReactNode, aboveSpace: number, belowSpace: number) {
    return (
        <table className="table table-filled">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>URL pattern</th>
                    <th>Next link path</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr style={{ height: aboveSpace }} />
                {children}
                <tr style={{ height: belowSpace }} />
            </tbody>
        </table>
    );
}

function renderUserItem(item: SiteinfoItem, index: number) {
    return (
        <tr
            className={classnames({ 'is-even': index % 2 === 0, 'is-odd': index % 2 === 1 })}
            key={item.id}>
            <td className="u-text-nowrap">{index + 1}</td>
            <td style={{ width: '20%' }} className="u-text-wrap">{item.name}</td>
            <td style={{ width: '20%' }} className="u-text-wrap"><code>{item.urlPattern}</code></td>
            <td style={{ width: '20%' }} className="u-text-wrap"><code>{item.contentPath}</code></td>
            <td style={{ width: '20%' }} className="u-text-wrap"><code>{item.nextLinkPath}</code></td>
            <td className="u-text-nowrap"></td>
        </tr>
    );
}

function renderSharedTable(children: React.ReactNode, aboveSpace: number, belowSpace: number) {
    return (
        <table className="table table-filled">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>URL pattern</th>
                    <th>Next link path</th>
                </tr>
            </thead>
            <tbody>
                <tr style={{ height: aboveSpace }} />
                {children}
                <tr style={{ height: belowSpace }} />
            </tbody>
        </table>
    );
}

function renderSharedItem(item: SiteinfoItem, index: number) {
    return (
        <tr
            className={classnames({ 'is-even': index % 2 === 0, 'is-odd': index % 2 === 1 })}
            key={item.id}>
            <td className="u-text-nowrap">{index + 1}</td>
            <td style={{ width: '25%' }} className="u-text-wrap">{item.name}</td>
            <td style={{ width: '25%' }} className="u-text-wrap"><code>{item.urlPattern}</code></td>
            <td style={{ width: '25%' }} className="u-text-wrap"><code>{item.contentPath}</code></td>
            <td style={{ width: '25%' }} className="u-text-wrap"><code>{item.nextLinkPath}</code></td>
        </tr>
    );
}

class SiteinfoSettings extends PureComponent<SiteinfoProps, {}> {
    render() {
        const { onUpdateSiteinfo, siteinfo } = this.props;

        const updateButton = <button className="button button-positive" onClick={onUpdateSiteinfo} disabled={siteinfo.isLoading}>
            Update siteinfo...
        </button>;

        return (
            <div>
                <section className="section">
                    <h1>User siteinfo</h1>
                    <LazyRenderer
                        assumedItemHeight={ASSUMED_ITEM_HEIGHT}
                        getKey={getKey}
                        items={siteinfo.userItems}
                        renderItem={renderUserItem}
                        renderList={renderUserTable} />
                </section>

                <section className="section">
                    <h1>Shared siteinfo</h1>
                    <p>
                        <strong>{siteinfo.items.length}</strong> siteinfo items are available.
                        They are updated at <strong><RelativeTime time={siteinfo.lastUpdatedAt} /></strong>.
                    </p>
                    <p>
                        {updateButton}
                    </p>
                    <LazyRenderer
                        assumedItemHeight={ASSUMED_ITEM_HEIGHT}
                        getKey={getKey}
                        items={siteinfo.items}
                        renderItem={renderSharedItem}
                        renderList={renderSharedTable} />
                    <p>
                        {updateButton}
                    </p>
                </section>
            </div>
        );
    }
}

export default connect(
    (state: State) => ({
        siteinfo: state.siteinfo
    }),
    (dispatch) => ({
        onUpdateSiteinfo: bindAction(updateSiteinfo, dispatch)
    })
)(SiteinfoSettings);
