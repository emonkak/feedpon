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
    isScrolling: boolean;
    onChangeActiveEntry: (index: number) => void;
    onClose: () => void;
    onExpand: (entryId: string | number) => void;
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
            onClose,
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
                onClose={onClose}
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

        const { entries, isScrolling, onChangeActiveEntry } = this.props;

        return (
            <ScrollSpy
                isDisabled={isScrolling}
                marginTop={SCROLL_OFFSET}
                onUpdate={onChangeActiveEntry}
                renderList={renderList}>
                {entries.map(this.renderEntry, this)}
            </ScrollSpy>
        );
    }
}

function renderList(children: React.ReactNode): React.ReactElement<any> {
    return (
        <div className="entry-list">{children}</div>
    );
}
