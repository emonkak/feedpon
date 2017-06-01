import React, { PureComponent } from 'react';
import InputControl from 'components/parts/InputControl';

interface TrackingUrlPatternFormProps {
    onAdd: (pattern: string) => void;
}

interface TrackingUrlPatternFormState {
    pattern: string;
}

export default class TrackingUrlPatternForm extends PureComponent<TrackingUrlPatternFormProps, TrackingUrlPatternFormState> {
    constructor(props: TrackingUrlPatternFormProps, context: any) {
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
            <form onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend>New tracking URL pattern</legend>
                    <div className="form-group">
                        <label>
                            <div className="input-group">
                                <InputControl
                                    validations={[{ message: 'Invalid regular expression.', rule: isValidPattern }]}
                                    type="text"
                                    className="form-control"
                                    placeholder="^https://..."
                                    value={pattern}
                                    onChange={this.handleChange}
                                    required />
                                <button type="submit" className="button button-outline-positive">Add</button>
                            </div>
                        </label>
                        <span className="u-text-muted">The regular expression for the tracking url.</span>
                    </div>
                </fieldset>
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
