import React, { PureComponent } from 'react';

import ConfirmModal from 'components/widgets/ConfirmModal';
import { Category } from 'messaging/types';
import { updateCategory, deleteCategory } from 'messaging/categories/actions';

interface EditCategoryFormProps {
    category: Category;
    onDelete: typeof deleteCategory;
    onUpdate: typeof updateCategory;
}

interface EditCategoryFormState {
    isDeleting: boolean;
    isEditing: boolean;
    label: string;
}

export default class EditCategoryForm extends PureComponent<EditCategoryFormProps, EditCategoryFormState> {
    constructor(props: EditCategoryFormProps, context: any) {
        super(props, context);

        this.handleCancelDeleting = this.handleCancelDeleting.bind(this);
        this.handleCancelEditing = this.handleCancelEditing.bind(this);
        this.handleChangeLabel = this.handleChangeLabel.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleStartDeleting = this.handleStartDeleting.bind(this);
        this.handleStartEditing = this.handleStartEditing.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);

        this.state = {
            isDeleting: false,
            isEditing: false,
            label: props.category.label
        };
    }

    componentWillReceiveProps(nextProps: EditCategoryFormProps) {
        if (this.props.category.label !== nextProps.category.label) {
            this.setState({
                label: nextProps.category.label
            })
        }
    }

    handleCancelDeleting() {
        this.setState((state) => ({
            ...state,
            isDeleting: false
        }));
    }

    handleCancelEditing() {
        this.setState((state) => ({
            ...state,
            isEditing: false
        }));
    }

    handleDelete() {
        const { category, onDelete } = this.props;

        onDelete(category.categoryId, category.label);
    }

    handleStartDeleting() {
        this.setState((state) => ({
            ...state,
            isDeleting: true
        }));
    }

    handleStartEditing() {
        this.setState((state) => ({
            ...state,
            isEditing: true
        }));
    }

    handleUpdate() {
        const { category, onUpdate } = this.props;
        const { label } = this.state;

        onUpdate(category, label);
    }

    handleChangeLabel(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState((state) => ({
            ...state,
            label: event.currentTarget.value
        }));
    }

    render() {
        const { category } = this.props;
        const { isDeleting, label, isEditing } = this.state;

        return (
            <div className="form">
                <div className="form-legend">Edit Category</div>
                <div className="input-group">
                    <input
                        onChange={this.handleChangeLabel}
                        type="text"
                        className="form-control"
                        value={label}
                        required />
                    <button
                        className="button button-positive"
                        disabled={category.isLoading || label === '' || label === category.label}
                        onClick={this.handleStartEditing}>
                        Rename
                    </button>
                    <button
                        className="button button-negative"
                        disabled={category.isLoading}
                        onClick={this.handleStartDeleting}>
                        Delete
                    </button>
                </div>
                <ConfirmModal
                    confirmButtonClassName="button button-negative"
                    confirmButtonLabel="Delete"
                    isOpened={isDeleting}
                    message="Are you sure you want to delete this category?"
                    onClose={this.handleCancelDeleting}
                    onConfirm={this.handleDelete}
                    title={`Delete "${category.label}"`} />
                <ConfirmModal
                    confirmButtonClassName="button button-positive"
                    confirmButtonLabel="Rename"
                    isOpened={isEditing}
                    message="Are you sure you want to change label of this category?"
                    onClose={this.handleCancelEditing}
                    onConfirm={this.handleUpdate}
                    title={`Rename "${category.label}" to "${label}"`} />
            </div>
        );
    }
}
