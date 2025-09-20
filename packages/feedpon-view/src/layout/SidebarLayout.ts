import { createComponent, type RenderContext } from 'barebind';
import { CurrentHistory } from 'barebind/extras/router';
import { bindActions, type Dispatch } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type {
  Command,
  Event,
  KeyMapping,
  State,
  Thunk,
} from 'feedpon-messaging';
import { commandTable } from 'feedpon-messaging/keyMappings';
import { closeHelp, closeSidebar, openSidebar } from 'feedpon-messaging/ui';

import { KeyMappingsTable } from '../keyMappings/KeyMappingsTable.ts';
import { NotificationStack } from '../notification/NotificationStack.ts';
import { OSD } from '../osd/OSD.ts';
import { Dialog } from '../primitives/Dialog.ts';
import { keyMappingsHook } from '../primitives/hooks/keyMappingsHook.ts';
import { swipeableHook } from '../primitives/hooks/swipeableHook.ts';
import { Sidebar } from '../sidebar/Sidebar.ts';

export interface SidebarLayoutProps {
  child: unknown;
}

export const SidebarLayout = createComponent(function SidebarLayout(
  { child }: SidebarLayoutProps,
  $: RenderContext,
): unknown {
  const {
    dispatch,
    helpIsOpened,
    isLoading,
    keyMappings,
    onCloseHelp,
    onCloseSidebar,
    onOpenSidebar,
    sidebarIsOpened,
  } = $.use(
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
  const [locationState, navigator] = $.use(CurrentHistory);
  const sidebarWidthRef = $.useRef(0);

  const { onTouchStart, onTouchEnd, onTouchMove, isSwiping, coordinates } =
    $.use(swipeableHook);

  const handleTransitionEnd = $.useCallback(() => {
    if (!sidebarIsOpened) {
      updateSidebarStatus(false);
    }
  }, [sidebarIsOpened]);

  const helpTitleId = $.useId();

  const handleKeyMapping = $.useCallback((keyMapping: KeyMapping) => {
    const command = (commandTable as { [key: string]: Command<any> })[
      keyMapping.commandId
    ];

    if (command !== undefined) {
      const params = { ...command.defaultParams, ...keyMapping.params };
      const event = command.action(params, { navigator });

      dispatch(event);
    }
  }, []);

  $.use(keyMappingsHook(keyMappings, handleKeyMapping));

  $.useEffect(() => {
    if (locationState.url.pathname.indexOf('/streams/') !== 0) {
      scrollTo(0, 0);
    }

    if (sidebarIsOpened && isMobileLayout()) {
      onCloseSidebar();
    }
  }, [locationState]);

  $.useEffect(() => {
    if (sidebarIsOpened) {
      document.documentElement.classList.add('sidebar-is-opened');
    } else {
      document.documentElement.classList.remove('sidebar-is-opened');
    }

    return () => {
      document.documentElement.classList.remove('sidebar-is-opened');
    };
  }, [sidebarIsOpened]);

  $.useEffect(() => {
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

  return $.html`
    <div :class=${{ _: 'l-root', 'is-swiping': isSwiping }}>
      <div
        :class=${{ _: 'l-sidebar', 'is-opened': sidebarIsOpened }}
        :style=${sidebarStyle}
        :ref=${sidebarRef}
        @transitionend=${handleTransitionEnd}
      >
        <${Sidebar({
          navigator: navigator,
          url: locationState.url,
        })}>
      </div>
      <div :style=${mainStyle} class="l-main">
        <div class="l-notifications">
          <${NotificationStack({})}>
        </div>
        <div class="l-osd">
          <${OSD({})}>
        </div>
        <${child}>
        <div
          :style=${overlayStyle}
          class="l-overlay"
          @click=${onCloseSidebar}
          @touchstart=${onTouchStart}
          @touchmove=${onTouchMove}
          @touchend=${onTouchEnd}
        ></div>
        <div
          class="l-swipeable-edge"
          @ontouchstart=${onTouchStart}
          @ontouchmove=${onTouchMove}
          @ontouchend=${onTouchEnd}
        ></div>
      </div>
      <div :class=${{ _: 'l-backdrop', 'is-shown': isLoading }}>
        <${isLoading ? $.html`<i class="icon icon-48 icon-spinner animation-rotating"></i>` : null}>
      </div>
    </div>
    <${Dialog({
      children: $.html`
        <h1 class="Modal-title" id=${helpTitleId}>Available Key Mappings</h1>
        <${KeyMappingsTable({
          commandTable,
          keyMappings,
        })}>
      `,
      onClose: onCloseHelp,
      open: helpIsOpened,
      ownProps: { 'aria-labelledby': helpTitleId },
    })}>
  `;
});

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
