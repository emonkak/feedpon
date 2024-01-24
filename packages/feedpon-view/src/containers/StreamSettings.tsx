import React, { useState } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type {
  State,
  StreamFetchOptions,
  StreamViewKind,
} from 'feedpon-messaging';
import {
  changeDefaultStreamFetchOptions,
  changeDefaultStreamView,
  changeStreamCacheCapacity,
  changeStreamHistoryOptions,
  clearStreamCaches,
} from 'feedpon-messaging/streams';
import useEvent from '../hooks/useEvent';

interface StreamSettingsProps {
  cacheCapacity: number;
  fetchOptions: StreamFetchOptions;
  numStreamHistories: number;
  onChangeDefaultStreamFetchOptions: typeof changeDefaultStreamFetchOptions;
  onChangeDefaultStreamView: typeof changeDefaultStreamView;
  onChangeStreamCacheCapacity: typeof changeStreamCacheCapacity;
  onChangeStreamHistoryOptions: typeof changeStreamHistoryOptions;
  onClearStreamCaches: typeof clearStreamCaches;
  streamView: StreamViewKind;
}

function StreamSettings({
  cacheCapacity: initialCacheCapacity,
  fetchOptions: initialFetchOptions,
  numStreamHistories: initialNumStreamHistories,
  onChangeDefaultStreamFetchOptions,
  onChangeDefaultStreamView,
  onChangeStreamHistoryOptions,
  onChangeStreamCacheCapacity,
  onClearStreamCaches,
  streamView: initialStreamView,
}: StreamSettingsProps) {
  const [cacheCapacity, setCacheCapacity] = useState(initialCacheCapacity);
  const [fetchOptions, setFetchOptions] = useState(initialFetchOptions);
  const [isClearingStreamCaches, setIsClearingStreamCaches] = useState(false);
  const [numStreamHistories, setNumStreamHistories] = useState(
    initialNumStreamHistories,
  );
  const [streamView, setStreamView] = useState(initialStreamView);

  const handleCancelClearingStreamCaches = useEvent(() => {
    setIsClearingStreamCaches(false);
  });

  const handleChangeNumStreamHistories = useEvent((
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newNumStreamHistories = parseInt(event.currentTarget.value, 10);
    setNumStreamHistories(newNumStreamHistories);
  });

  const handleChangeCacheCapacity = useEvent((
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newCacheCapacity = parseInt(event.currentTarget.value, 10);
    setCacheCapacity(newCacheCapacity);
  });

  const handleChangeFetchOptions = useEvent((
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const target = event.currentTarget;
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    setFetchOptions((fetchOptions) => ({
      ...fetchOptions,
      [name]: value,
    }));
  });

  const handleChangeStreamView = useEvent((
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newStreamView = event.currentTarget.value as StreamViewKind;
    setStreamView(newStreamView);
  });

  const handleStartClearingStreamCaches = useEvent(() => {
    setIsClearingStreamCaches(true);
  });

  const handleSubmitFetchOptions = useEvent((
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    onChangeDefaultStreamFetchOptions(fetchOptions);
  });

  const handleSubmitStreamView = useEvent(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onChangeDefaultStreamView(streamView);
    },
  );

  const handleSubmitHistoryOptions = useEvent((
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    onChangeStreamHistoryOptions(numStreamHistories);
  });

  const handleSubmitCacheCapacity = useEvent((
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    onChangeStreamCacheCapacity(cacheCapacity);
  });

  return (
    <section className="section">
      <h1 className="display-1">Stream</h1>
      <form className="form" onSubmit={handleSubmitFetchOptions}>
        <div className="form-legend">Fetch options</div>
        <div className="form-group">
          <label>
            <div className="form-group-heading">
              Default fetch number of entries
            </div>
            <input
              type="number"
              className="form-control"
              name="numEntries"
              value={fetchOptions.numEntries + ''}
              onChange={handleChangeFetchOptions}
              min={1}
              max={1000}
              required
            />
          </label>
        </div>
        <div className="form-group">
          <label className="form-check-label">
            <input
              type="checkbox"
              className="form-check"
              name="onlyUnread"
              checked={fetchOptions.onlyUnread}
              onChange={handleChangeFetchOptions}
            />
            Display only unread entries on default
          </label>
        </div>
        <div className="form-group">
          <div className="form-group-heading">Default entry order</div>
          <label className="form-check-label">
            <input
              type="radio"
              className="form-check"
              name="entryOrder"
              value="newest"
              checked={fetchOptions.entryOrder === 'newest'}
              onChange={handleChangeFetchOptions}
              required
            />
            Newest
          </label>
          <label className="form-check-label">
            <input
              type="radio"
              className="form-check"
              name="entryOrder"
              value="oldest"
              checked={fetchOptions.entryOrder === 'oldest'}
              onChange={handleChangeFetchOptions}
              required
            />
            Oldest
          </label>
        </div>
        <div className="form-group">
          <button type="submit" className="button button-outline-positive">
            Save
          </button>
        </div>
      </form>
      <form className="form" onSubmit={handleSubmitStreamView}>
        <div className="form-legend">Default stream view</div>
        <div className="form-group">
          <label className="form-check-label">
            <input
              type="radio"
              className="form-check"
              name="defaultStreamView"
              value="expanded"
              checked={streamView === 'expanded'}
              onChange={handleChangeStreamView}
              required
            />
            Expanded
          </label>
          <label className="form-check-label">
            <input
              type="radio"
              className="form-check"
              name="defaultStreamView"
              value="collapsible"
              checked={streamView === 'collapsible'}
              onChange={handleChangeStreamView}
              required
            />
            Collapsible
          </label>
        </div>
        <div className="form-group">
          <button type="submit" className="button button-outline-positive">
            Save
          </button>
        </div>
      </form>
      <form className="form" onSubmit={handleSubmitCacheCapacity}>
        <div className="form-legend">Cache options</div>
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
        <div className="form-group">
          <button
            type="button"
            className="button button-outline-negative"
            onClick={handleStartClearingStreamCaches}
          >
            Clear stream caches...
          </button>
        </div>
      </form>
      <form className="form" onSubmit={handleSubmitHistoryOptions}>
        <div className="form-legend">History options</div>
        <div className="form-group">
          <label>
            <div className="form-group-heading">
              Number of stream histories to display
            </div>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                name="numStreamHistories"
                value={numStreamHistories}
                onChange={handleChangeNumStreamHistories}
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
      <ConfirmModal
        confirmButtonClassName="button button-negative"
        confirmButtonLabel="Clear"
        isOpened={isClearingStreamCaches}
        message="Are you sure you want to clear stream caches?"
        onClose={handleCancelClearingStreamCaches}
        onConfirm={onClearStreamCaches}
        title="Clear stream caches"
      />
    </section>
  );
}

export default connect({
  mapStateToProps: (state: State) => ({
    cacheCapacity: state.streams.items.capacity,
    fetchOptions: state.streams.defaultFetchOptions,
    numStreamHistories: state.histories.recentlyReadStreams.capacity,
    streamView: state.streams.defaultStreamView,
  }),
  mapDispatchToProps: bindActions({
    onChangeDefaultStreamFetchOptions: changeDefaultStreamFetchOptions,
    onChangeDefaultStreamView: changeDefaultStreamView,
    onChangeStreamCacheCapacity: changeStreamCacheCapacity,
    onChangeStreamHistoryOptions: changeStreamHistoryOptions,
    onClearStreamCaches: clearStreamCaches,
  }),
})(StreamSettings);
