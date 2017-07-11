import React from 'react';
import classnames from 'classnames';

import Dropdown from 'components/widgets/Dropdown';
import { MenuItem } from 'components/widgets/Menu';

interface EntryActionListProps {
    commentsIsLoading: boolean;
    commentsIsShown: boolean;
    onToggleComments: React.MouseEventHandler<any>;
    title: string;
    url: string;
}

const EntryActionList: React.SFC<EntryActionListProps> = ({
    commentsIsLoading,
    commentsIsShown,
    onToggleComments,
    title,
    url
}) => {
    return (
        <div className="button-toolbar u-flex u-flex-justify-content-center">
            <button
                className={classnames('button button-pill', commentsIsShown ? 'button-default' : 'button-outline-default')}
                title="Comments..."
                onClick={onToggleComments}>
                <i className={classnames('icon icon-20', commentsIsLoading ? 'icon-spinner icon-rotating' : 'icon-comments')} />
            </button>
            <Dropdown
                className="button-group"
                toggleButton={
                    <button
                        className="button button-pill button-outline-default"
                        title="Share...">
                        <i className="icon icon-20 icon-share" />
                    </button>
                }>
                <MenuItem
                    href={'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title + ' ' + url)}
                    target="_blank"
                    primaryText="Share to Twitter"
                    icon={<i className="icon icon-20 icon-twitter" />} />
                <MenuItem
                    href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)}
                    target="_blank"
                    primaryText="Share to Facebook"
                    icon={<i className="icon icon-20 icon-facebook" />} />
                <MenuItem
                    href={'http://b.hatena.ne.jp/add?mode=confirm&title=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url)}
                    target="_blank"
                    primaryText="Save to Hatena Bookmark"
                    icon={<i className="icon icon-20 icon-hatena-bookmark" />} />
                <MenuItem
                    href={'https://getpocket.com/save?url=' + encodeURIComponent(url) + "&title=" + encodeURIComponent(title)}
                    target="_blank"
                    primaryText="Save to Pocket"
                    icon={<i className="icon icon-20 icon-pocket" />} />
                <MenuItem
                    href={'http://www.instapaper.com/text?u=' + encodeURIComponent(url)}
                    target="_blank"
                    primaryText="Save to Instapaper"
                    icon={<i className="icon icon-20 icon-instapaper" />} />
            </Dropdown>
            <a
                className="button button-pill button-outline-default"
                href={url}
                target="_blank"
                title="Visit website">
                <i className="icon icon-20 icon-external-link" />
            </a>
        </div>
    );
};

export default EntryActionList;
