import React, { PureComponent } from 'react';

import InputControl from 'components/parts/InputControl';
import { SiteinfoItem } from 'messaging/types';

interface SiteinfoFormProps {
    onSubmit(item: SiteinfoItem): void;
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

        this.state = {
            name: '',
            urlPattern: '',
            contentExpression: '',
            nextLinkExpression: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onSubmit } = this.props;
        const { name, urlPattern, contentExpression, nextLinkExpression } = this.state;

        onSubmit({
            id: Date.now(),
            name,
            urlPattern,
            contentExpression,
            nextLinkExpression
        });

        this.setState({
            name: '',
            urlPattern: '',
            contentExpression: '',
            nextLinkExpression: ''
        });
    }

    handleChange(event: React.SyntheticEvent<any>) {
        const { name, value } = event.currentTarget;

        this.setState(state => ({
            ...state,
            [name]: value
        }));
    }

    render() {
        const { name, urlPattern, contentExpression, nextLinkExpression } = this.state;

        return (
            <form onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend>New user siteinfo</legend>
                    <div className="form-group">
                        <label>
                            <span className="form-control-label is-required">Name</span>
                            <InputControl
                                type="text"
                                name="name"
                                value={name}
                                onChange={this.handleChange}
                                required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span className="form-control-label is-required">URL pattern</span>
                            <InputControl
                                validations={[{ message: 'Invalid regular expression.', rule: isValidPattern }]}
                                type="text"
                                name="urlPattern"
                                value={urlPattern}
                                onChange={this.handleChange}
                                required />
                            <span className="u-text-muted">The regular expression for the url.</span>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span className="form-control-label is-required">Content expression</span>
                            <InputControl
                                validations={[{ message: 'Invalid XPath expression.', rule: isValidXPath }]}
                                type="text"
                                name="contentExpression"
                                value={contentExpression}
                                onChange={this.handleChange}
                                required />
                            <span className="u-text-muted">The XPath expression to the element representing the content.</span>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span className="form-control-label">Next link expression</span>
                            <InputControl
                                validations={[{ message: 'Invalid XPath expression.', rule: isValidXPath }]}
                                type="text"
                                name="nextLinkExpression"
                                value={nextLinkExpression}
                                onChange={this.handleChange}
                                required />
                            <span className="u-text-muted">The XPath expression to the anchor element representing the next link.</span>
                        </label>
                    </div>
                    <div className="form-group">
                        <button className="button button-outline-positive" type="submit">Add</button>
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
