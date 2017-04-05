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
    onClose?: () => void;
    onCollapse?: (element: Element) => void;
}

export default class Entry extends PureComponent<Props, {}> {
    static propTypes = {
        entry: PropTypes.object.isRequired,
        isActive: PropTypes.bool.isRequired,
        isCollapsible: PropTypes.bool.isRequired,
        isExpanded: PropTypes.bool.isRequired,
        onClose: PropTypes.func,
        onCollapse: PropTypes.func
    };

    static defaultProps = {
        isActive: false,
        isCollapsible: false,
        isExpanded: false
    };

    constructor(props: Props, context: any) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.handleCollapse = this.handleCollapse.bind(this);
    }

    handleCollapse(event: React.SyntheticEvent<any>) {
        const { isCollapsible, isExpanded, onCollapse } = this.props;

        if (isCollapsible && !isExpanded && onCollapse) {
            event.preventDefault();

            onCollapse(findDOMNode(this));
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
        const { entry, isActive, isCollapsible, isExpanded } = this.props;

        return (
            <article
                id={'entry--' + entry.entryId}
                className={classnames('entry', {
                    'is-active': isActive,
                    'is-collapsible': isCollapsible,
                    'is-expanded': isExpanded,
                    'is-read': entry.markAsRead || !!entry.readAt
                })}>
                <EntryInner
                    entry={entry}
                    onClose={this.handleClose}
                    onCollapse={this.handleCollapse} />
            </article>
        );
    }
}
