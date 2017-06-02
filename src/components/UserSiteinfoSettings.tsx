import React, { PureComponent } from 'react';

import ConfirmButton from 'components/parts/ConfirmButton';
import Modal from 'components/parts/Modal';
import SiteinfoForm from 'components/parts/SiteinfoForm';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, SiteinfoItem } from 'messaging/types';
import { addSiteinfoItem, removeSiteinfoItem, updateSiteinfoItem } from 'messaging/siteinfo/actions';

interface UserSiteinfoProps {
    items: SiteinfoItem[];
    onAddSiteinfoItem: typeof addSiteinfoItem;
    onRemoveSiteinfoItem: typeof removeSiteinfoItem;
    onUpdateSiteinfoItem: typeof updateSiteinfoItem;
}

interface UserSiteinfoItemProps {
    item: SiteinfoItem;
    onRemove: typeof removeSiteinfoItem;
    onUpdate: typeof updateSiteinfoItem;
}

interface UserSiteinfoItemState {
    isEditing: boolean;
}

class UserSiteinfoSettings extends PureComponent<UserSiteinfoProps, {}> {
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
        const { onAddSiteinfoItem, items } = this.props;

        return (
            <section className="section">
                <h2 className="display-2">User siteinfo</h2>
                <p>This siteinfo is for user only.</p>
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
                            {items.map(this.renderUserItem, this)}
                        </tbody>
                    </table>
                </div>
            </section>
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

export default connect(
    (state: State) => ({
        items: state.siteinfo.userItems
    }),
    (dispatch) => bindActions({
        onAddSiteinfoItem: addSiteinfoItem,
        onRemoveSiteinfoItem: removeSiteinfoItem,
        onUpdateSiteinfoItem: updateSiteinfoItem
    }, dispatch)
)(UserSiteinfoSettings);
