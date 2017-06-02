import React, { PureComponent } from 'react';

import ConfirmButton from 'components/parts/ConfirmButton';
import TrackingUrlPatternForm from 'components/parts/TrackingUrlPatternForm';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';
import { addTrackingUrlPattern, removeTrackingUrlPattern } from 'messaging/trackingUrlSettings/actions';

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
                <ConfirmButton
                    className="u-pull-right close"
                    message="Are you sure you want to delete this pattern?"
                    okClassName="button-outline-negative"
                    okLabel="Delete"
                    onConfirm={this.handleRemove}
                    title={`Delete "${pattern}"`} />
            </li>
        )
    }
}

export default connect(
    (state: State) => ({
        patterns: state.trackingUrlSettings.patterns
    }),
    (dispatch) => bindActions({
        onAddTrackingUrlPattern: addTrackingUrlPattern,
        onRemoveTrackingUrlPattern: removeTrackingUrlPattern
    }, dispatch)
)(TrackingUrlSettings);
