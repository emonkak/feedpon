import React, { PureComponent } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import TrackingUrlPatternForm from '../modules/TrackingUrlPatternForm';
import TrackingUrlPatternItem from '../modules/TrackingUrlPatternItem';
import bindActions from 'feedpon-utils/flux/bindActions';
import connect from 'feedpon-utils/flux/react/connect';
import type { State } from 'feedpon-messaging';
import {
  addTrackingUrlPattern,
  changeTrakingUrlCacheCapacity,
  deleteTrackingUrlPattern,
  resetTrackingUrlPatterns,
} from 'feedpon-messaging/trackingUrls';

interface TrackingUrlProps {
  cacheCapacity: number;
  onAddTrackingUrlPattern: typeof addTrackingUrlPattern;
  onChangeTrakingUrlCacheCapacity: typeof changeTrakingUrlCacheCapacity;
  onDeleteTrackingUrlPattern: typeof deleteTrackingUrlPattern;
  onResetTrackingUrlPatterns: typeof resetTrackingUrlPatterns;
  patterns: string[];
}

interface TrackingUrlState {
  isResetting: boolean;
  cacheCapacity: number;
}

class TrackingUrlSettings extends PureComponent<
  TrackingUrlProps,
  TrackingUrlState
> {
  constructor(props: TrackingUrlProps) {
    super(props);

    this.state = {
      cacheCapacity: props.cacheCapacity,
      isResetting: false,
    };

    this.handleCancelResetting = this.handleCancelResetting.bind(this);
    this.handleChangeCacheCapacity = this.handleChangeCacheCapacity.bind(this);
    this.handleStartResetting = this.handleStartResetting.bind(this);
    this.handleSubmitCacheCapacity = this.handleSubmitCacheCapacity.bind(this);
  }

  handleChangeCacheCapacity(event: React.ChangeEvent<HTMLInputElement>) {
    const cacheCapacity = Number(event.currentTarget.value);

    this.setState({
      cacheCapacity,
    });
  }

  handleCancelResetting() {
    this.setState({
      isResetting: false,
    });
  }

  handleStartResetting() {
    this.setState({
      isResetting: true,
    });
  }

  handleSubmitCacheCapacity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { onChangeTrakingUrlCacheCapacity } = this.props;
    const { cacheCapacity } = this.state;

    onChangeTrakingUrlCacheCapacity(cacheCapacity);
  }

  renderPattern(pattern: string, _index: number) {
    const { onDeleteTrackingUrlPattern } = this.props;

    return (
      <TrackingUrlPatternItem
        key={pattern}
        onDelete={onDeleteTrackingUrlPattern}
        pattern={pattern}
      />
    );
  }

  override render() {
    const { onAddTrackingUrlPattern, onResetTrackingUrlPatterns, patterns } =
      this.props;
    const { cacheCapacity, isResetting } = this.state;

    return (
      <section className="section">
        <h1 className="display-1">Tracking URL</h1>
        <p>
          It expands the url that matches any tracking url pattern. Thereby you
          can get the correct number of bookmarks.
        </p>
        <form className="form" onSubmit={this.handleSubmitCacheCapacity}>
          <div className="form-group">
            <label>
              <div className="form-group-heading">Cache capacity</div>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  value={cacheCapacity + ''}
                  onChange={this.handleChangeCacheCapacity}
                  min={1}
                  required
                />
                <button
                  type="submit"
                  className="button button-outline-positive"
                >
                  Save
                </button>
              </div>
            </label>
          </div>
        </form>
        <TrackingUrlPatternForm onAdd={onAddTrackingUrlPattern} />
        <h2 className="display-2">Available patterns</h2>
        <div className="u-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{patterns.map(this.renderPattern, this)}</tbody>
          </table>
        </div>
        <div className="form">
          <button
            className="button button-outline-negative"
            onClick={this.handleStartResetting}
          >
            Reset all tracking URLs
          </button>
        </div>
        <ConfirmModal
          confirmButtonClassName="button button-negative"
          confirmButtonLabel="Reset"
          isOpened={isResetting}
          message="Are you sure you want to reset all tracking URLs?"
          onClose={this.handleCancelResetting}
          onConfirm={onResetTrackingUrlPatterns}
          title={`Reset all tracking URLs`}
        />
      </section>
    );
  }
}

export default connect({
  mapStateToProps: (state: State) => ({
    cacheCapacity: state.trackingUrls.items.capacity,
    patterns: state.trackingUrls.patterns,
  }),
  mapDispatchToProps: bindActions({
    onAddTrackingUrlPattern: addTrackingUrlPattern,
    onChangeTrakingUrlCacheCapacity: changeTrakingUrlCacheCapacity,
    onDeleteTrackingUrlPattern: deleteTrackingUrlPattern,
    onResetTrackingUrlPatterns: resetTrackingUrlPatterns,
  }),
})(TrackingUrlSettings);
