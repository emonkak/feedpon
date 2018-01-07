import React, { PureComponent } from 'react';

import EntryComponent from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/widgets/ScrollSpy';
import { Entry, StreamViewKind } from 'messaging/types';

const SCROLL_OFFSET = 48;

interface EntryListProps {
    activeEntryIndex: number;
    entries: Entry[];
    expandedEntryIndex: number;
    isLoaded: boolean;
    isLoading: boolean;
    onChangeActiveEntry: (index: number) => void;
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
    streamView: StreamViewKind;
}

export default class EntryList extends PureComponent<EntryListProps, {}> {
    renderEntry(entry: Entry, index: number) {
        const {
            onExpand,
            onFetchComments,
            onFetchFullContent,
            onHideComments,
            onHideFullContents,
            onPin,
            onShowComments,
            onShowFullContents,
            onUnpin,
            sameOrigin,
            streamView
        } = this.props;
        const { activeEntryIndex, expandedEntryIndex } = this.props;

        return (
            <EntryComponent
                entry={entry}
                index={index}
                isActive={index === activeEntryIndex}
                isCollapsible={streamView === 'collapsible'}
                isExpanded={streamView === 'expanded' || index === expandedEntryIndex}
                key={entry.entryId}
                onExpand={onExpand}
                onFetchComments={onFetchComments}
                onFetchFullContent={onFetchFullContent}
                onHideComments={onHideComments}
                onHideFullContents={onHideFullContents}
                onPin={onPin}
                onShowComments={onShowComments}
                onShowFullContents={onShowFullContents}
                onUnpin={onUnpin}
                sameOrigin={sameOrigin} />
        );
    }

    render() {
        const { isLoaded, isLoading, streamView } = this.props;

        if (isLoading && !isLoaded) {
            const isExpanded = streamView === 'expanded';

            return (
                <div className="entry-list">
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                    <EntryPlaceholder isExpanded={isExpanded} />
                </div>
            );
        }

        const { entries, onChangeActiveEntry } = this.props;

        return (
            <div className="entry-list">
                <ScrollSpy
                    marginTop={SCROLL_OFFSET}
                    onUpdate={onChangeActiveEntry}>
                    {entries.map(this.renderEntry, this)}
                </ScrollSpy>
            </div>
        );
    }
}
