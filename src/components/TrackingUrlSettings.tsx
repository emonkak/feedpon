import React, { PureComponent } from 'react';

import TrackingUrlPatternForm from 'components/parts/TrackingUrlPatternForm';
import TrackingUrlPatternItem from 'components/parts/TrackingUrlPatternItem';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';
import { addTrackingUrlPattern, deleteTrackingUrlPattern } from 'messaging/trackingUrlPatterns/actions';

interface TrackingUrlProps {
    onAddTrackingUrlPattern: typeof addTrackingUrlPattern;
    onDeleteTrackingUrlPattern: typeof deleteTrackingUrlPattern;
    patterns: string[];
}

class TrackingUrlSettings extends PureComponent<TrackingUrlProps, {}> {
    renderPattern(pattern: string, index: number) {
        const { onDeleteTrackingUrlPattern } = this.props;

        return (
            <TrackingUrlPatternItem
                key={pattern}
                onDelete={onDeleteTrackingUrlPattern}
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

export default connect({
    mapStateToProps: (state: State) => ({
        patterns: state.trackingUrlPatterns.items
    }),
    mapDispatchToProps: bindActions({
        onAddTrackingUrlPattern: addTrackingUrlPattern,
        onDeleteTrackingUrlPattern: deleteTrackingUrlPattern
    })
})(TrackingUrlSettings);
