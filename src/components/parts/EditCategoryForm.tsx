import React, { PureComponent } from 'react';

import ConfirmModal from 'components/widgets/ConfirmModal';
import { Category } from 'messaging/types';

interface EditCategoryFormProps {
    category: Category;
    onDelete: (categoryId: string | number, label: string) => void;
    onUpdate: (category: Category, newLabel: string) => void;
}

interface EditCategoryFormState {
    isDeleting: boolean;
    isEditing: boolean;
    label: string;
}

export default class EditCategoryForm extends PureComponent<EditCategoryFormProps, EditCategoryFormState> {
    constructor(props: EditCategoryFormProps) {
        super(props);

        this.state = {
            isDeleting: false,
            isEditing: false,
            label: props.category.label
        };
    }

    componentWillReceiveProps(nextProps: EditCategoryFormProps) {
        const label = this.props.category.label;
        const nextLabel = nextProps.category.label;

        if (label !== nextLabel) {
            this.setState({
                label: nextLabel
            });
        }
    }

    render() {
        const { category } = this.props;
        const { isDeleting, label, isEditing } = this.state;

        return (
            <div className="form">
                <div className="form-legend">Edit Category</div>
                <div className="input-group">
                    <input
                        onChange={this._handleChangeLabel}
                        type="text"
                        className="form-control"
                        value={label}
                        required />
                    <button
                        className="button button-positive"
                        disabled={category.isLoading || label === '' || label === category.label}
                        onClick={this._handleStartEditing}>
                        Rename
                    </button>
                    <button
                        className="button button-negative"
                        disabled={category.isLoading}
                        onClick={this._handleStartDeleting}>
                        Delete
                    </button>
                </div>
                <ConfirmModal
                    confirmButtonClassName="button button-negative"
                    confirmButtonLabel="Delete"
                    isOpened={isDeleting}
                    message="Are you sure you want to delete this category?"
                    onClose={this._handleCancelDeleting}
                    onConfirm={this._handleDelete}
                    title={`Delete "${category.label}"`} />
                <ConfirmModal
                    confirmButtonClassName="button button-positive"
                    confirmButtonLabel="Rename"
                    isOpened={isEditing}
                    message="Are you sure you want to change label of this category?"
                    onClose={this._handleCancelEditing}
                    onConfirm={this._handleUpdate}
                    title={`Rename "${category.label}" to "${label}"`} />
            </div>
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
        const { category, onDelete } = this.props;

        onDelete(category.categoryId, category.label);
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

    private _handleUpdate = () => {
        const { category, onUpdate } = this.props;
        const { label } = this.state;

        onUpdate(category, label);
    }

    private _handleChangeLabel = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            label: event.currentTarget.value
        });
    }
}
