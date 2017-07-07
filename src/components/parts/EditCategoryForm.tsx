import React, { PureComponent } from 'react';

import ConfirmModal from 'components/widgets/ConfirmModal';
import ModalButton from 'components/widgets/ModalButton';
import { Category } from 'messaging/types';
import { updateCategory, deleteCategory } from 'messaging/categories/actions';

interface EditCategoryFormProps {
    category: Category;
    onDeleteCategory: typeof deleteCategory;
    onUpdateCategory: typeof updateCategory;
}

interface EditCategoryFormState {
    label: string;
}

export default class EditCategoryForm extends PureComponent<EditCategoryFormProps, EditCategoryFormState> {
    constructor(props: EditCategoryFormProps, context: any) {
        super(props, context);

        this.handleChangeCategory = this.handleChangeCategory.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);

        this.state = {
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

    handleDelete() {
        const { category, onDeleteCategory } = this.props;

        onDeleteCategory(category.categoryId, category.label);
    }

    handleUpdate() {
        const { category, onUpdateCategory } = this.props;
        const { label } = this.state;

        onUpdateCategory(category, label);
    }

    handleChangeCategory(event: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            label: event.currentTarget.value
        });
    }

    render() {
        const { category } = this.props;
        const { label } = this.state;

        return (
            <div className="form">
                <div className="form-legend">Edit Category</div>
                <div className="input-group">
                    <input
                        onChange={this.handleChangeCategory}
                        type="text"
                        className="form-control"
                        value={label}
                        required />
                    <ModalButton
                        modal={
                            <ConfirmModal
                                message="Are you sure you want to change label of this category?"
                                confirmButtonClassName="button button-positive"
                                confirmButtonLabel="Rename"
                                onConfirm={this.handleUpdate}
                                title={`Rename "${category.label}" to "${label}"`} />
                        }
                        button={
                            <button
                                className="button button-positive"
                                disabled={category.isLoading || label === '' || label === category.label}>
                                Rename
                            </button>
                        } />
                    <ModalButton
                        modal={
                            <ConfirmModal
                                message="Are you sure you want to delete this category?"
                                confirmButtonClassName="button button-negative"
                                confirmButtonLabel="Delete"
                                onConfirm={this.handleDelete}
                                title={`Delete "${category.label}"`} />
                        }
                        button={
                            <button
                                className="button button-negative"
                                disabled={category.isLoading}>
                                Delete
                            </button>
                        } />
                </div>
            </div>
        );
    }
}
