import React, { PureComponent } from 'react';

import ConfirmModal from 'components/parts/ConfirmModal';
import ValidatableInput from 'components/parts/ValidatableInput';
import Modal from 'components/parts/Modal';
import ModalButton from 'components/parts/ModalButton';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, SiteinfoItem } from 'messaging/types';
import { addSiteinfoItem, removeSiteinfoItem, updateSiteinfoItem } from 'messaging/userSiteinfo/actions';

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
                    <UserSiteinfoForm legend="New item" onSubmit={onAddSiteinfoItem}>
                        <button className="button button-outline-positive" type="submit">Add</button>
                    </UserSiteinfoForm>
                </div>
                <div className="u-responsive">
                    <table className="table">
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

interface UserSiteinfoFormProps {
    item?: SiteinfoItem;
    legend: string;
    onSubmit: (item: SiteinfoItem) => void;
}

interface UserSiteinfoFormState {
    name: string;
    urlPattern: string;
    contentExpression: string;
    nextLinkExpression: string;
}

class UserSiteinfoForm extends PureComponent<UserSiteinfoFormProps, UserSiteinfoFormState> {
    constructor(props: UserSiteinfoFormProps, context: any) {
        super(props, context);

        if (props.item) {
            this.state = {
                name: props.item.name,
                urlPattern: props.item.urlPattern,
                contentExpression: props.item.contentExpression,
                nextLinkExpression: props.item.nextLinkExpression
            };
        } else {
            this.state = {
                name: '',
                urlPattern: '',
                contentExpression: '',
                nextLinkExpression: ''
            };
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event: React.FormEvent<any>) {
        event.preventDefault();

        const { item, onSubmit } = this.props;
        const { name, urlPattern, contentExpression, nextLinkExpression } = this.state;

        onSubmit({
            id: item ? item.id : Date.now(),
            name,
            urlPattern,
            contentExpression,
            nextLinkExpression
        });

        if (!item) {
            this.setState({
                name: '',
                urlPattern: '',
                contentExpression: '',
                nextLinkExpression: ''
            });
        }
    }

    handleChange(event: React.ChangeEvent<any>) {
        const { name, value } = event.currentTarget;

        this.setState(state => ({
            ...state,
            [name]: value
        }));
    }

    render() {
        const { children, legend } = this.props;
        const { contentExpression, name, nextLinkExpression, urlPattern } = this.state;

        return (
            <form className="form" onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend className="form-legend">{legend}</legend>
                    <div className="form-group">
                        <label>
                            <span className="form-group-heading form-required">Name</span>
                            <ValidatableInput
                                className="form-control"
                                type="text"
                                name="name"
                                value={name}
                                onChange={this.handleChange}
                                required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span className="form-group-heading form-required">URL pattern</span>
                            <ValidatableInput
                                className="form-control"
                                validations={[{ message: 'Invalid regular expression.', rule: isValidPattern }]}
                                type="text"
                                name="urlPattern"
                                value={urlPattern}
                                onChange={this.handleChange}
                                required />
                        </label>
                        <span className="u-text-muted">The regular expression for the url.</span>
                    </div>
                    <div className="form-group">
                        <label>
                            <span className="form-group-heading form-required">Content expression</span>
                            <ValidatableInput
                                className="form-control"
                                validations={[{ message: 'Invalid XPath expression.', rule: isValidXPath }]}
                                type="text"
                                name="contentExpression"
                                value={contentExpression}
                                onChange={this.handleChange}
                                required />
                        </label>
                        <span className="u-text-muted">The XPath expression to the element representing the content.</span>
                    </div>
                    <div className="form-group">
                        <label>
                            <span className="form-group-heading">Next link expression</span>
                            <ValidatableInput
                                className="form-control"
                                validations={[{ message: 'Invalid XPath expression.', rule: isValidXPath }]}
                                type="text"
                                name="nextLinkExpression"
                                value={nextLinkExpression}
                                onChange={this.handleChange} />
                        </label>
                        <span className="u-text-muted">The XPath expression to the anchor element representing the next link.</span>
                    </div>
                    <div className="form-group">
                        {children}
                    </div>
                </fieldset>
            </form>
        );
    }
}

function isValidXPath(expression: string): boolean {
    try {
        const resolver = document.createNSResolver(document);
        return !!document.createExpression(expression, resolver);
    } catch (_error) {
        return false;
    }
}

function isValidPattern(pattern: string): boolean {
    try {
        return !!new RegExp(pattern);
    } catch (_error) {
        return false;
    }
}


export default connect({
    mapStateToProps: (state: State) => ({
        items: state.userSiteinfo.items
    }),
    mapDispatchToProps: bindActions({
        onAddSiteinfoItem: addSiteinfoItem,
        onRemoveSiteinfoItem: removeSiteinfoItem,
        onUpdateSiteinfoItem: updateSiteinfoItem
    })
})(UserSiteinfoSettings);
