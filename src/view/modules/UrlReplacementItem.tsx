import React, { PureComponent } from 'react';

import ConfirmModal from 'view/components/ConfirmModal';
import Modal from 'view/components/Modal';
import UrlReplacementForm from 'view/modules/UrlReplacementForm';
import { UrlReplacement } from 'messaging/types';

interface UrlReplacementItemProps {
    index: number;
    item: UrlReplacement;
    onDelete: (index: number) => void;
    onUpdate: (index: number, item: UrlReplacement) => void;
}

interface UrlReplacementItemState {
    isDeleting: boolean;
    isEditing: boolean;
}

export default class UrlReplacementItem extends PureComponent<UrlReplacementItemProps, UrlReplacementItemState> {
    constructor(props: UrlReplacementItemProps) {
        super(props);

        this.state = {
            isDeleting: false,
            isEditing: false
        };
    }

    render() {
        const { index, item } = this.props;
        const { isEditing, isDeleting } = this.state;

        return (
            <tr>
                <td className="u-text-nowrap">
                    {index + 1}
                </td>
                <td className="u-text-nowrap">
                    <code>{item.pattern}</code>
                </td>
                <td className="u-text-nowrap">
                    <code>{item.replacement}</code>
                </td>
                <td className="u-text-nowrap">
                    <code>{item.flags}</code>
                </td>
                <td className="u-text-nowrap">
                    <div className="button-toolbar">
                        <button
                            className="button button-small button-outline-default"
                            onClick={this._handleStartEditing}>
                            <i className="icon icon-16 icon-edit" />
                        </button>
                        <button
                            className="button button-small button-outline-negative"
                            onClick={this._handleStartDeleting}>
                            <i className="icon icon-16 icon-trash" />
                        </button>
                    </div>
                    <ConfirmModal
                        confirmButtonClassName="button button-outline-negative"
                        confirmButtonLabel="Delete"
                        isOpened={isDeleting}
                        message="Are you sure you want to delete this pattern?"
                        onClose={this._handleCancelDeleting}
                        onConfirm={this._handleDelete}
                        title={`Delete #${index + 1}`} />
                    <Modal
                        isOpened={isEditing}
                        onClose={this._handleCancelEditing}>
                        <UrlReplacementForm
                            item={item}
                            legend="Edit URL replacement rule"
                            onSubmit={this._handleUpdate}>
                            <div className="button-toolbar">
                                <button type="submit" className="button button-outline-positive">Update</button>
                                <button className="button button-outline-default" onClick={this._handleCancelEditing}>Cancel</button>
                            </div>
                        </UrlReplacementForm>
                    </Modal>
                </td>
            </tr>
        );
    }

    private _handleCancelDeleting = () => {
        this.setState({
            isDeleting: false
        });
    }

    private _handleCancelEditing = () => {
        this.setState({
            isEditing: false
        });
    }

    private _handleDelete = () => {
        const { index, onDelete } = this.props;

        onDelete(index);
    }

    private _handleStartDeleting = () => {
        this.setState({
            isDeleting: true
        });
    }

    private _handleStartEditing = () => {
        this.setState({
            isEditing: true
        });
    }

    private _handleUpdate = (item: UrlReplacement) => {
        const { index, onUpdate } = this.props;

        onUpdate(index, item);

        this.setState({
            isEditing: false
        });
    }
}
