import React, { PureComponent } from 'react';

import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { EntryOrder, State, StreamView } from 'messaging/types';
import { changeStreamSettings } from 'messaging/streamSettings/actions';

interface StreamSettingsProps {
    defaultEntryOrder: EntryOrder;
    defaultNumEntries: number;
    defaultStreamView: StreamView;
    onChangeStreamSettings: typeof changeStreamSettings;
    onlyUnreadEntries: boolean;
}

type StreamSettingsState = StreamSettingsProps;

class StreamSettings extends PureComponent<StreamSettingsProps, StreamSettingsState> {
    constructor(props: StreamSettingsProps, context: any) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = props;
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

        const { defaultEntryOrder, defaultNumEntries, defaultStreamView, onChangeStreamSettings, onlyUnreadEntries } = this.state;

        onChangeStreamSettings(defaultEntryOrder, defaultNumEntries, defaultStreamView, onlyUnreadEntries);
    }

    render() {
        const { defaultEntryOrder, defaultNumEntries, defaultStreamView, onlyUnreadEntries } = this.state;

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
                                name="defaultNumEntries"
                                value={defaultNumEntries + ''}
                                onChange={this.handleChange}
                                required />
                        </label>
                    </div>
                    <div className="form-group">
                        <label className="form-check-label">
                            <input
                                type="checkbox"
                                className="form-check"
                                name="onlyUnreadEntries"
                                checked={onlyUnreadEntries}
                                onChange={this.handleChange} />Display only unread entries
                        </label>
                    </div>
                    <div className="form-group">
                        <span className="form-group-heading">Default entry order</span>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="defaultEntryOrder"
                                value="newest"
                                checked={defaultEntryOrder === 'newest'}
                                onChange={this.handleChange}
                                required />Newest
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="defaultEntryOrder"
                                value="oldest"
                                checked={defaultEntryOrder === 'oldest'}
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
                                name="defaultStreamView"
                                value="expanded"
                                checked={defaultStreamView === 'expanded'}
                                onChange={this.handleChange}
                                required />Expanded view
                        </label>
                        <label className="form-check-label">
                            <input
                                type="radio"
                                className="form-check"
                                name="defaultStreamView"
                                value="collapsible"
                                checked={defaultStreamView === 'collapsible'}
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
        defaultEntryOrder: state.streamSettings.defaultEntryOrder,
        defaultNumEntries: state.streamSettings.defaultNumEntries,
        defaultStreamView: state.streamSettings.defaultStreamView,
        onlyUnreadEntries: state.streamSettings.onlyUnreadEntries
    }),
    mapDispatchToProps: bindActions({
        onChangeStreamSettings: changeStreamSettings
    })
})(StreamSettings);
