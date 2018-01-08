import React, { PureComponent } from 'react';
import { createSelector } from 'reselect';
import classnames from 'classnames';

import EntryFrame from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import LazyListRenderer, { Positioning } from 'components/widgets/LazyListRenderer';
import { Entry, StreamViewKind } from 'messaging/types';

const SCROLL_OFFSET = 48;

interface EntryListProps {
    activeEntryIndex: number;
    entries: Entry[];
    expandedEntryIndex: number;
    heightCache: { [id: string]: number };
    isLoaded: boolean;
    isLoading: boolean;
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

interface RenderingItem {
    entry: Entry;
    isActive: boolean;
    isExpanded: boolean;
    sameOrigin: boolean;
}

interface EntryListState {
    scrollingIndex: number | null;
}

export default class EntryList extends PureComponent<EntryListProps, EntryListState> {
    private _lazyListRenderer: LazyListRenderer | null = null;

    private _scheduledScrollId: number | null = null;

    constructor(props: EntryListProps, context: any) {
        super(props, context);

        this.state = {
            scrollingIndex: null
        };
    }

    componentDidUpdate(prevProps: EntryListProps) {
        const { activeEntryIndex, expandedEntryIndex, streamView } = this.props;

        if (streamView !== prevProps.streamView) {
            if (activeEntryIndex > -1) {
                this.scrollToIndex(activeEntryIndex);
            }
        } else if (expandedEntryIndex !== prevProps.expandedEntryIndex) {
            if (expandedEntryIndex > -1) {
                this.scrollToIndex(expandedEntryIndex);
            } else if (activeEntryIndex > -1) {
                this.scrollToIndex(activeEntryIndex);
            }
        }
    }

    render() {
        const { heightCache, isLoaded, isLoading, onHeightUpdated, streamView } = this.props;
        const isExpanded = streamView === 'expanded';

        if (isLoading && !isLoaded) {
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

        const { scrollingIndex } = this.state;

        return (
            <div
                className={classnames('entry-list', scrollingIndex !== null ? 'is-hidden' : null)}>
                <LazyListRenderer
                    assumedItemHeight={isExpanded ? 800 : 100}
                    idAttribute="id"
                    initialHeights={heightCache}
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
        this.setState({
            scrollingIndex: index
        });

        this._scheduleScrollToIndex(index);
    }

    private _scheduleScrollToIndex(index: number): void {
        if (this._scheduledScrollId !== null) {
            window.cancelAnimationFrame(this._scheduledScrollId);
        }

        this._scheduledScrollId = window.requestAnimationFrame(() => {
            if (this._lazyListRenderer) {
                const scrollPosition = this._lazyListRenderer.getScrollPosition(index) - SCROLL_OFFSET;

                if (window.scrollY === scrollPosition) {
                    this.setState({
                        scrollingIndex: null
                    });
                } else {
                    window.scrollTo(0, scrollPosition);
                }
            }

            this._scheduledScrollId = null;
        });
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
        const activeIndex = getActiveIndex(positioning);

        this.props.onChangeActiveEntry(activeIndex);

        const { scrollingIndex } = this.state;

        if (scrollingIndex !== null) {
            this._scheduleScrollToIndex(scrollingIndex);
        }
    };

    private _handleLazyListRenderer = (lazyListRenderer: LazyListRenderer | null) => {
        this._lazyListRenderer = lazyListRenderer;
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
    const viewportTop = viewportRectangle.top + SCROLL_OFFSET;
    const viewportBottom = viewportRectangle.bottom;
    const latestRectangle = rectangles[rectangles.length - 1];

    if (Math.abs(latestRectangle.bottom - viewportTop) < 1) {
        return rectangles.length;
    }

    let activeIndex = -1;
    let maxVisibleHeight = 0;

    for (let i = 0, l = rectangles.length; i < l; i++) {
        const rectangle = rectangles[i];

        if (Math.ceil(rectangle.top) >= viewportTop &&
            Math.floor(rectangle.bottom) <= viewportBottom) {
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
