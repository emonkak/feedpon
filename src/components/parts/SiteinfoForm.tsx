import React, { PureComponent } from 'react';
// import classnames from 'classnames';

import { SiteinfoItem } from 'messaging/types';

interface SiteinfoFormProps {
    onSubmit(item: SiteinfoItem): void;
}

interface SiteinfoFormState {
    name: string;
    urlPattern: string;
    contentPath: string;
    nextLinkPath: string;
}

export default class SiteinfoForm extends PureComponent<SiteinfoFormProps, SiteinfoFormState> {
    constructor(props: SiteinfoFormProps, context: any) {
        super(props, context);

        this.state = {
            name: '',
            urlPattern: '',
            contentPath: '',
            nextLinkPath: ''
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onSubmit } = this.props;
        const { name, urlPattern, contentPath, nextLinkPath } = this.state;

        onSubmit({
            id: Date.now(),
            name,
            urlPattern,
            contentPath,
            nextLinkPath
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
        const { name, urlPattern, contentPath, nextLinkPath } = this.state;

        return (
            <form onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend>New user siteinfo</legend>
                    <div className="form-group">
                        <label>
                            <span className="form-control-label is-required">Name</span>
                            <input className="form-control" type="text" name="name" value={name} onChange={this.handleChange} required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span className="form-control-label is-required">URL pattern</span>
                            <input className="form-control" type="text" name="urlPattern" value={urlPattern} onChange={this.handleChange} required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span className="form-control-label is-required">Content path</span>
                            <input className="form-control" type="text" name="contentPath" value={contentPath} onChange={this.handleChange} required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span className="form-control-label is-required">Next link path</span>
                            <input className="form-control" type="text" name="nextLinkPath" value={nextLinkPath} onChange={this.handleChange} required />
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
