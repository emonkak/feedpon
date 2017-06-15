import React, { PureComponent } from 'react';

import ConfirmModal from 'components/parts/ConfirmModal';
import InputControl from 'components/parts/InputControl';
import ModalButton from 'components/parts/ModalButton';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';
import { addTrackingUrlPattern, removeTrackingUrlPattern } from 'messaging/trackingUrlPatterns/actions';

interface TrackingUrlProps {
    onAddTrackingUrlPattern: typeof addTrackingUrlPattern;
    onRemoveTrackingUrlPattern: typeof removeTrackingUrlPattern;
    patterns: string[];
}

class TrackingUrlSettings extends PureComponent<TrackingUrlProps, {}> {
    renderPattern(pattern: string, index: number) {
        const { onRemoveTrackingUrlPattern } = this.props;

        return (
            <TrackingUrlPatternItem
                key={pattern}
                onRemove={onRemoveTrackingUrlPattern}
                pattern={pattern} />
        );
    }

    render() {
        const { onAddTrackingUrlPattern, patterns } = this.props;

        return (
            <section className="section">
                <h1 className="display-1">Tracking URL</h1>
                <p>It expands the url that matches any tracking url pattern. Thereby you can get the correct number of bookmarks.</p>
                <TrackingUrlPatternForm onAdd={onAddTrackingUrlPattern} />
                <h2 className="display-2">Available patterns</h2>
                <ul className="list-group">
                    {patterns.map(this.renderPattern, this)}
                </ul>
            </section>
        );
    }
}

interface TrackingUrlPatternItemProps {
    onRemove: (pattern: string) => void;
    pattern: string;
}

class TrackingUrlPatternItem extends PureComponent<TrackingUrlPatternItemProps, {}> {
    constructor(props: TrackingUrlPatternItemProps, context: any) {
        super(props, context);

        this.handleRemove = this.handleRemove.bind(this);
    }

    handleRemove() {
        const { onRemove, pattern } = this.props;

        onRemove(pattern);
    }

    render() {
        const { pattern } = this.props;

        return (
            <li className="list-group-item">
                <code>{pattern}</code>
                <ModalButton
                    modal={
                        <ConfirmModal
                            message="Are you sure you want to delete this pattern?"
                            confirmButtonClassName="button button-outline-negative"
                            confirmButtonLabel="Delete"
                            onConfirm={this.handleRemove}
                            title={`Delete "${pattern}"`} />
                    }
                    button={<button className="close u-pull-right" />} />
            </li>
        )
    }
}

interface TrackingUrlPatternFormProps {
    onAdd: (pattern: string) => void;
}

interface TrackingUrlPatternFormState {
    pattern: string;
}

class TrackingUrlPatternForm extends PureComponent<TrackingUrlPatternFormProps, TrackingUrlPatternFormState> {
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
            <form className="form" onSubmit={this.handleSubmit}>
                <fieldset>
                    <legend className="form-legend">New tracking URL pattern</legend>
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
                    <span className="u-text-muted">The regular expression for the tracking url.</span>
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

export default connect({
    mapStateToProps: (state: State) => ({
        patterns: state.trackingUrlPatterns.items
    }),
    mapDispatchToProps: bindActions({
        onAddTrackingUrlPattern: addTrackingUrlPattern,
        onRemoveTrackingUrlPattern: removeTrackingUrlPattern
    })
})(TrackingUrlSettings);
