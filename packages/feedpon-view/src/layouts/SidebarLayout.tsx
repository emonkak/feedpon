import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  classMap,
  component,
  optional,
  ref,
  styleMap,
} from '@emonkak/ebit/directives.js';
import { currentLocation } from '@emonkak/ebit/router.js';
import { type Dispatch, bindActions } from 'feedpon-flux';
import type { Store } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit';
import { StoreContext } from 'feedpon-flux/react';
import type {
  Command,
  Event,
  KeyMapping,
  State,
  Thunk,
} from 'feedpon-messaging';
import { commandTable } from 'feedpon-messaging/keyMappings';
import { closeHelp, closeSidebar, openSidebar } from 'feedpon-messaging/ui';
import * as React from 'react';

import { reactElement } from '../common/directives/reactElement';
import { keyMappingsHook } from '../common/hooks/keyMappingsHook';
import { swipeableHook } from '../common/hooks/swipeableHook';
import { KeyMappingsTable } from '../keyMappings/KeyMappingsTable';
import { Dialog } from '../primitives/Dialog';
import { Sidebar } from '../sidebar/Sidebar';
import { InstantNotificationContainer } from './InstantNotificationContainer';
import { NotificationList } from './NotificationList';

export interface SidebarLayoutProps {
  child: unknown;
}

export function SidebarLayout(
  { child }: SidebarLayoutProps,
  context: RenderContext,
): TemplateResult {
  const {
    dispatch,
    helpIsOpened,
    isLoading,
    keyMappings,
    onCloseHelp,
    onCloseSidebar,
    onOpenSidebar,
    sidebarIsOpened,
    store,
  } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        isLoading: state.backend.isLoading || state.subscriptions.isImporting,
        keyMappings: state.keyMappings.items,
        sidebarIsOpened: state.ui.sidebarIsOpened,
        helpIsOpened: state.ui.helpIsOpened,
      }),
      mapStoreToProps: (store) => ({ store }),
      mapDispatchToProps: (dispatch: Dispatch<Event | Thunk<Event>>) => ({
        ...bindActions({
          onCloseSidebar: closeSidebar,
          onOpenSidebar: openSidebar,
          onCloseHelp: closeHelp,
        })(dispatch as any),
        dispatch,
      }),
    }),
  );
  const [locationState, locationActions] = context.use(currentLocation);
  const sidebarWidthRef = context.useRef(0);

  const { onTouchStart, onTouchEnd, onTouchMove, isSwiping, coordinates } =
    context.use(swipeableHook);

  const handleTransitionEnd = context.useCallback(() => {
    if (!sidebarIsOpened) {
      updateSidebarStatus(false);
    }
  }, [sidebarIsOpened]);

  const helpTitleId = context.useId();

  context.use(
    keyMappingsHook(keyMappings, (keyMapping: KeyMapping) => {
      const command = (commandTable as { [key: string]: Command<any> })[
        keyMapping.commandId
      ];

      if (command) {
        const params = { ...command.defaultParams, ...keyMapping.params };
        const event = command.action(params);

        dispatch(event);
      }
    }),
  );

  context.useEffect(() => {
    if (locationState.url.pathname.indexOf('/streams/') !== 0) {
      scrollTo(0, 0);
    }

    if (sidebarIsOpened && isMobileLayout()) {
      onCloseSidebar();
    }
  }, [locationState]);

  context.useEffect(() => {
    if (sidebarIsOpened) {
      document.documentElement.classList.add('sidebar-is-opened');
    } else {
      document.documentElement.classList.remove('sidebar-is-opened');
    }

    return () => {
      document.documentElement.classList.remove('sidebar-is-opened');
    };
  }, [sidebarIsOpened]);

  context.useEffect(() => {
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

  const sidebarRef = (node: Element) => {
    sidebarWidthRef.current = node.getBoundingClientRect().width;
  };

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
        left:
          (sidebarIsOpened
            ? swipeDistance
            : swipeDistance - sidebarWidthRef.current) + ' px',
      }
    : {};
  const mainStyle = isSwiping
    ? {
        paddingLeft:
          (sidebarIsOpened
            ? swipeDistance + sidebarWidthRef.current
            : swipeDistance) + ' px',
      }
    : {};
  const overlayStyle = isSwiping
    ? {
        opacity: (sidebarIsOpened
          ? 1 - swipeProgress
          : swipeProgress
        ).toString(),
        visibility: 'visible',
      }
    : {};

  return context.html`
    <div class=${classMap({ 'l-root': true, 'is-swiping': isSwiping })}>
      <div
        class=${classMap({ 'l-sidebar': true, 'is-opened': sidebarIsOpened })}
        style=${styleMap(sidebarStyle)}
        ref=${ref(sidebarRef)}
        @transitionend=${handleTransitionEnd}
      >
        <${component(Sidebar, {
          locationActions: locationActions,
          url: locationState.url,
        })}>
      </div>
      <div class="l-main" style=${styleMap(mainStyle)}>
        <div class="l-notifications">
          <${reactElement(wrapStoreContext(<NotificationList />, store))}>
        </div>
        <div class="l-instant-notifications">
          <${reactElement(wrapStoreContext(<InstantNotificationContainer />, store))}>
        </div>
        <${child}>
        <div
          class="l-overlay"
          style=${styleMap(overlayStyle)}
          @click=${onCloseSidebar}
          @touchstart=${onTouchStart}
          @touchmove=${onTouchMove}
          @touchend=${onTouchEnd}
        />
        <div
          class="l-swipeable-edge"
          @ontouchstart=${onTouchStart}
          @ontouchmove=${onTouchMove}
          @ontouchend=${onTouchEnd}
        />
      </div>
      <div class=${classMap({ 'l-backdrop': true, 'is-shown': isLoading })}>
        <${optional(isLoading ? context.html`<i class="icon icon-48 icon-spinner animation-rotating"></i>` : null)}>
      </div>
    </div>
    <${component(Dialog, {
      children: (_close, context) => {
        return context.html`
          <h1 class="Modal-title" id=${helpTitleId}>Available Key Mappings</h1>
          <${component(KeyMappingsTable, {
            commandTable,
            keyMappings,
          })}>
        `;
      },
      onClose: onCloseHelp,
      open: helpIsOpened,
      ownProps: { 'aria-labelledby': helpTitleId },
    })}>
  `;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function isMobileLayout() {
  return matchMedia('(max-width: 768px)').matches;
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

function wrapStoreContext(
  element: React.ReactElement,
  store: Store<unknown, unknown>,
): React.ReactElement {
  return <StoreContext.Provider value={store}>{element}</StoreContext.Provider>;
}
