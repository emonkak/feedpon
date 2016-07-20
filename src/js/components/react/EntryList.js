import Entry from './Entry';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';
import ScrollSpy from './ScrollSpy';
import Waypoint from 'react-waypoint';
import appContextTypes from '../../shared/components/react/appContextTypes';
import { EntryActivated } from '../../constants/eventTypes';
import { FetchContents } from '../../constants/actionTypes';

export default class EntryList extends React.Component {
    static propTypes = {
        contents: React.PropTypes.object.isRequired,
        activeEntry: React.PropTypes.object
    };

    static contextTypes = appContextTypes;

    constructor() {
        super();
        this.state = { isLoading: false };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.contents !== nextProps.contents) {
            this.setState({ isLoading: false });
        }
    }

    render() {
        const { contents } = this.props;
        const { isLoading } = this.state;

        const waypoint = !isLoading && contents.continuation
            ? <Waypoint onEnter={::this.handleLoading} threshold={2.0} />
            : <div />;

        return (
            <div>
                <ScrollSpy className="entries"
                           useWindowAsScrollContainer
                           onActivated={::this.handleActivated}
                           onDeactivated={::this.handleDeactivated}>
                    {this.renderEntries()}
                </ScrollSpy>
                {waypoint}
            </div>
        );
    }

    renderEntries() {
        const { contents, activeEntry } = this.props;

        return contents.items.map(item => {
            const isActive = !!(activeEntry && item.id === activeEntry.id);
            return (
                <Entry key={item.id} entry={item} isActive={isActive} />
            );
        });
    }

    handleLoading() {
        const { contents } = this.props;

        this.setState({ isLoading: true });

        this.context.dispatch({
            actionType: FetchContents,
            payload: {
                streamId: contents.id,
                continuation: contents.continuation
            }
        });
    }

    handleActivated(element) {
        const { activeEntry } = this.props;

        if (activeEntry == null || element.props.entry.id !== activeEntry.id) {
            this.context.dispatchEvent({
                eventType: EntryActivated,
                entry: element.props.entry
            });
        }
    }

    handleDeactivated() {
    }
}

Object.assign(EntryList.prototype, PureRenderMixin);
