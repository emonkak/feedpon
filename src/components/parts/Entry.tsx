import React, { PureComponent } from 'react';
import classnames from 'classnames';

import EntryInner from 'components/parts/EntryInner';
import { Entry } from 'messaging/types';

interface EntryProps {
    entry: Entry;
    index: number;
    isActive?: boolean;
    isCollapsible?: boolean;
    isExpanded?: boolean;
    onExpand: (index: number) => void;
    onFetchComments: (entryId: string | number, url: string) => void;
    onFetchFullContent: (entryId: string | number, url: string) => void;
    onHideComments: (entryId: string | number) => void;
    onHideFullContents: (entryId: string | number) => void;
    onPin: (entryId: string | number) => void;
    onShowComments: (entryId: string | number) => void;
    onShowFullContents: (entryId: string | number) => void;
    onUnpin: (entryId: string | number) => void;
    sameOrigin: boolean;
}

export default class EntryComponent extends PureComponent<EntryProps, {}> {
    static defaultProps = {
        isActive: false,
        isCollapsible: false,
        isExpanded: false
    };

    constructor(props: EntryProps, context: any) {
        super(props, context);

        this.handleExpand = this.handleExpand.bind(this);
        this.handleFetchNextFullContent = this.handleFetchNextFullContent.bind(this);
        this.handleToggleComments = this.handleToggleComments.bind(this);
        this.handleToggleFullContent = this.handleToggleFullContent.bind(this);
        this.handleTogglePin = this.handleTogglePin.bind(this);
    }

    handleExpand(event: React.MouseEvent<any>) {
        const { index, isCollapsible, isExpanded, onExpand } = this.props;

        if (isCollapsible && !isExpanded && onExpand) {
            const target = event.target as HTMLElement;

            if (target === event.currentTarget
                || (!target.closest('a') && !target.closest('button'))) {
                event.preventDefault();

                onExpand(index);
            }
        }
    }

    handleFetchNextFullContent() {
        const { entry, onFetchFullContent } = this.props;

        if (entry.fullContents.isLoaded) {
            const lastFullContent = entry.fullContents.items[entry.fullContents.items.length - 1];

            if (lastFullContent && lastFullContent.nextPageUrl) {
                onFetchFullContent(entry.entryId, lastFullContent.nextPageUrl);
            }
        }
    }

    handleToggleComments(event: React.MouseEvent<any>) {
        const { entry, onFetchComments, onHideComments, onShowComments } = this.props;

        if (entry.comments.isLoaded) {
            if (entry.comments.isShown) {
                onHideComments(entry.entryId);
            } else {
                onShowComments(entry.entryId);
            }
        } else {
            onFetchComments(entry.entryId, entry.url);
        }
    }

    handleToggleFullContent(event: React.MouseEvent<any>) {
        const { entry, onFetchFullContent, onHideFullContents, onShowFullContents } = this.props;

        if (!entry.fullContents.isLoading) {
            if (!entry.fullContents.isLoaded) {
                onFetchFullContent(entry.entryId, entry.url);
            }

            if (entry.fullContents.isShown) {
                onHideFullContents(entry.entryId);
            } else {
                onShowFullContents(entry.entryId);
            }
        }
    }

    handleTogglePin(event: React.MouseEvent<any>) {
        const { entry, onPin, onUnpin } = this.props;

        if (!entry.isPinning) {
            if (entry.isPinned) {
                onUnpin(entry.entryId);
            } else {
                onPin(entry.entryId);
            }
        }
    }

    render() {
        const { entry, isActive, isCollapsible, isExpanded, sameOrigin } = this.props;

        return (
            <article
                className={classnames('entry', {
                    'is-active': isActive,
                    'is-collapsible': isCollapsible,
                    'is-expanded': isExpanded,
                    'is-marked-as-read': entry.markedAsRead,
                    'is-pinned': entry.isPinned
                })}
                onClick={this.handleExpand}>
                <EntryInner
                    entry={entry}
                    onExpand={this.handleExpand}
                    onFetchNextFullContent={this.handleFetchNextFullContent}
                    onToggleComments={this.handleToggleComments}
                    onToggleFullContent={this.handleToggleFullContent}
                    onTogglePin={this.handleTogglePin}
                    sameOrigin={sameOrigin} />
            </article>
        );
    }
}
