import React from 'react';

import CommentList from 'components/parts/CommentList';
import { Comments, EntryPopoverKind } from 'messaging/types';

interface EntryPopoverProps {
    comments: Comments;
    popover: EntryPopoverKind;
    title: string;
    url: string;
}

const EntryPopover: React.SFC<EntryPopoverProps> = (props) => {
    const { comments, popover, title, url } = props;

    switch (popover) {
        case 'comment': 
            return renderCommentPopover(comments);

        case 'share':
            return renderSharePopover(title, url);

        default:
            return null as any;
    }
};

function renderCommentPopover(comments: Comments) {
    return (
        <div className="popover popover-default popover-bottom">
            <div className="popover-arrow" style={{ left: 'calc(50% - 44px)' }} />
            <div className="popover-content">
                <CommentList isLoading={comments.isLoading} comments={comments.items} />
            </div>
        </div>
    );
}

function renderSharePopover(title: string, url: string) {
    return (
        <div className="popover popover-default popover-bottom">
            <div className="popover-arrow" style={{ left: '50%' }} />
            <div className="popover-content">
                <div className="u-text-center">
                    <div className="list-inline list-inline-divided">
                        <a
                            className="list-inline-item link-soft"
                            target="_blank"
                            title="Share to Twitter"
                            href={'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title + ' ' + url)}>
                            <i className="icon icon-24 icon-vertical-bottom icon-twitter" />
                        </a>
                        <a
                            className="list-inline-item link-soft"
                            target="_blank"
                            title="Share to Facebook"
                            href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)}>
                            <i className="icon icon-24 icon-vertical-bottom icon-facebook" />
                        </a>
                        <a
                            className="list-inline-item link-soft"
                            target="_blank"
                            title="Save to Hatena Bookmark"
                            href={'http://b.hatena.ne.jp/add?mode=confirm&title=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url)}>
                                <i className="icon icon-24 icon-vertical-bottom icon-hatena-bookmark" />
                        </a>
                        <a
                            className="list-inline-item link-soft"
                            target="_blank"
                            title="Save to Pocket"
                            href={'https://getpocket.com/save?url=' + encodeURIComponent(url) + "&title=" + encodeURIComponent(title)}>
                            <i className="icon icon-24 icon-vertical-bottom icon-pocket" />
                        </a>
                        <a
                            className="list-inline-item link-soft"
                            target="_blank"
                            title="Save to Instapaper"
                            href={'http://www.instapaper.com/text?u=' + encodeURIComponent(url)}>
                            <i className="icon icon-24 icon-vertical-bottom icon-instapaper" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EntryPopover;
