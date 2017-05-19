import React, { PureComponent } from 'react';
import classnames from 'classnames';

import LazyList from 'components/parts/LazyList';
import RelativeTime from 'components/parts/RelativeTime';
import SiteinfoForm from 'components/parts/SiteinfoForm';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, Siteinfo, SiteinfoItem } from 'messaging/types';
import { addSiteinfoItem, removeSiteinfoItem, updateSiteinfo } from 'messaging/siteinfo/actions';

interface UserSiteinfoItemRowProps {
    item: SiteinfoItem;
    index: number;
    onRemove: (id: string | number) => void;
}

interface SharedSiteinfoItemRowProps {
    item: SiteinfoItem;
    index: number;
}

interface SiteinfoProps {
    onAddSiteinfoItem: typeof addSiteinfoItem;
    onRemoveSiteinfoItem: typeof removeSiteinfoItem;
    onUpdateSiteinfo: typeof updateSiteinfo;
    siteinfo: Siteinfo;
}

const ASSUMED_ITEM_HEIGHT = 72;  // baseline height * 3

function getKey(item: SiteinfoItem) {
    return item.id;
}

function renderUserTable(children: React.ReactNode) {
    return (
        <table className="table table-filled">
            <thead>
                <tr>
                    <th>#</th>
                    <th style={{ width: '20%' }}>Name</th>
                    <th style={{ width: '20%' }}>URL pattern</th>
                    <th style={{ width: '20%' }}>Content path</th>
                    <th style={{ width: '20%' }}>Next link path</th>
                    <th style={{ width: '20%' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {children}
            </tbody>
        </table>
    );
}

function renderSharedTable(children: React.ReactNode, aboveSpace: number, belowSpace: number) {
    return (
        <table className="table table-filled">
            <thead>
                <tr>
                    <th>#</th>
                    <th style={{ width: '25%' }}>Name</th>
                    <th style={{ width: '25%' }}>URL pattern</th>
                    <th style={{ width: '25%' }}>Content path</th>
                    <th style={{ width: '25%' }}>Next link path</th>
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
    return <SharedSiteinfoItemRow key={item.id} item={item} index={index} />;
}

class UserSiteinfoItemRow extends PureComponent<UserSiteinfoItemRowProps, {}> {
    constructor(props: UserSiteinfoItemRowProps, context: any) {
        super(props, context);

        this.handleRemove = this.handleRemove.bind(this);
    }

    handleRemove() {
        const { item, onRemove } = this.props;

        onRemove(item.id);
    }

    render() {
        const { index, item } = this.props;

        return (
            <tr className={classnames({ 'is-even': index % 2 === 0, 'is-odd': index % 2 === 1 })}>
                <td className="u-text-nowrap">{index + 1}</td>
                <td className="u-text-wrap">{item.name}</td>
                <td className="u-text-wrap"><code>{item.urlPattern}</code></td>
                <td className="u-text-wrap"><code>{item.contentPath}</code></td>
                <td className="u-text-wrap"><code>{item.nextLinkPath}</code></td>
                <td className="u-text-nowrap"><button className="button button-outline-negative" onClick={this.handleRemove}>Remove</button></td>
            </tr>
        );
    }
}

class SharedSiteinfoItemRow extends PureComponent<SharedSiteinfoItemRowProps, {}> {
    render() {
        const { index, item } = this.props;

        return (
            <tr className={classnames({ 'is-even': index % 2 === 0, 'is-odd': index % 2 === 1 })}>
                <td className="u-text-nowrap">{index + 1}</td>
                <td className="u-text-wrap">{item.name}</td>
                <td className="u-text-wrap"><code>{item.urlPattern}</code></td>
                <td className="u-text-wrap"><code>{item.contentPath}</code></td>
                <td className="u-text-wrap"><code>{item.nextLinkPath}</code></td>
            </tr>
        );
    }
}

class SiteinfoSettings extends PureComponent<SiteinfoProps, {}> {
    constructor(props: SiteinfoProps, context: any) {
        super(props, context);

        this.renderUserItem = this.renderUserItem.bind(this);
    }

    renderUserItem(item: SiteinfoItem, index: number) {
        const { onRemoveSiteinfoItem } = this.props;

        return <UserSiteinfoItemRow key={item.id} item={item} index={index} onRemove={onRemoveSiteinfoItem} />;
    }

    render() {
        const { onAddSiteinfoItem, onUpdateSiteinfo, siteinfo } = this.props;

        const updateButton = <button className="button button-positive" onClick={onUpdateSiteinfo} disabled={siteinfo.isLoading}>
            Update siteinfo...
        </button>;

        const lastUpdate = siteinfo.lastUpdatedAt
            ? <p><strong>{siteinfo.items.length}</strong> siteinfo items are available. Last update was <strong><RelativeTime time={siteinfo.lastUpdatedAt} /></strong>.</p>
            : <p>Not update yet.</p>;

        return (
            <div>
                <section className="section">
                    <h1 className="display-1">User siteinfo</h1>
                    <SiteinfoForm onSubmit={onAddSiteinfoItem} />
                    {renderUserTable(siteinfo.userItems.map(this.renderUserItem))}
                </section>

                <section className="section">
                    <h1 className="display-1">Shared siteinfo</h1>
                    {lastUpdate}
                    <p>
                        {updateButton}
                    </p>
                    <LazyList
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
    (dispatch) => bindActions({
        onAddSiteinfoItem: addSiteinfoItem,
        onRemoveSiteinfoItem: removeSiteinfoItem,
        onUpdateSiteinfo: updateSiteinfo
    }, dispatch)
)(SiteinfoSettings);
