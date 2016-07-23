import Entry from './Entry';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';
import ScrollSpy from './ScrollSpy';
import Waypoint from 'react-waypoint';
import appContextTypes from '../../shared/components/react/appContextTypes';
import { EntryActivated } from '../../constants/eventTypes';
import { FetchContents } from '../../constants/actionTypes';

export default class Contents extends React.Component {
    static propTypes = {
        contents: React.PropTypes.object,
        activeEntry: React.PropTypes.object
    };

    static contextTypes = appContextTypes;

    constructor() {
        super();
        this.state = { isLoading: false };
    }

    componentWillMount() {
        const { params } = this.props;

        this.context.dispatch({
            actionType: FetchContents,
            payload: {
                streamId: params.streamId
            }
        });
    }

    componentWillUpdate(nextProps) {
        const { params, contents } = this.props;

        if (params.streamId !== nextProps.params.streamId) {
            this.context.dispatch({
                actionType: FetchContents,
                payload: {
                    streamId: nextProps.params.streamId
                }
            });
        }

        if (contents !== nextProps.contents) {
            this.setState({ isLoading: false });
        }
    }

    render() {
        const { contents, activeEntry } = this.props;

        if (contents) {
            const { isLoading } = this.state;
            const waypoint = !isLoading && contents.continuation
                ? <Waypoint onEnter={::this._handleLoading} threshold={2.0} />
                : null;

            return (
                <div>
                    <ScrollSpy className="entries"
                            useWindowAsScrollContainer
                            onActivated={::this._handleActivated}>
                        {this._renderEntries()}
                    </ScrollSpy>
                    {waypoint}
                </div>
            );
        } else {
            return (
                <div>Now Loading...</div>
            )
        }
    }

    _renderEntries() {
        const { contents, activeEntry } = this.props;

        return contents.items.map(item => {
            const isActive = !!(activeEntry && item.id === activeEntry.id);
            return (
                <Entry key={item.id} entry={item} isActive={isActive} />
            );
        });
    }

    _handleLoading() {
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

    _handleActivated(ref) {
        const { activeEntry } = this.props;

        if (activeEntry == null || ref.props.entry.id !== activeEntry.id) {
            this.context.dispatchEvent({
                eventType: EntryActivated,
                entry: ref.props.entry
            });
        }
    }
}

Object.assign(Contents.prototype, PureRenderMixin);
