import React, { PureComponent } from 'react';

import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, StreamSetting } from 'messaging/types';
import { changeDefaultStreamSetting } from 'messaging/streamSettings/actions';

interface StreamSettingsProps {
    defaultSetting: StreamSetting;
    onChangeDefaultStreamSetting: typeof changeDefaultStreamSetting;
}

type StreamSettingsState = StreamSetting;

class StreamSettings extends PureComponent<StreamSettingsProps, StreamSettingsState> {
    constructor(props: StreamSettingsProps, context: any) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = props.defaultSetting;
    }

    handleChange(event: React.FormEvent<HTMLInputElement>) {
        const target = event.currentTarget;
        const name = target.name;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        this.setState(state => ({
            ...state,
            [name]: value
        }));
    }

    handleSubmit(event: React.FormEvent<any>) {
        event.preventDefault();

        const { onChangeDefaultStreamSetting } = this.props;

        onChangeDefaultStreamSetting(this.state);
    }

    render() {
        const { entryOrder, numEntries, onlyUnread, streamView } = this.state;

        return (
            <section className="section">
                <h1 className="display-1">Stream</h1>
                <form className="form" onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <label>
                            <span className="form-group-heading">Default display number of entries</span>
                            <input
                                type="number"
                                className="form-control"
                                name="numEntries"
                                value={numEntries + ''}
                                onChange={this.handleChange}
                                required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label className="form-check-label">
                            <input
                                type="checkbox"
                                className="form-check"
                                name="onlyUnread"
                                checked={onlyUnread}
                                onChange={this.handleChange} />
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
                                checked={entryOrder === 'newest'}
                                onChange={this.handleChange}
                                required />Newest
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="entryOrder"
                                value="oldest"
                                checked={entryOrder === 'oldest'}
                                onChange={this.handleChange}
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
                                onChange={this.handleChange}
                                required />Expanded view
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="streamView"
                                value="collapsible"
                                checked={streamView === 'collapsible'}
                                onChange={this.handleChange}
                                required />Collapsible view
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
        defaultSetting: state.streamSettings.defaultSetting
    }),
    mapDispatchToProps: bindActions({
        onChangeDefaultStreamSetting: changeDefaultStreamSetting
    })
})(StreamSettings);
