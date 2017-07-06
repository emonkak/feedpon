import React, { PureComponent } from 'react';

import ConfirmModal from 'components/parts/ConfirmModal';
import Modal from 'components/parts/Modal';
import ModalButton from 'components/parts/ModalButton';
import UserSiteinfoForm from 'components/parts/UserSiteinfoForm';
import { SiteinfoItem } from 'messaging/types';
import { removeSiteinfoItem, updateSiteinfoItem } from 'messaging/userSiteinfo/actions';

interface UserSiteinfoItemProps {
    item: SiteinfoItem;
    onRemove: typeof removeSiteinfoItem;
    onUpdate: typeof updateSiteinfoItem;
}

interface UserSiteinfoItemState {
    isEditing: boolean;
}

export default class UserSiteinfoItem extends PureComponent<UserSiteinfoItemProps, UserSiteinfoItemState> {
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
                        <ModalButton
                            modal={
                                <ConfirmModal
                                    message="Are you sure you want to delete this item?"
                                    confirmButtonClassName="button button-outline-negative"
                                    confirmButtonLabel="Delete"
                                    onConfirm={this.handleRemove}
                                    title={`Delete "${item.name}"`} />
                            }
                            button={
                                <button
                                    className="button button-outline-negative">
                                    <i className="icon icon-16 icon-trash" />
                                </button>
                            } />
                    </div>
                    <Modal isOpened={isEditing} onClose={this.handleCancelEditing}>
                        <UserSiteinfoForm
                            legend="Edit existing item"
                            item={item}
                            onSubmit={this.handleSave}>
                            <div className="button-toolbar">
                                <button className="button button-outline-positive" type="submit">Save</button>
                                <button className="button button-outline-default" onClick={this.handleCancelEditing}>Cancel</button>
                            </div>
                        </UserSiteinfoForm>
                    </Modal>
                </td>
            </tr>
        );
    }
}
