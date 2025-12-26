import { createComponent, type RenderContext } from 'barebind';
import { CurrentHistory } from 'barebind/addons/router';
import type { CommandId } from 'feedpon-store';
import { AppStore } from 'feedpon-store';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'store';

import { AppCommandHandler } from '../CommandHandler.ts';
import { KeyboardShortcutTable } from '../keyboard/KeyboardShortcutTable.ts';
import { NotificationStack } from '../notification/NotificationStack.ts';
import { OsdStack } from '../osd/OsdStack.ts';
import { Dialog } from '../primitives/Dialog.ts';
import { swipeableHook } from '../primitives/hooks/swipeableHook.ts';
import { Sidebar } from '../sidebar/Sidebar.ts';
import { KeyboardShortcutHandler } from './hooks/KeyboardShortcutHandler.ts';

export interface SidebarLayoutProps {
  child: unknown;
}

export const SidebarLayout = createComponent(function SidebarLayout(
  { child }: SidebarLayoutProps,
  $: RenderContext,
): unknown {
  const store = $.use(AppStore);
  const authenticating = $.use(store.state$.get('authenticating'));
  const keyboardShortcuts = $.use(store.state$.get('keyboardShortcuts'));
  const keyboardShortcutsOpened = $.use(
    store.state$.get('keyboardShortcutsOpened'),
  );
  const opmlImporting = $.use(store.state$.get('opmlImporting'));
  const sidebarOpened = $.use(store.state$.get('sidebarOpened'));

  const isLoading = authenticating || opmlImporting;

  const { toggleKeyboardShortcuts, toggleSidebar } = $.use(
    BindActionCreators(AppStore, uiActions),
  );

  const { location, navigator } = $.use(CurrentHistory);

  const sidebarWidthRef = $.useRef(0);

  const { onTouchStart, onTouchEnd, onTouchMove, isSwiping, coordinates } =
    $.use(swipeableHook);

  const handleTransitionEnd = $.useCallback(() => {
    if (!sidebarOpened) {
      toggleSidebar(false);
    }
  }, [sidebarOpened]);

  const helpTitleId = $.useId();

  const handleCommandInvoke = $.useMemo(() => {
    const commandHandler = new AppCommandHandler(navigator);

    return (commandId: CommandId) => {
      const action = commandHandler[commandId]();
      store.dispatchAction(action);
    };
  }, []);

  $.use(KeyboardShortcutHandler(keyboardShortcuts, handleCommandInvoke));

  $.useEffect(() => {
    if (location.url.pathname.indexOf('/streams/') !== 0) {
      scrollTo(0, 0);
    }

    if (sidebarOpened && isMobileLayout()) {
      toggleSidebar(false);
    }
  }, [location]);

  $.useEffect(() => {
    document.documentElement.classList.toggle(
      'is-sidebar-opened',
      sidebarOpened,
    );

    return () => {
      document.documentElement.classList.remove('is-sidebar-opened');
    };
  }, [sidebarOpened]);

  $.useEffect(() => {
    if (isSwiping) {
      document.documentElement.classList.add('is-sidebar-swiping');
    } else {
      const { initialX, destX } = coordinates;
      const tolerance = sidebarWidthRef.current / 2;

      if (sidebarOpened) {
        if (initialX > destX && initialX - destX > tolerance) {
          toggleSidebar(false);
        }
      } else {
        if (initialX < destX && destX - initialX > tolerance) {
          toggleSidebar(true);
        }
      }

      document.documentElement.classList.remove('is-sidebar-swiping');
    }
  }, [isSwiping]);

  const sidebarRef = (node: Element) => {
    sidebarWidthRef.current = node.getBoundingClientRect().width;
  };

  const swipeDistance = sidebarOpened
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
          (sidebarOpened
            ? swipeDistance
            : swipeDistance - sidebarWidthRef.current) + ' px',
      }
    : {};
  const mainStyle = isSwiping
    ? {
        paddingLeft:
          (sidebarOpened
            ? swipeDistance + sidebarWidthRef.current
            : swipeDistance) + ' px',
      }
    : {};
  const overlayStyle = isSwiping
    ? {
        opacity: (sidebarOpened ? 1 - swipeProgress : swipeProgress).toString(),
        visibility: 'visible',
      }
    : {};

  return $.html`
    <div :class=${{ 'l-root': true, 'is-swiping': isSwiping }}>
      <div
        :class=${{ 'l-sidebar': true, 'is-opened': sidebarOpened }}
        :style=${sidebarStyle}
        :ref=${sidebarRef}
        @transitionend=${handleTransitionEnd}
      >
        <${Sidebar({})}>
      </div>
      <div :style=${mainStyle} class="l-main">
        <div class="l-notifications">
          <${NotificationStack({})}>
        </div>
        <div class="l-osd">
          <${OsdStack({})}>
        </div>
        <${child}>
        <div
          :style=${overlayStyle}
          class="l-overlay"
          @click=${() => {
            toggleSidebar(false);
          }}
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
      <div :class=${{ 'l-backdrop': true, 'is-shown': isLoading }}>
        <${isLoading ? $.html`<i class="icon icon-48 icon-spinner animation-rotating"></i>` : null}>
      </div>
    </div>
    <${Dialog({
      children: $.html`
        <h1 class="Modal-title" id=${helpTitleId}>Keyboard Shortcuts</h1>
        <${KeyboardShortcutTable({
          keyboardShortcuts,
        })}>
      `,
      onClose: () => toggleKeyboardShortcuts(false),
      open: keyboardShortcutsOpened,
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
