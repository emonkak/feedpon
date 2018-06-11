import React, { PureComponent } from 'react';

import ConfirmModal from 'view/components/ConfirmModal';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, StreamFetchOptions, StreamViewKind } from 'messaging/types';
import { changeDefaultStreamFetchOptions, changeDefaultStreamView, changeStreamCacheCapacity, changeStreamHistoryOptions, clearStreamCaches } from 'messaging/streams/actions';

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

interface StreamSettingsState {
    cacheCapacity: number;
    fetchOptions: StreamFetchOptions;
    isClearingStreamCaches: boolean;
    numStreamHistories: number;
    streamView: StreamViewKind;
}

class StreamSettings extends PureComponent<StreamSettingsProps, StreamSettingsState> {
    constructor(props: StreamSettingsProps) {
        super(props);

        this.state = {
            cacheCapacity: props.cacheCapacity,
            fetchOptions: props.fetchOptions,
            isClearingStreamCaches: false,
            numStreamHistories: props.numStreamHistories,
            streamView: props.streamView
        };
    }

    render() {
        const { onClearStreamCaches } = this.props;
        const { cacheCapacity, fetchOptions, isClearingStreamCaches, numStreamHistories, streamView } = this.state;

        return (
            <section className="section">
                <h1 className="display-1">Stream</h1>
                <form className="form" onSubmit={this._handleSubmitFetchOptions}>
                    <div className="form-legend">Fetch options</div>
                    <div className="form-group">
                        <label>
                            <div className="form-group-heading">Default fetch number of entries</div>
                            <input
                                type="number"
                                className="form-control"
                                name="numEntries"
                                value={fetchOptions.numEntries + ''}
                                onChange={this._handleChangeFetchOptions}
                                min={1}
                                max={1000}
                                required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label className="form-check-label">
                            <input
                                type="checkbox"
                                className="form-check"
                                name="onlyUnread"
                                checked={fetchOptions.onlyUnread}
                                onChange={this._handleChangeFetchOptions} />
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
                                onChange={this._handleChangeFetchOptions}
                                required />Newest
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="entryOrder"
                                value="oldest"
                                checked={fetchOptions.entryOrder === 'oldest'}
                                onChange={this._handleChangeFetchOptions}
                                required />Oldest
                        </label>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="button button-outline-positive">Save</button>
                    </div>
                </form>
                <form className="form" onSubmit={this._handleSubmitStreamView}>
                    <div className="form-legend">Default stream view</div>
                    <div className="form-group">
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                value="expanded"
                                checked={streamView === 'expanded'}
                                onChange={this._handleChangeStreamView}
                                required />Expanded
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                value="collapsible"
                                checked={streamView === 'collapsible'}
                                onChange={this._handleChangeStreamView}
                                required />Collapsible
                        </label>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="button button-outline-positive">Save</button>
                    </div>
                </form>
                <form className="form" onSubmit={this._handleSubmitCacheCapacity}>
                    <div className="form-legend">Cache options</div>
                    <div className="form-group">
                        <label>
                            <div className="form-group-heading">Cache capacity</div>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    value={cacheCapacity + ''}
                                    onChange={this._handleChangeCacheCapacity}
                                    min={1}
                                    required />
                                <button type="submit" className="button button-outline-positive">Save</button>
                            </div>
                        </label>
                    </div>
                    <div className="form-group">
                        <button
                            type="button"
                            className="button button-outline-negative"
                            onClick={this._handleStartClearingStreamCaches}>
                        Clear stream caches...
                        </button>
                    </div>
                </form>
                <form className="form" onSubmit={this._handleSubmitHistoryOptions}>
                    <div className="form-legend">History options</div>
                    <div className="form-group">
                        <label>
                            <div className="form-group-heading">Number of stream histories to display</div>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    name="numStreamHistories"
                                    value={numStreamHistories}
                                    onChange={this._handleChangeNumStreamHistories}
                                    min={1}
                                    required />
                                <button type="submit" className="button button-outline-positive">Save</button>
                            </div>
                        </label>
                    </div>
                </form>
                <ConfirmModal
                    confirmButtonClassName="button button-negative"
                    confirmButtonLabel="Clear"
                    isOpened={isClearingStreamCaches}
                    message="Are you sure you want to clear stream caches?"
                    onClose={this._handleCancelClearingStreamCaches}
                    onConfirm={onClearStreamCaches}
                    title="Clear stream caches" />
            </section>
        );
    }

    private _handleCancelClearingStreamCaches = (): void => {
        this.setState({
            isClearingStreamCaches: false
        });
    }

    private _handleChangeNumStreamHistories = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const numStreamHistories = parseInt(event.currentTarget.value, 10);

        this.setState({
            numStreamHistories
        });
    }

    private _handleChangeCacheCapacity = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const cacheCapacity = parseInt(event.currentTarget.value, 10);

        this.setState({
            cacheCapacity
        });
    }

    private _handleChangeFetchOptions = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const target = event.currentTarget;
        const name = target.name;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        this.setState((state) => ({
            fetchOptions: {
                ...state.fetchOptions,
                [name]: value
            }
        }));
    }

    private _handleChangeStreamView = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const streamView = event.currentTarget.value as StreamViewKind;

        this.setState({
            streamView
        });
    }

    private _handleStartClearingStreamCaches = (): void => {
        this.setState({
            isClearingStreamCaches: true
        });
    }

    private _handleSubmitFetchOptions = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const { onChangeDefaultStreamFetchOptions } = this.props;
        const { fetchOptions } = this.state;

        onChangeDefaultStreamFetchOptions(fetchOptions);
    }

    private _handleSubmitStreamView = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const { onChangeDefaultStreamView } = this.props;
        const { streamView } = this.state;

        onChangeDefaultStreamView(streamView);
    }

    private _handleSubmitHistoryOptions = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const { numStreamHistories } = this.state;
        const { onChangeStreamHistoryOptions } = this.props;

        onChangeStreamHistoryOptions(numStreamHistories);
    }

    private _handleSubmitCacheCapacity = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const { onChangeStreamCacheCapacity } = this.props;
        const { cacheCapacity } = this.state;

        onChangeStreamCacheCapacity(cacheCapacity);
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        cacheCapacity: state.streams.items.capacity,
        fetchOptions: state.streams.defaultFetchOptions,
        numStreamHistories: state.histories.recentlyReadStreams.capacity,
        streamView: state.streams.defaultStreamView
    }),
    mapDispatchToProps: bindActions({
        onChangeDefaultStreamFetchOptions: changeDefaultStreamFetchOptions,
        onChangeDefaultStreamView: changeDefaultStreamView,
        onChangeStreamCacheCapacity: changeStreamCacheCapacity,
        onChangeStreamHistoryOptions: changeStreamHistoryOptions,
        onClearStreamCaches: clearStreamCaches
    })
})(StreamSettings);
