import CSSTransition from 'react-transition-group/CSSTransition';
import React, { useRef, useState } from 'react';
import classnames from 'classnames';

import Dismissible from '../components/Dismissible';
import useEvent from '../hooks/useEvent';
import usePopup from '../hooks/usePopup';

interface EntryShareButtonProps {
  url: string;
  title: string;
}

export default function EntryShareButton({
  url,
  title,
}: EntryShareButtonProps) {
  const containerRef = useRef(null);

  const { closePopup, isOpened, openPopup, popupStyle, pullDirection } =
    usePopup(false, ['up', 'down']);
  const [isEntered, setIsEntered] = useState(false);

  const handleTogglePopup = useEvent(() => {
    if (isOpened) {
      closePopup();
    } else {
      openPopup(containerRef);
    }
  });

  const handleTransitionEntered = useEvent(() => {
    setIsEntered(true);
  });

  const handleTransitionExited = useEvent(() => {
    setIsEntered(false);
  });

  const popover = (
    <div
      className={classnames(
        'popover',
        'popover-default',
        'is-pull-' + pullDirection,
      )}
    >
      <div className="popover-arrow" />
      <div className="popover-content">
        <div className="list-actions">
          <a
            className="list-actions-item link-soft"
            target="_blank"
            title="Share to Twitter"
            href={
              'https://twitter.com/intent/tweet?text=' +
              encodeURIComponent(title + ' ' + url)
            }
            onClick={closePopup}
          >
            <i className="icon icon-24 icon-twitter" />
          </a>
          <a
            className="list-actions-item link-soft"
            target="_blank"
            title="Share to Facebook"
            href={
              'https://www.facebook.com/sharer/sharer.php?u=' +
              encodeURIComponent(url)
            }
            onClick={closePopup}
          >
            <i className="icon icon-24 icon-facebook" />
          </a>
          <a
            className="list-actions-item link-soft"
            target="_blank"
            title="Save to Hatena Bookmark"
            href={'http://b.hatena.ne.jp/entry/' + encodeURIComponent(url)}
            onClick={closePopup}
          >
            <i className="icon icon-24 icon-hatena-bookmark" />
          </a>
          <a
            className="list-actions-item link-soft"
            target="_blank"
            title="Save to Pocket"
            href={
              'https://getpocket.com/save?url=' +
              encodeURIComponent(url) +
              '&title=' +
              encodeURIComponent(title)
            }
            onClick={closePopup}
          >
            <i className="icon icon-24 icon-pocket" />
          </a>
          <a
            className="list-actions-item link-soft"
            target="_blank"
            title="Save to Instapaper"
            href={'http://www.instapaper.com/text?u=' + encodeURIComponent(url)}
            onClick={closePopup}
          >
            <i className="icon icon-24 icon-instapaper" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="button-group" ref={containerRef}>
      <button
        className="button button-pill button-outline-default"
        title="Share..."
        onClick={handleTogglePopup}
      >
        <i className="icon icon-20 icon-share" />
      </button>
      <CSSTransition
        in={isOpened}
        mountOnEnter
        unmountOnExit
        classNames="popover"
        timeout={200}
        onEntered={handleTransitionEntered}
        onExited={handleTransitionExited}
      >
        <Dismissible isDisabled={!isEntered} onDismiss={closePopup}>
          <div
            style={popupStyle}
            className={classnames('popup', 'is-pull-' + pullDirection)}
          >
            {popover}
          </div>
        </Dismissible>
      </CSSTransition>
    </div>
  );
}
