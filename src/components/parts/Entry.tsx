import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';

import EntryInner from 'components/parts/EntryInner';
import { Entry as EntryType } from 'messaging/types';

interface Props {
    entry: EntryType;
    isActive?: boolean;
    isCollapsible?: boolean;
    isExpanded?: boolean;
    onClose: () => void;
    onExpand: (entryId: string, element: Element) => void;
    onFetchComments: (entryId: string, url: string) => void;
    onFetchFullContent: (entryId: string, url: string) => void;
}

export default class Entry extends PureComponent<Props, {}> {
    static propTypes = {
        entry: PropTypes.object.isRequired,
        isActive: PropTypes.bool.isRequired,
        isCollapsible: PropTypes.bool.isRequired,
        isExpanded: PropTypes.bool.isRequired,
        onClose: PropTypes.func,
        onExpand: PropTypes.func,
        onFetchComments: PropTypes.func,
        onFetchFullContent: PropTypes.func
    };

    static defaultProps = {
        isActive: false,
        isCollapsible: false,
        isExpanded: false
    };

    constructor(props: Props, context: any) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.handleExpand = this.handleExpand.bind(this);
    }

    handleExpand(event: React.SyntheticEvent<any>) {
        const { entry, isCollapsible, isExpanded, onExpand } = this.props;

        if (isCollapsible && !isExpanded && onExpand) {
            event.preventDefault();

            onExpand(entry.entryId, findDOMNode(this));
        }
    }

    handleClose(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isCollapsible, isExpanded, onClose } = this.props;

        if (onClose && isCollapsible && isExpanded) {
            onClose();
        }
    }

    render() {
        const { entry, isActive, isCollapsible, isExpanded, onFetchComments, onFetchFullContent } = this.props;

        return (
            <article
                id={'entry-' + entry.entryId}
                className={classnames('entry', {
                    'is-active': isActive,
                    'is-collapsible': isCollapsible,
                    'is-expanded': isExpanded,
                    'is-unread': !entry.readAt
                })}>
                <EntryInner
                    entry={entry}
                    onClose={this.handleClose}
                    onExpand={this.handleExpand}
                    onFetchComments={onFetchComments}
                    onFetchFullContent={onFetchFullContent} />
            </article>
        );
    }
}
