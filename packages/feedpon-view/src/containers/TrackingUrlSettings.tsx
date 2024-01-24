import React, { useState } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import TrackingUrlPatternForm from '../modules/TrackingUrlPatternForm';
import TrackingUrlPatternItem from '../modules/TrackingUrlPatternItem';
import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { State } from 'feedpon-messaging';
import useEvent from '../hooks/useEvent';
import {
  addTrackingUrlPattern,
  changeTrakingUrlCacheCapacity,
  deleteTrackingUrlPattern,
  resetTrackingUrlPatterns,
} from 'feedpon-messaging/trackingUrls';

interface TrackingUrlSettingsProps {
  cacheCapacity: number;
  onAddTrackingUrlPattern: typeof addTrackingUrlPattern;
  onChangeTrakingUrlCacheCapacity: typeof changeTrakingUrlCacheCapacity;
  onDeleteTrackingUrlPattern: typeof deleteTrackingUrlPattern;
  onResetTrackingUrlPatterns: typeof resetTrackingUrlPatterns;
  patterns: string[];
}

function TrackingUrlSettings({
  cacheCapacity: initialCacheCapacity,
  onAddTrackingUrlPattern,
  onChangeTrakingUrlCacheCapacity,
  onDeleteTrackingUrlPattern,
  onResetTrackingUrlPatterns,
  patterns,
}: TrackingUrlSettingsProps) {
  const [cacheCapacity, setCacheCapacity] = useState(initialCacheCapacity);
  const [isResetting, setIsResetting] = useState(false);

  const handleChangeCacheCapacity = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newCacheCapacity = Number(event.currentTarget.value);
      setCacheCapacity(newCacheCapacity);
    },
  );

  const handleCancelResetting = useEvent(() => {
    setIsResetting(false);
  });

  const handleStartResetting = useEvent(() => {
    setIsResetting(true);
  });

  const handleSubmitCacheCapacity = useEvent(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onChangeTrakingUrlCacheCapacity(cacheCapacity);
    },
  );

  return (
    <section className="section">
      <h1 className="display-1">Tracking URL</h1>
      <p>
        It expands the url that matches any tracking url pattern. Thereby you
        can get the correct number of bookmarks.
      </p>
      <form className="form" onSubmit={handleSubmitCacheCapacity}>
        <div className="form-group">
          <label>
            <div className="form-group-heading">Cache capacity</div>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                value={cacheCapacity + ''}
                onChange={handleChangeCacheCapacity}
                min={1}
                required
              />
              <button type="submit" className="button button-outline-positive">
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
          <tbody>
            {patterns.map((pattern) => (
              <TrackingUrlPatternItem
                key={pattern}
                onDelete={onDeleteTrackingUrlPattern}
                pattern={pattern}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="form">
        <button
          className="button button-outline-negative"
          onClick={handleStartResetting}
        >
          Reset all tracking URLs
        </button>
      </div>
      <ConfirmModal
        confirmButtonClassName="button button-negative"
        confirmButtonLabel="Reset"
        isOpened={isResetting}
        message="Are you sure you want to reset all tracking URLs?"
        onClose={handleCancelResetting}
        onConfirm={onResetTrackingUrlPatterns}
        title={`Reset all tracking URLs`}
      />
    </section>
  );
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
