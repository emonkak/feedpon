import React, { PureComponent } from 'react';

import ConfirmButton from 'components/parts/ConfirmButton';
import LazyList from 'components/parts/LazyList';
import Modal from 'components/parts/Modal';
import RelativeTime from 'components/parts/RelativeTime';
import SiteinfoForm from 'components/parts/SiteinfoForm';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, Siteinfo, SiteinfoItem } from 'messaging/types';
import { addSiteinfoItem, removeSiteinfoItem, updateSiteinfo, updateSiteinfoItem } from 'messaging/siteinfo/actions';

interface SiteinfoProps {
    onAddSiteinfoItem: typeof addSiteinfoItem;
    onRemoveSiteinfoItem: typeof removeSiteinfoItem;
    onUpdateSiteinfo: typeof updateSiteinfo;
    onUpdateSiteinfoItem: typeof updateSiteinfoItem;
    siteinfo: Siteinfo;
}

interface UserSiteinfoItemProps {
    item: SiteinfoItem;
    onRemove: typeof removeSiteinfoItem;
    onUpdate: typeof updateSiteinfoItem;
}

interface UserSiteinfoItemState {
    isEditing: boolean;
}

interface SharedSiteinfoItemRowProps {
    item: SiteinfoItem;
}

const ASSUMED_ITEM_HEIGHT = 24 * 7;

class SiteinfoSettings extends PureComponent<SiteinfoProps, {}> {
    constructor(props: SiteinfoProps, context: any) {
        super(props, context);
    }

    renderUserItem(item: SiteinfoItem) {
        const { onRemoveSiteinfoItem, onUpdateSiteinfoItem } = this.props;

        return (
            <UserSiteinfoItem
                key={item.id}
                item={item}
                onRemove={onRemoveSiteinfoItem}
                onUpdate={onUpdateSiteinfoItem} />
        );
    }

    render() {
        const { onAddSiteinfoItem, onUpdateSiteinfo, siteinfo } = this.props;

        const updateButton = <button className="button button-positive" onClick={onUpdateSiteinfo} disabled={siteinfo.isLoading}>
            Update siteinfo...
        </button>;

        const lastUpdate = siteinfo.lastUpdatedAt > 0
            ? <p><strong>{siteinfo.items.length}</strong> siteinfo items are available. Last update was <strong><RelativeTime time={siteinfo.lastUpdatedAt} /></strong>.</p>
            : <p>Not update yet.</p>;

        return (
            <div>
                <section className="section">
                    <h1 className="display-1">User siteinfo</h1>
                    <div className="well">
                        <SiteinfoForm legend="New item" onSubmit={onAddSiteinfoItem}>
                            <button className="button button-outline-positive" type="submit">Add</button>
                        </SiteinfoForm>
                    </div>
                    <div className="u-responsive">
                        <table className="table table-filled">
                            <thead>
                                <tr>
                                    <th className="u-text-nowrap" style={{ width: '35%' }}>Name</th>
                                    <th className="u-text-nowrap" style={{ width: '20%' }}>URL pattern</th>
                                    <th className="u-text-nowrap" style={{ width: '15%' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {siteinfo.userItems.map(this.renderUserItem, this)}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className="section">
                    <h1 className="display-1">Shared siteinfo</h1>
                    {lastUpdate}
                    <p>{updateButton}</p>
                    <div className="u-responsive">
                        <LazyList
                            assumedItemHeight={ASSUMED_ITEM_HEIGHT}
                            getKey={getKey}
                            items={siteinfo.items}
                            renderItem={renderSharedItem}
                            renderList={renderSharedTable} />
                    </div>
                    <p>{updateButton}</p>
                </section>
            </div>
        );
    }
}

class UserSiteinfoItem extends PureComponent<UserSiteinfoItemProps, UserSiteinfoItemState> {
    constructor(props: UserSiteinfoItemProps, context: any) {
        super(props, context);

        this.handleCancelEditing = this.handleCancelEditing.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleSave = this.handleSave.bind(this);

        this.state = {
            isEditing: false
        };
    }

    handleEdit() {
        this.setState({ isEditing: true });
    }

    handleCancelEditing() {
        this.setState({ isEditing: false });
    }

    handleRemove() {
        const { item, onRemove } = this.props;

        onRemove(item.id);
    }

    handleSave(item: SiteinfoItem) {
        const { onUpdate } = this.props;

        onUpdate(item);

        this.setState({ isEditing: false });
    }

    render() {
        const { item } = this.props;
        const { isEditing } = this.state;

        return (
            <tr>
                <td>{item.name}</td>
                <td><code>{item.urlPattern}</code></td>
                <td>
                    <div className="button-toolbar u-text-nowrap">
                        <button className="button button-outline-default" onClick={this.handleEdit}>
                            <i className="icon icon-16 icon-edit" />
                        </button>
                        <ConfirmButton
                            className="button button-outline-negative"
                            message="Are you sure you want to delete this item?"
                            okClassName="button-outline-negative"
                            okLabel="Delete"
                            onConfirm={this.handleRemove}
                            title={`Delete "${item.name}"`}>
                            <i className="icon icon-16 icon-trash" />
                        </ConfirmButton>
                    </div>
                    <Modal isOpened={isEditing} onClose={this.handleCancelEditing}>
                        <SiteinfoForm
                            legend="Edit existing item"
                            item={item}
                            onSubmit={this.handleSave}>
                            <div className="button-toolbar">
                                <button className="button button-outline-positive" type="submit">Save</button>
                                <button className="button button-outline-default" onClick={this.handleCancelEditing}>Cancel</button>
                            </div>
                        </SiteinfoForm>
                    </Modal>
                </td>
            </tr>
        );
    }
}

class SharedSiteinfoItem extends PureComponent<SharedSiteinfoItemRowProps, {}> {
    render() {
        const { item } = this.props;

        return (
            <li className="list-group-item">
                <div>
                    <div><strong>{item.name}</strong></div>
                    <dl className="u-margin-remove">
                        <dt>URL pattern</dt>
                        <dd><code>{item.urlPattern}</code></dd>
                        <dt>Content expression</dt>
                        <dd><code>{item.contentExpression}</code></dd>
                        <dt>Next link expression</dt>
                        <dd><code>{item.nextLinkExpression}</code></dd>
                    </dl>
                </div>
            </li>
        );
    }
}

function getKey(item: SiteinfoItem) {
    return item.id;
}

function renderSharedTable(children: React.ReactNode, aboveSpace: number, belowSpace: number) {
    return (
        <ul className="list-group" style={{ paddingTop: aboveSpace, paddingBottom: belowSpace }}>
            {children}
        </ul>
    );
}

function renderSharedItem(item: SiteinfoItem) {
    return <SharedSiteinfoItem key={item.id} item={item} />;
}

export default connect(
    (state: State) => ({
        siteinfo: state.siteinfo
    }),
    (dispatch) => bindActions({
        onAddSiteinfoItem: addSiteinfoItem,
        onRemoveSiteinfoItem: removeSiteinfoItem,
        onUpdateSiteinfo: updateSiteinfo,
        onUpdateSiteinfoItem: updateSiteinfoItem
    }, dispatch)
)(SiteinfoSettings);
