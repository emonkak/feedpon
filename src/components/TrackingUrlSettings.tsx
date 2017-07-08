import React, { PureComponent } from 'react';

import ConfirmModal from 'components/widgets/ConfirmModal';
import TrackingUrlPatternForm from 'components/parts/TrackingUrlPatternForm';
import TrackingUrlPatternItem from 'components/parts/TrackingUrlPatternItem';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State } from 'messaging/types';
import { addTrackingUrlPattern, deleteTrackingUrlPattern, resetTrackingUrlPatterns } from 'messaging/trackingUrlPatterns/actions';

interface TrackingUrlProps {
    onAddTrackingUrlPattern: typeof addTrackingUrlPattern;
    onDeleteTrackingUrlPattern: typeof deleteTrackingUrlPattern;
    onResetTrackingUrlPatterns: typeof resetTrackingUrlPatterns;
    patterns: string[];
}

interface TrackingUrlState {
    isResetting: boolean;
}

class TrackingUrlSettings extends PureComponent<TrackingUrlProps, TrackingUrlState> {
    constructor(props: TrackingUrlProps, context: any) {
        super(props, context);

        this.state = {
            isResetting: false
        };

        this.handleCancelResetting = this.handleCancelResetting.bind(this);
        this.handleStartResetting = this.handleStartResetting.bind(this);
    }

    handleCancelResetting() {
        this.setState({
            isResetting: false
        });
    }

    handleStartResetting() {
        this.setState({
            isResetting: true
        });
    }

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
        const { onAddTrackingUrlPattern, onResetTrackingUrlPatterns, patterns } = this.props;
        const { isResetting } = this.state;

        return (
            <section className="section">
                <h1 className="display-1">Tracking URL</h1>
                <p>It expands the url that matches any tracking url pattern. Thereby you can get the correct number of bookmarks.</p>
                <TrackingUrlPatternForm onAdd={onAddTrackingUrlPattern} />
                <h2 className="display-2">Available patterns</h2>
                <ul className="list-group">
                    {patterns.map(this.renderPattern, this)}
                </ul>
                <div className="form">
                    <button
                        className="button button-outline-negative"
                        onClick={this.handleStartResetting}>Reset all tracking URLs</button>
                </div>
                <ConfirmModal
                    confirmButtonClassName="button button-negative"
                    confirmButtonLabel="Reset"
                    isOpened={isResetting}
                    message="Are you sure you want to reset all tracking URLs?"
                    onClose={this.handleCancelResetting}
                    onConfirm={onResetTrackingUrlPatterns}
                    title={`Reset all tracking URLs`} />
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
        onDeleteTrackingUrlPattern: deleteTrackingUrlPattern,
        onResetTrackingUrlPatterns: resetTrackingUrlPatterns
    })
})(TrackingUrlSettings);
