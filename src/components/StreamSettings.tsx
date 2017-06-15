import React, { PureComponent } from 'react';

import InputControl from 'components/parts/InputControl';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import formatDuration from 'utils/formatDuration';
import parseDuration, { DURATION_PATTERN } from 'utils/parseDuration';
import { State, StreamFetchOptions, StreamView } from 'messaging/types';
import { changeDefaultStreamFetchOptions, changeDefaultStreamView, changeStreamCacheOptions } from 'messaging/streams/actions';

interface StreamSettingsProps {
    cacheCapacity: number;
    cacheLifetime: number;
    fetchOptions: StreamFetchOptions;
    onChangeDefaultStreamFetchOptions: typeof changeDefaultStreamFetchOptions;
    onChangeDefaultStreamView: typeof changeDefaultStreamView;
    onChangeStreamCacheOptions: typeof changeStreamCacheOptions;
    streamView: StreamView;
}

interface StreamSettingsState {
    cacheCapacity: number;
    cacheLifetime: string;
    fetchOptions: StreamFetchOptions;
}

class StreamSettings extends PureComponent<StreamSettingsProps, StreamSettingsState> {
    constructor(props: StreamSettingsProps, context: any) {
        super(props);

        this.state = {
            cacheCapacity: props.cacheCapacity,
            cacheLifetime: formatDuration(props.cacheLifetime),
            fetchOptions: props.fetchOptions
        };

        this.handleChangeStreamCacheCapacity = this.handleChangeStreamCacheCapacity.bind(this);
        this.handleChangeStreamCacheLifetime = this.handleChangeStreamCacheLifetime.bind(this);
        this.handleChangeStreamOption = this.handleChangeStreamOption.bind(this);
        this.handleChangeStreamView = this.handleChangeStreamView.bind(this);
        this.handleSubmitCacheOptions = this.handleSubmitCacheOptions.bind(this);
        this.handleSubmitStreamFetchOptions = this.handleSubmitStreamFetchOptions.bind(this);
    }

    handleChangeStreamCacheCapacity(event: React.ChangeEvent<HTMLInputElement>) {
        const cacheCapacity = parseInt(event.currentTarget.value);

        this.setState((state) => ({
            ...state,
            cacheCapacity
        }));
    }

    handleChangeStreamCacheLifetime(event: React.ChangeEvent<HTMLInputElement>) {
        const cacheLifetime = event.currentTarget.value;

        this.setState((state) => ({
            ...state,
            cacheLifetime
        }));
    }

    handleChangeStreamOption(event: React.ChangeEvent<HTMLInputElement>) {
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

    handleChangeStreamView(event: React.ChangeEvent<HTMLInputElement>) {
        const { onChangeDefaultStreamView } = this.props;
        const target = event.currentTarget;

        onChangeDefaultStreamView(target.value as StreamView);
    }

    handleSubmitStreamFetchOptions(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const { onChangeDefaultStreamFetchOptions } = this.props;
        const { fetchOptions } = this.state;

        onChangeDefaultStreamFetchOptions(fetchOptions);
    }

    handleSubmitCacheOptions(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const { onChangeStreamCacheOptions } = this.props;
        const { cacheCapacity, cacheLifetime } = this.state;

        onChangeStreamCacheOptions(cacheCapacity, parseDuration(cacheLifetime));
    }

    render() {
        const { streamView } = this.props;
        const { cacheCapacity, cacheLifetime, fetchOptions } = this.state;

        return (
            <section className="section">
                <h1 className="display-1">Stream</h1>
                <form className="form" onSubmit={this.handleSubmitStreamFetchOptions}>
                    <div className="form-legend">Stream fetch options</div>
                    <div className="form-group">
                        <label>
                            <span className="form-group-heading">Default fetch number of entries</span>
                            <input
                                type="number"
                                className="form-control"
                                name="numEntries"
                                value={fetchOptions.numEntries + ''}
                                onChange={this.handleChangeStreamOption}
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
                                onChange={this.handleChangeStreamOption} />
                                Display only unread entries on default
                        </label>
                    </div>
                    <div className="form-group">
                        <span className="form-group-heading">Default entry order</span>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="entryOrder"
                                value="newest"
                                checked={fetchOptions.entryOrder === 'newest'}
                                onChange={this.handleChangeStreamOption}
                                required />Newest
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="entryOrder"
                                value="oldest"
                                checked={fetchOptions.entryOrder === 'oldest'}
                                onChange={this.handleChangeStreamOption}
                                required />Oldest
                        </label>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="button button-outline-positive">Save</button>
                    </div>
                </form>
                <div className="form">
                    <div className="form-legend">Default stream view</div>
                    <div className="form-group">
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="streamView"
                                value="expanded"
                                checked={streamView === 'expanded'}
                                onChange={this.handleChangeStreamView}
                                required />Expanded view
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="streamView"
                                value="collapsible"
                                checked={streamView === 'collapsible'}
                                onChange={this.handleChangeStreamView}
                                required />Collapsible view
                        </label>
                    </div>
                </div>
                <form className="form" onSubmit={this.handleSubmitCacheOptions}>
                    <div className="form-legend">Stream cache options</div>
                    <div className="form-group">
                        <label>
                            <span className="form-group-heading">Cache capacity</span>
                            <input
                                type="number"
                                className="form-control"
                                name="cacheCapacity"
                                value={cacheCapacity + ''}
                                onChange={this.handleChangeStreamCacheCapacity}
                                min={1}
                                required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            <span className="form-group-heading">Cache lifetime(hh:mm:ss)</span>
                            <InputControl
                                type="text"
                                className="form-control"
                                name="cacheLifetime"
                                onChange={this.handleChangeStreamCacheLifetime}
                                pattern={DURATION_PATTERN.source}
                                successClassName={null}
                                value={cacheLifetime}
                                required />
                        </label>
                    </div>
                    <div className="form-group">
                        <button type="submit" className="button button-outline-positive">Save</button>
                    </div>
                </form>
            </section>
        );
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        cacheCapacity: state.streams.items.capacity,
        cacheLifetime: state.streams.cacheLifetime,
        fetchOptions: state.streams.defaultFetchOptions,
        streamView: state.streams.defaultStreamView
    }),
    mapDispatchToProps: bindActions({
        onChangeDefaultStreamFetchOptions: changeDefaultStreamFetchOptions,
        onChangeDefaultStreamView: changeDefaultStreamView,
        onChangeStreamCacheOptions: changeStreamCacheOptions
    })
})(StreamSettings);
