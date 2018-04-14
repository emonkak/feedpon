import React, { PureComponent } from 'react';
import { createSelector } from 'reselect';

import EntryFrame from 'components/parts/Entry';
import LazyListRenderer, { Positioning, Rectangle } from 'components/widgets/LazyListRenderer';
import { Entry, StreamViewKind } from 'messaging/types';
import { ExpandedEntryPlaceholder, CollapsedEntryPlaceholder } from 'components/parts/EntryPlaceholder';

const SCROLL_OFFSET = 48;

interface EntryListProps {
    activeEntryIndex: number;
    readEntryIndex: number;
    entries: Entry[];
    expandedEntryIndex: number;
    heightCache: { [id: string]: number };
    isLoaded: boolean;
    isLoading: boolean;
    isScrolling: boolean;
    onChangeActiveEntry: (index: number) => void;
    onExpand: (index: number) => void;
    onFetchComments: (entryId: string | number, url: string) => void;
    onFetchFullContent: (entryId: string | number, url: string) => void;
    onHeightUpdated: (heights: { [id: string]: number }) => void;
    onHideComments: (entryId: string | number) => void;
    onHideFullContents: (entryId: string | number) => void;
    onPin: (entryId: string | number) => void;
    onShowComments: (entryId: string | number) => void;
    onShowFullContents: (entryId: string | number) => void;
    onUnpin: (entryId: string | number) => void;
    sameOrigin: boolean;
    streamView: StreamViewKind;
}

interface EntryListState {
}

interface RenderingItem {
    entry: Entry;
    isActive: boolean;
    isExpanded: boolean;
    sameOrigin: boolean;
}

export default class EntryList extends PureComponent<EntryListProps, EntryListState> {
    private _lazyListRenderer: LazyListRenderer | null = null;

    render() {
        const { isLoaded, isLoading, streamView } = this.props;
        const isExpanded = streamView === 'expanded';

        if (isLoading && !isLoaded) {
            if (isExpanded) {
                return (
                    <div className="entry-list">
                        <ExpandedEntryPlaceholder />
                        <ExpandedEntryPlaceholder />
                        <ExpandedEntryPlaceholder />
                        <ExpandedEntryPlaceholder />
                        <ExpandedEntryPlaceholder />
                    </div>
                );
            } else {
                return (
                    <div className="entry-list">
                        <CollapsedEntryPlaceholder />
                        <CollapsedEntryPlaceholder />
                        <CollapsedEntryPlaceholder />
                        <CollapsedEntryPlaceholder />
                        <CollapsedEntryPlaceholder />
                        <CollapsedEntryPlaceholder />
                        <CollapsedEntryPlaceholder />
                        <CollapsedEntryPlaceholder />
                        <CollapsedEntryPlaceholder />
                        <CollapsedEntryPlaceholder />
                    </div>
                );
            }
        }

        const { activeEntryIndex, heightCache, isScrolling, onHeightUpdated } = this.props;

        return (
            <div className="entry-list">
                <LazyListRenderer
                    assumedItemHeight={isExpanded ? 800 : 100}
                    getViewportRectangle={getViewportRectangle}
                    idAttribute="id"
                    initialHeights={heightCache}
                    initialItemIndex={activeEntryIndex}
                    isDisabled={isScrolling}
                    items={this._getRenderingItems(this.props)}
                    onHeightUpdated={onHeightUpdated}
                    onPositioningUpdated={this._handlePositioningUpdated}
                    ref={this._handleLazyListRenderer}
                    renderItem={this._renderEntry}
                    renderList={renderListWrapper} />
            </div>
        );
    }

    scrollToIndex(index: number): void {
        if (this._lazyListRenderer) {
            this._lazyListRenderer.scrollToIndex(index);
        }
    }

    private _renderEntry = (renderingItem: RenderingItem, index: number) => {
        const {
            onExpand,
            onFetchComments,
            onFetchFullContent,
            onHideComments,
            onHideFullContents,
            onPin,
            onShowComments,
            onShowFullContents,
            onUnpin
        } = this.props;
        const { entry, isActive, isExpanded, sameOrigin } = renderingItem;

        return (
            <EntryFrame
                entry={entry}
                index={index}
                isActive={isActive}
                isExpanded={isExpanded}
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

    private _getRenderingItems: (props: EntryListProps) => RenderingItem[] = createSelector(
        (props: EntryListProps) => props.entries,
        (props: EntryListProps) => props.activeEntryIndex,
        (props: EntryListProps) => props.expandedEntryIndex,
        (props: EntryListProps) => props.sameOrigin,
        (props: EntryListProps) => props.streamView,
        (entries, activeEntryIndex, expandedEntryIndex, sameOrigin, streamView) => entries.map((entry, index) => {
            const isActive = activeEntryIndex === index;
            const isExpanded = streamView === 'expanded' || expandedEntryIndex === index;
            const id = (isExpanded ? 'e' : 'c') + '__' + entry.entryId;

            return {
                id,
                entry,
                isActive,
                isExpanded,
                sameOrigin
            };
        })
    );

    private _handlePositioningUpdated = (positioning: Positioning) => {
        const { activeEntryIndex, onChangeActiveEntry } = this.props;
        const nextActiveEntryIndex = getActiveIndex(positioning);

        if (nextActiveEntryIndex !== activeEntryIndex) {
            onChangeActiveEntry(nextActiveEntryIndex);
        }
    }

    private _handleLazyListRenderer = (lazyListRenderer: LazyListRenderer | null) => {
        this._lazyListRenderer = lazyListRenderer;
    }
}

function getViewportRectangle(): Rectangle {
    return {
        top: SCROLL_OFFSET,
        bottom: window.innerHeight - SCROLL_OFFSET
    };
}

function renderListWrapper(items: React.ReactElement<any>[], blankSpaceAbove: number, blankSpaceBelow: number) {
    return (
        <div style={{ paddingTop: blankSpaceAbove, paddingBottom: blankSpaceBelow }}>
            {items}
        </div>
    );
}

function getActiveIndex(positioning: Positioning): number {
    const rectangles = positioning.rectangles;
    if (rectangles.length === 0) {
        return -1;
    }

    const viewportRectangle = positioning.viewportRectangle;
    const viewportTop = viewportRectangle.top;
    const viewportBottom = viewportRectangle.bottom;
    const latestRectangle = rectangles[rectangles.length - 1];

    if (Math.abs(latestRectangle.bottom - viewportTop) < 1) {
        return rectangles.length;
    }

    let activeIndex = -1;
    let maxVisibleHeight = 0;

    for (let i = 0, l = rectangles.length; i < l; i++) {
        const rectangle = rectangles[i];

        if (Math.ceil(rectangle.top) >= Math.floor(viewportTop) &&
            Math.floor(rectangle.bottom) <= Math.ceil(viewportBottom)) {
            return i;
        }

        if (rectangle.top < viewportBottom &&
            rectangle.bottom > viewportTop) {
            const visibleHeight =
                Math.min(rectangle.bottom, viewportBottom) -
                Math.max(rectangle.top, viewportTop);
            if (visibleHeight > maxVisibleHeight) {
                maxVisibleHeight = visibleHeight;
                activeIndex = i;
            }
        } else {
            if (activeIndex > -1) {
                return activeIndex;
            }
        }
    }

    return activeIndex;
}
