import React, { PureComponent } from 'react';

import InputControl from 'components/parts/InputControl';
import { SiteinfoItem } from 'messaging/types';

interface SiteinfoFormProps {
    item?: SiteinfoItem;
    legend: string;
    onSubmit: (item: SiteinfoItem) => void;
}

interface SiteinfoFormState {
    name: string;
    urlPattern: string;
    contentExpression: string;
    nextLinkExpression: string;
}

export default class SiteinfoForm extends PureComponent<SiteinfoFormProps, SiteinfoFormState> {
    constructor(props: SiteinfoFormProps, context: any) {
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

    handleSubmit(event: React.SyntheticEvent<any>) {
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

    handleChange(event: React.SyntheticEvent<any>) {
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
            <form onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend>{legend}</legend>
                    <div className="form-group">
                        <label>
                            <span className="form-group-heading form-required">Name</span>
                            <InputControl
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
                            <InputControl
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
                            <InputControl
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
                            <InputControl
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

