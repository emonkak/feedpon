import classnames from 'classnames';
import { History, Location } from 'history';
import React, { useCallback, useEffect, useRef } from 'react';

import { Dispatcher, bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { Command, Event, KeyMapping, State } from 'feedpon-messaging';
import { commandTable } from 'feedpon-messaging/keyMappings';
import {
  closeHelp,
  closeSidebar,
  openHelp,
  openSidebar,
} from 'feedpon-messaging/ui';
import * as Trie from 'feedpon-utils/Trie';
import Modal from '../components/Modal';
import InstantNotificationContainer from '../containers/InstantNotificationContainer';
import NotificationList from '../containers/NotificationList';
import Sidebar from '../containers/Sidebar';
import useEvent from '../hooks/useEvent';
import useKeyMappings from '../hooks/useKeyMappings';
import useSwipeable from '../hooks/useSwipeable';
import KeyMappingsTable from '../modules/KeyMappingsTable';

interface SidebarLayoutProps {
  children: React.ReactNode;
  dispatch: Dispatcher<Event>;
  helpIsOpened: boolean;
  history: History;
  isLoading: boolean;
  keyMappings: Trie.Trie<KeyMapping>;
  location: Location;
  onCloseHelp: typeof closeHelp;
  onCloseSidebar: typeof closeSidebar;
  onOpenHelp: typeof openHelp;
  onOpenSidebar: typeof openSidebar;
  sidebarIsOpened: boolean;
}

function SidebarLayout({
  children,
  dispatch,
  helpIsOpened,
  history,
  isLoading,
  keyMappings,
  location,
  onCloseHelp,
  onCloseSidebar,
  onOpenSidebar,
  sidebarIsOpened,
}: SidebarLayoutProps) {
  const { onTouchStart, onTouchEnd, onTouchMove, isSwiping, coordinates } =
    useSwipeable();

  useKeyMappings(keyMappings, (keyMapping: KeyMapping) => {
    const command = (commandTable as { [key: string]: Command<any> })[
      keyMapping.commandId
    ];

    if (command) {
      const params = { ...command.defaultParams, ...keyMapping.params };
      const event = command.action(params);

      dispatch(event as any);
    }
  });

  const sidebarWidthRef = useRef(0);

  const sidebarRef = useCallback((node: HTMLDivElement) => {
    sidebarWidthRef.current = node.getBoundingClientRect().width;
  }, []);

  const handleTransitionEnd = useEvent(() => {
    if (!sidebarIsOpened) {
      updateSidebarStatus(false);
    }
  });

  useEffect(() => {
    if (location.pathname.indexOf('/streams/') !== 0) {
      scrollTo(0, 0);
    }

    if (sidebarIsOpened && isMobileLayout()) {
      onCloseSidebar();
    }
  }, [location]);

  useEffect(() => {
    if (sidebarIsOpened) {
      document.documentElement.classList.add('sidebar-is-opened');
    } else {
      document.documentElement.classList.remove('sidebar-is-opened');
    }

    return () => {
      document.documentElement.classList.remove('sidebar-is-opened');
    };
  }, [sidebarIsOpened]);

  useEffect(() => {
    if (isSwiping) {
      updateSwipingStatus(true);
    } else {
      const { initialX, destX } = coordinates;
      const tolerance = sidebarWidthRef.current / 2;

      if (sidebarIsOpened) {
        if (initialX > destX && initialX - destX > tolerance) {
          onCloseSidebar();
        }
      } else {
        if (initialX < destX && destX - initialX > tolerance) {
          onOpenSidebar();
        }
      }

      updateSwipingStatus(false);
    }
  }, [isSwiping]);

  const swipeDistance = sidebarIsOpened
    ? clamp(
        coordinates.destX - coordinates.initialX,
        -sidebarWidthRef.current,
        0,
      )
    : clamp(
        coordinates.destX - coordinates.initialX,
        0,
        sidebarWidthRef.current,
      );
  const swipeProgress = Math.abs(swipeDistance) / sidebarWidthRef.current;

  const sidebarStyle = isSwiping
    ? {
        left: sidebarIsOpened
          ? swipeDistance
          : swipeDistance - sidebarWidthRef.current,
      }
    : {};
  const mainStyle = isSwiping
    ? {
        paddingLeft: sidebarIsOpened
          ? swipeDistance + sidebarWidthRef.current
          : swipeDistance,
      }
    : {};
  const overlayStyle = isSwiping
    ? {
        opacity: sidebarIsOpened ? 1 - swipeProgress : swipeProgress,
        visibility: 'visible' as const,
      }
    : {};

  return (
    <div className={classnames('l-root', { 'is-swiping': isSwiping })}>
      <div
        className={classnames('l-sidebar', {
          'is-opened': sidebarIsOpened,
        })}
        style={sidebarStyle}
        ref={sidebarRef}
        onTransitionEnd={handleTransitionEnd}
      >
        <Sidebar history={history} location={location} />
      </div>
      <div className="l-main" style={mainStyle}>
        <div className="l-notifications">
          <NotificationList />
        </div>
        <div className="l-instant-notifications">
          <InstantNotificationContainer />
        </div>
        {children}
        <div
          className="l-overlay"
          style={overlayStyle}
          onClick={onCloseSidebar}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
        <div
          className="l-swipeable-edge"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      </div>
      <div className="l-backdrop">
        {isLoading ? (
          <i className="icon icon-48 icon-spinner animation-rotating" />
        ) : null}
      </div>
      <Modal onClose={onCloseHelp} isOpened={helpIsOpened}>
        <KeyMappingsTable
          commandTable={commandTable as any}
          keyMappings={keyMappings}
        />
      </Modal>
    </div>
  );
}

function updateSidebarStatus(isOpened: boolean): void {
  if (isOpened) {
    document.documentElement.classList.add('sidebar-is-opened');
  } else {
    document.documentElement.classList.remove('sidebar-is-opened');
  }
}

function updateSwipingStatus(isSwiping: boolean): void {
  if (isSwiping) {
    document.documentElement.classList.add('sidebar-is-swiping');
  } else {
    document.documentElement.classList.remove('sidebar-is-swiping');
  }
}

function isMobileLayout() {
  return matchMedia('(max-width: 768px)').matches;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export default connect(() => ({
  mapStateToProps: (state: State) => ({
    helpIsOpened: state.ui.helpIsOpened,
    isLoading: state.backend.isLoading || state.subscriptions.isImporting,
    keyMappings: state.keyMappings.items,
    sidebarIsOpened: state.ui.sidebarIsOpened,
  }),
  mapDispatchToProps: (dispatch) => ({
    ...bindActions({
      onCloseHelp: closeHelp,
      onCloseSidebar: closeSidebar,
      onOpenHelp: openHelp,
      onOpenSidebar: openSidebar,
    })(dispatch),
    dispatch,
  }),
}))(SidebarLayout);
