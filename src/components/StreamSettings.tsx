import React, { PureComponent } from 'react';

import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, StreamFetchOptions } from 'messaging/types';
import { changeDefaultStreamFetchOptions, changeStreamCacheCapacity, changeStreamHistoryOptions } from 'messaging/streams/actions';

interface StreamSettingsProps {
    cacheCapacity: number;
    fetchOptions: StreamFetchOptions;
    numStreamHistories: number;
    onChangeDefaultStreamFetchOptions: typeof changeDefaultStreamFetchOptions;
    onChangeStreamCacheCapacity: typeof changeStreamCacheCapacity;
    onChangeStreamHistoryOptions: typeof changeStreamHistoryOptions;
}

interface StreamSettingsState {
    cacheCapacity: number;
    fetchOptions: StreamFetchOptions;
    numStreamHistories: number;
}

class StreamSettings extends PureComponent<StreamSettingsProps, StreamSettingsState> {
    constructor(props: StreamSettingsProps, context: any) {
        super(props);

        this.state = {
            cacheCapacity: props.cacheCapacity,
            fetchOptions: props.fetchOptions,
            numStreamHistories: props.numStreamHistories
        };

        this.handleChangeCacheCapacity = this.handleChangeCacheCapacity.bind(this);
        this.handleChangeFetchOptions = this.handleChangeFetchOptions.bind(this);
        this.handleChangeNumStreamHistories = this.handleChangeNumStreamHistories.bind(this);
        this.handleSubmitCacheCapacity = this.handleSubmitCacheCapacity.bind(this);
        this.handleSubmitFetchOptions = this.handleSubmitFetchOptions.bind(this);
        this.handleSubmitHistoryOptions = this.handleSubmitHistoryOptions.bind(this);
    }

    handleChangeNumStreamHistories(event: React.ChangeEvent<HTMLInputElement>) {
        const numStreamHistories = parseInt(event.currentTarget.value);

        this.setState((state) => ({
            ...state,
            numStreamHistories
        }));
    }

    handleChangeCacheCapacity(event: React.ChangeEvent<HTMLInputElement>) {
        const cacheCapacity = parseInt(event.currentTarget.value);

        this.setState((state) => ({
            ...state,
            cacheCapacity
        }));
    }

    handleChangeFetchOptions(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.currentTarget;
        const name = target.name;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        this.setState((state) => ({
            ...state,
            fetchOptions: {
                ...state.fetchOptions,
                [name]: value
            }
        }));
    }

    handleSubmitFetchOptions(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const { onChangeDefaultStreamFetchOptions } = this.props;
        const { fetchOptions } = this.state;

        onChangeDefaultStreamFetchOptions(fetchOptions);
    }

    handleSubmitHistoryOptions(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const { numStreamHistories } = this.state;
        const { onChangeStreamHistoryOptions } = this.props;

        onChangeStreamHistoryOptions(numStreamHistories);
    }

    handleSubmitCacheCapacity(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const { onChangeStreamCacheCapacity } = this.props;
        const { cacheCapacity } = this.state;

        onChangeStreamCacheCapacity(cacheCapacity);
    }

    render() {
        const { cacheCapacity, fetchOptions, numStreamHistories } = this.state;

        return (
            <section className="section">
                <h1 className="display-1">Stream</h1>
                <form className="form" onSubmit={this.handleSubmitFetchOptions}>
                    <div className="form-legend">Fetch options</div>
                    <div className="form-group">
                        <label>
                            <div className="form-group-heading">Default fetch number of entries</div>
                            <input
                                type="number"
                                className="form-control"
                                name="numEntries"
                                value={fetchOptions.numEntries + ''}
                                onChange={this.handleChangeFetchOptions}
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
                                onChange={this.handleChangeFetchOptions} />
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
                                onChange={this.handleChangeFetchOptions}
                                required />Newest
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="entryOrder"
                                value="oldest"
                                checked={fetchOptions.entryOrder === 'oldest'}
                                onChange={this.handleChangeFetchOptions}
                                required />Oldest
                        </label>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="button button-outline-positive">Save</button>
                    </div>
                </form>
                <form className="form" onSubmit={this.handleSubmitCacheCapacity}>
                    <div className="form-legend">Cache options</div>
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
                                    required />
                                <button type="submit" className="button button-outline-positive">Save</button>
                            </div>
                        </label>
                    </div>
                </form>
                <form className="form" onSubmit={this.handleSubmitHistoryOptions}>
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
                                    onChange={this.handleChangeNumStreamHistories}
                                    min={1}
                                    required />
                                <button type="submit" className="button button-outline-positive">Save</button>
                            </div>
                        </label>
                    </div>
                </form>
            </section>
        );
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        cacheCapacity: state.streams.items.capacity,
        fetchOptions: state.streams.defaultFetchOptions,
        numStreamHistories: state.histories.recentlyReadStreams.capacity
    }),
    mapDispatchToProps: bindActions({
        onChangeDefaultStreamFetchOptions: changeDefaultStreamFetchOptions,
        onChangeStreamCacheCapacity: changeStreamCacheCapacity,
        onChangeStreamHistoryOptions: changeStreamHistoryOptions
    })
})(StreamSettings);
