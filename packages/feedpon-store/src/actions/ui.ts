import type { AppAction } from '../action.ts';
import type { NotificationType } from '../state.ts';
import type { Scrollable, ScrollEasing } from '../utils/SmoothScroll.ts';

const SMOOTH_SCROLL_EASING: ScrollEasing = (t: number) => t * t * t;

export function dismissNotification(id: string): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== id,
      );
    });
  };
}

export function dismissOsd(): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.osd = null;
    });
  };
}

export function sendNotification(
  type: NotificationType,
  message: string,
  timeout?: number,
): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.notifications = state.notifications.concat({
        id: crypto.randomUUID(),
        type,
        message,
        timeout: timeout ?? state.notificationSettings.timeout,
      });
    });
  };
}

export function showOsd(
  message: string,
  timeout: number = 1000,
): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.osd = { message, timeout };
    });
  };
}

export function smoothScrollBy(
  scrollable: Scrollable,
  dx: number,
  dy: number,
  duration: number,
): AppAction<Promise<void>> {
  return ({ smoothScroll }) => {
    return smoothScroll.scrollBy(
      scrollable,
      dx,
      dy,
      duration,
      SMOOTH_SCROLL_EASING,
    );
  };
}

export function smoothScrollTo(
  scrollable: Scrollable,
  destX: number,
  destY: number,
  duration: number,
): AppAction<Promise<void>> {
  return ({ smoothScroll }) => {
    return smoothScroll.scrollTo(
      scrollable,
      destX,
      destY,
      duration,
      SMOOTH_SCROLL_EASING,
    );
  };
}

export function toggleKeyboardShortcuts(opened?: boolean): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.keyboardShortcutsOpened = opened ?? !state.keyboardShortcutsOpened;
    });
  };
}

export function toggleSidebar(opened?: boolean): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.sidebarOpened = opened ?? !state.sidebarOpened;
    });
  };
}

export function waitForScroll(
  scrollable: Scrollable,
): AppAction<Promise<void>> {
  return ({ smoothScroll }) => {
    return smoothScroll.waitForScroll(scrollable);
  };
}
