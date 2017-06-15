import React, { PureComponent } from 'react';

import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, StreamOptions, StreamView } from 'messaging/types';
import { changeDefaultStreamOptions, changeDefaultStreamView } from 'messaging/streamSettings/actions';

interface StreamSettingsProps {
    onChangeDefaultStreamOptions: typeof changeDefaultStreamOptions;
    onChangeDefaultStreamView: typeof changeDefaultStreamView;
    options: StreamOptions;
    streamView: StreamView;
}

class StreamSettings extends PureComponent<StreamSettingsProps, {}> {
    constructor(props: StreamSettingsProps, context: any) {
        super(props);

        this.handleChangeStreamOption = this.handleChangeStreamOption.bind(this);
        this.handleChangeStreamView = this.handleChangeStreamView.bind(this);
    }

    handleChangeStreamOption(event: React.FormEvent<HTMLInputElement>) {
        const { onChangeDefaultStreamOptions, options } = this.props;
        const target = event.currentTarget;
        const name = target.name;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        const nextOptions = {
            ...options,
            [name]: value
        };

        onChangeDefaultStreamOptions(nextOptions);
    }

    handleChangeStreamView(event: React.FormEvent<HTMLInputElement>) {
        const { onChangeDefaultStreamView } = this.props;
        const target = event.currentTarget;

        onChangeDefaultStreamView(target.value as StreamView);
    }

    render() {
        const { options, streamView } = this.props;

        return (
            <section className="section">
                <h1 className="display-1">Stream</h1>
                <div className="form">
                    <div className="form-group">
                        <label>
                            <span className="form-group-heading">Default display number of entries</span>
                            <input
                                type="number"
                                className="form-control"
                                name="numEntries"
                                value={options.numEntries + ''}
                                onChange={this.handleChangeStreamOption}
                                required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label className="form-check-label">
                            <input
                                type="checkbox"
                                className="form-check"
                                name="onlyUnread"
                                checked={options.onlyUnread}
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
                                checked={options.entryOrder === 'newest'}
                                onChange={this.handleChangeStreamOption}
                                required />Newest
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="entryOrder"
                                value="oldest"
                                checked={options.entryOrder === 'oldest'}
                                onChange={this.handleChangeStreamOption}
                                required />Oldest
                        </label>
                    </div>
                    <div className="form-group">
                        <span className="form-group-heading">Default stream view</span>
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
            </section>
        );
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        options: state.streamSettings.defaultOptions,
        streamView: state.streamSettings.defaultStreamView
    }),
    mapDispatchToProps: bindActions({
        onChangeDefaultStreamOptions: changeDefaultStreamOptions,
        onChangeDefaultStreamView: changeDefaultStreamView
    })
})(StreamSettings);
