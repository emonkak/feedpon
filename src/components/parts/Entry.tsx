import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';

import EntryInner from 'components/parts/EntryInner';
import { Entry, EntryPopoverKind } from 'messaging/types';

interface EntryProps {
    entry: Entry;
    isActive?: boolean;
    isCollapsible?: boolean;
    isExpanded?: boolean;
    onClose: () => void;
    onExpand: (entryId: string | number, element: Element) => void;
    onFetchComments: (entryId: string | number, url: string) => void;
    onFetchFullContent: (entryId: string | number, url: string) => void;
    onHideFullContents: (entryId: string | number) => void;
    onPin: (entryId: string | number) => void;
    onShowFullContents: (entryId: string | number) => void;
    onUnpin: (entryId: string | number) => void;
    sameOrigin: boolean;
}

interface EntryState {
    popover: EntryPopoverKind;
}

export default class EntryComponent extends PureComponent<EntryProps, EntryState> {
    static defaultProps = {
        isActive: false,
        isCollapsible: false,
        isExpanded: false
    };

    constructor(props: EntryProps, context: any) {
        super(props, context);

        this.state = {
            popover: 'none'
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleExpand = this.handleExpand.bind(this);
        this.handleFetchNextFullContent = this.handleFetchNextFullContent.bind(this);
        this.handleSwitchCommentPopover = this.handleSwitchCommentPopover.bind(this);
        this.handleSwitchSharePopover = this.handleSwitchSharePopover.bind(this);
        this.handleToggleFullContent = this.handleToggleFullContent.bind(this);
        this.handleTogglePin = this.handleTogglePin.bind(this);
    }

    handleClose(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isCollapsible, isExpanded, onClose } = this.props;

        if (onClose && isCollapsible && isExpanded) {
            onClose();
        }
    }

    handleExpand(event: React.SyntheticEvent<any>) {
        const { entry, isCollapsible, isExpanded, onExpand } = this.props;

        if (isCollapsible && !isExpanded && onExpand) {
            const target = event.target as HTMLElement;

            if (target === event.currentTarget
                || (!target.closest('a') && !target.closest('button'))) {
                event.preventDefault();

                onExpand(entry.entryId, findDOMNode(this));
            }
        }
    }

    handleFetchNextFullContent() {
        const { entry, onFetchFullContent } = this.props;

        if (entry.fullContents.isLoaded) {
            const latestFullContent = entry.fullContents.items[entry.fullContents.items.length - 1];

            if (latestFullContent && latestFullContent.nextPageUrl) {
                onFetchFullContent(entry.entryId, latestFullContent.nextPageUrl);
            }
        }
    }

    handleSwitchCommentPopover(event: React.SyntheticEvent<any>) {
        this.changePopover('comment');
    }

    handleSwitchSharePopover(event: React.SyntheticEvent<any>) {
        this.changePopover('share');
    }

    handleToggleFullContent(event: React.SyntheticEvent<any>) {
        const { entry, onFetchFullContent, onHideFullContents, onShowFullContents } = this.props;

        if (!entry.fullContents.isLoading) {
            if (!entry.fullContents.isLoaded) {
                if (!entry.fullContents.isLoaded) {
                    onFetchFullContent(entry.entryId, entry.url);
                }
            }

            if (entry.fullContents.isShown) {
                onHideFullContents(entry.entryId);
            } else {
                onShowFullContents(entry.entryId);
            }
        }
    }

    handleTogglePin(event: React.SyntheticEvent<any>) {
        const { entry, onPin, onUnpin } = this.props;

        if (!entry.isPinning) {
            if (entry.isPinned) {
                onUnpin(entry.entryId);
            } else {
                onPin(entry.entryId);
            }
        }
    }

    changePopover(nextPopover: EntryPopoverKind) {
        const { popover } = this.state;

        if (popover === nextPopover) {
            this.setState((state) => ({
                ...state,
                popover: 'none'
            }));
        } else {
            if (nextPopover === 'comment') {
                const { entry, onFetchComments } = this.props;

                if (!entry.comments.isLoaded) {
                    onFetchComments(entry.entryId, entry.url);
                }
            }

            this.setState((state) => ({
                ...state,
                popover: nextPopover
            }));
        }
    }

    render() {
        const { entry, isActive, isCollapsible, isExpanded, sameOrigin } = this.props;
        const { popover } = this.state;

        return (
            <article
                id={'entry-' + entry.entryId}
                className={classnames('entry', {
                    'is-active': isActive,
                    'is-collapsible': isCollapsible,
                    'is-expanded': isExpanded,
                    'is-marked-as-read': entry.markedAsRead,
                    'is-pinned': entry.isPinned
                })}>
                <EntryInner
                    entry={entry}
                    onClose={this.handleClose}
                    onExpand={this.handleExpand}
                    onFetchNextFullContent={this.handleFetchNextFullContent}
                    onSwitchCommentPopover={this.handleSwitchCommentPopover}
                    onSwitchSharePopover={this.handleSwitchSharePopover}
                    onToggleFullContent={this.handleToggleFullContent}
                    onTogglePin={this.handleTogglePin}
                    popover={popover}
                    sameOrigin={sameOrigin} />
            </article>
        );
    }
}
