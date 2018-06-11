import React, { PureComponent } from 'react';

import ValidatableControl from 'view/components/ValidatableControl';

interface TrackingUrlPatternFormProps {
    onAdd: (pattern: string) => void;
}

interface TrackingUrlPatternFormState {
    pattern: string;
}

const patternValidation = {
    message: 'Invalid regular expression.',
    rule: isValidPattern
};

export default class TrackingUrlPatternForm extends PureComponent<TrackingUrlPatternFormProps, TrackingUrlPatternFormState> {
    constructor(props: TrackingUrlPatternFormProps) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            pattern: ''
        };
    }

    handleChange(event: React.FormEvent<HTMLInputElement>) {
        this.setState({
            pattern: event.currentTarget.value
        });
    }

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const { onAdd } = this.props;
        const { pattern } = this.state;

        onAdd(pattern);

        this.setState({
            pattern: ''
        });
    }

    render() {
        const { pattern } = this.state;

        return (
            <form className="form" onSubmit={this.handleSubmit}>
                <div className="form-legend">New tracking URL pattern</div>
                <div className="input-group">
                    <ValidatableControl
                        validations={[patternValidation]}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="^https://..."
                            value={pattern}
                            onChange={this.handleChange}
                            required />
                    </ValidatableControl>
                    <button type="submit" className="button button-outline-positive">Add</button>
                </div>
                <span className="u-text-muted">The regular expression for the tracking url.</span>
            </form>
        );
    }
}

function isValidPattern(pattern: string): boolean {
    try {
        return !!new RegExp(pattern);
    } catch (_error) {
        return false;
    }
}

