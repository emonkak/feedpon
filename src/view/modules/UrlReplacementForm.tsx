import React, { PureComponent } from 'react';

import ValidatableControl from 'view/components/ValidatableControl';
import { UrlReplacement } from 'messaging/types';

interface UrlReplacementFormProps {
    item?: UrlReplacement;
    legend: string;
    onSubmit: (item: UrlReplacement) => void;
}

interface UrlReplacementFormState {
    flags: string;
    pattern: string;
    replacement: string;
}

const patternValidation = {
    message: 'Invalid regular expression.',
    rule: isValidPattern
};

export default class UrlReplacementForm extends PureComponent<UrlReplacementFormProps, UrlReplacementFormState> {
    constructor(props: UrlReplacementFormProps) {
        super(props);

        const { item } = props;

        if (item) {
            this.state = {
                pattern: item.pattern,
                replacement: item.replacement,
                flags: item.flags
            };
        } else {
            this.state = {
                pattern: '',
                replacement: '',
                flags: ''
            };
        }
    }

    render() {
        const { children, legend } = this.props;
        const { flags, replacement, pattern } = this.state;

        return (
            <form className="form" onSubmit={this._handleSubmit}>
                <div className="form-legend">{legend}</div>
                <div className="form-group">
                    <label>
                        <span className="form-group-heading form-required">Pattern</span>
                        <ValidatableControl
                            validations={[patternValidation]}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="^https://..."
                                value={pattern}
                                onChange={this._handleChangePattern}
                                required />
                        </ValidatableControl>
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        <span className="form-group-heading">Replacement</span>
                        <ValidatableControl>
                            <input
                                type="text"
                                className="form-control"
                                value={replacement}
                                onChange={this._handleChangeReplacement} />
                        </ValidatableControl>
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        <span className="form-group-heading">Flags</span>
                        <ValidatableControl>
                            <input
                                type="text"
                                className="form-control"
                                value={flags}
                                onChange={this._handleChangeFlags}
                                pattern="^[gimuy]+$" />
                        </ValidatableControl>
                    </label>
                </div>
                <div className="form-group">
                    {children}
                </div>
            </form>
        );
    }

    private _resetToDefaultState() {
        this.setState({
            pattern: '',
            replacement: '',
            flags: ''
        });
    }

    private _handleChangePattern = (event: React.ChangeEvent<HTMLInputElement>) => {
        const pattern = event.currentTarget.value;

        this.setState({
            pattern
        });
    }

    private _handleChangeReplacement = (event: React.ChangeEvent<HTMLInputElement>) => {
        const replacement = event.currentTarget.value;

        this.setState({
            replacement
        });
    }

    private _handleChangeFlags = (event: React.ChangeEvent<HTMLInputElement>) => {
        const flags = event.currentTarget.value;

        this.setState({
            flags
        });
    }

    private _handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const { item, onSubmit } = this.props;
        const { flags, pattern, replacement } = this.state;

        onSubmit({
            pattern,
            replacement,
            flags
        });

        if (!item) {
            this._resetToDefaultState();
        }
    }
}

function isValidPattern(pattern: string): boolean {
    try {
        return !!new RegExp(pattern);
    } catch (_error) {
        return false;
    }
}
