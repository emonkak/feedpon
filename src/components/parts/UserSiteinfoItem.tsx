import React, { PureComponent } from 'react';

import ConfirmModal from 'components/widgets/ConfirmModal';
import Modal from 'components/widgets/Modal';
import UserSiteinfoForm from 'components/parts/UserSiteinfoForm';
import { SiteinfoItem } from 'messaging/types';
import { deleteUserSiteinfoItem, updateUserSiteinfoItem } from 'messaging/userSiteinfo/actions';

interface UserSiteinfoItemProps {
    item: SiteinfoItem;
    onDelete: typeof deleteUserSiteinfoItem;
    onUpdate: typeof updateUserSiteinfoItem;
}

interface UserSiteinfoItemState {
    isEditing: boolean;
    isDeleting: boolean;
}

export default class UserSiteinfoItem extends PureComponent<UserSiteinfoItemProps, UserSiteinfoItemState> {
    constructor(props: UserSiteinfoItemProps) {
        super(props);

        this.handleCancelDeleting = this.handleCancelDeleting.bind(this);
        this.handleCancelEditing = this.handleCancelEditing.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleStartDeleting = this.handleStartDeleting.bind(this);
        this.handleStartEditing = this.handleStartEditing.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            isDeleting: false,
            isEditing: false
        };
    }

    handleCancelDeleting() {
        this.setState({
            isDeleting: false
        });
    }

    handleCancelEditing() {
        this.setState({
            isEditing: false
        });
    }

    handleDelete() {
        const { item, onDelete } = this.props;

        onDelete(item.id);
    }

    handleStartDeleting() {
        this.setState({
            isDeleting: true
        });
    }

    handleStartEditing() {
        this.setState({
            isEditing: true
        });
    }

    handleSubmit(item: SiteinfoItem) {
        const { onUpdate } = this.props;

        onUpdate(item);

        this.setState({ isEditing: false });
    }

    render() {
        const { item } = this.props;
        const { isDeleting, isEditing } = this.state;

        return (
            <tr>
                <td>{item.name}</td>
                <td><code>{item.urlPattern}</code></td>
                <td>
                    <div className="button-toolbar u-text-nowrap">
                        <button
                            className="button button-outline-default"
                            onClick={this.handleStartEditing}>
                            <i className="icon icon-16 icon-edit" />
                        </button>
                        <button
                            className="button button-outline-negative"
                            onClick={this.handleStartDeleting}>
                            <i className="icon icon-16 icon-trash" />
                        </button>
                    </div>
                    <Modal
                        isOpened={isEditing}
                        onClose={this.handleCancelEditing}>
                        <UserSiteinfoForm
                            legend="Edit existing item"
                            item={item}
                            onSubmit={this.handleSubmit}>
                            <div className="button-toolbar">
                                <button className="button button-outline-positive" type="submit">Save</button>
                                <button className="button button-outline-default" onClick={this.handleCancelEditing}>Cancel</button>
                            </div>
                        </UserSiteinfoForm>
                    </Modal>
                    <ConfirmModal
                        confirmButtonClassName="button button-outline-negative"
                        confirmButtonLabel="Delete"
                        isOpened={isDeleting}
                        message="Are you sure you want to delete this item?"
                        onClose={this.handleCancelDeleting}
                        onConfirm={this.handleDelete}
                        title={`Delete "${item.name}"`} />
                </td>
            </tr>
        );
    }
}
