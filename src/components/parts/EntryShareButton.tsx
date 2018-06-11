import CSSTransition from 'react-transition-group/CSSTransition';
import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Closable from 'components/widgets/Closable';
import toPopup, { PopupProps } from 'components/hoc/toPopup';

interface EntryShareButtonProps {
    url: string;
    title: string;
}

class EntryShareButton extends PureComponent<EntryShareButtonProps & PopupProps> {
    render() {
        const { closePopup, isOpened, openPopup, popupStyle, pullDirection } = this.props;

        return (
            <div className="button-group">
                <button
                    className="button button-pill button-outline-default"
                    title="Share..."
                    onClick={isOpened ? closePopup : openPopup}>
                    <i className="icon icon-20 icon-share" />
                </button>
                <CSSTransition
                    in={isOpened}
                    mountOnEnter
                    unmountOnExit
                    classNames="popover"
                    timeout={200}>
                    <div
                        style={popupStyle}
                        className={classnames('popup', 'is-pull-' + pullDirection)}>
                        <Closable onClose={closePopup}>
                            {this._renderPopover()}
                        </Closable>
                    </div>
                </CSSTransition>
            </div>
        );
    }

    private _renderPopover(): React.ReactElement<any> {
        const { url, title, pullDirection, closePopup } = this.props;

        return (
            <div className={classnames('popover', 'popover-default', 'is-pull-' + pullDirection)}>
                <div className="popover-arrow" />
                <div className="popover-content">
                    <div className="list-actions">
                        <a
                            className="list-actions-item link-soft"
                            target="_blank"
                            title="Share to Twitter"
                            href={'https://twitter.com/intent/tweet?text=' + encodeURIComponent(title + ' ' + url)}
                            onClick={closePopup}>
                            <i className="icon icon-24 icon-twitter" />
                        </a>
                        <a
                            className="list-actions-item link-soft"
                            target="_blank"
                            title="Share to Facebook"
                            href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)}
                            onClick={closePopup}>
                            <i className="icon icon-24 icon-facebook" />
                        </a>
                        <a
                            className="list-actions-item link-soft"
                            target="_blank"
                            title="Save to Hatena Bookmark"
                            href={'http://b.hatena.ne.jp/entry/' + encodeURIComponent(url)}
                            onClick={closePopup}>
                            <i className="icon icon-24 icon-hatena-bookmark" />
                        </a>
                        <a
                            className="list-actions-item link-soft"
                            target="_blank"
                            title="Save to Pocket"
                            href={'https://getpocket.com/save?url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title)}
                            onClick={closePopup}>
                            <i className="icon icon-24 icon-pocket" />
                        </a>
                        <a className="list-actions-item link-soft"
                            target="_blank"
                            title="Save to Instapaper"
                            href={'http://www.instapaper.com/text?u=' + encodeURIComponent(url)}
                            onClick={closePopup}>
                            <i className="icon icon-24 icon-instapaper" />
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}

export default toPopup<EntryShareButtonProps>(EntryShareButton, ['up', 'down']);
