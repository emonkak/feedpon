import type {
  AppAction,
  NotificationType,
  ScrollEasing,
  ScrollTarget,
} from '../index.ts';

const SMOOTH_SCROLL_EASING: ScrollEasing = (t: number) => t * t * t;

export function dismissNotification(id: string): AppAction<void> {
  return (state$) => {
    state$.mutate((state) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== id,
      );
    });
  };
}

export function dismissOsd(): AppAction<void> {
  return (state$) => {
    state$.mutate((state) => {
      state.osd = null;
    });
  };
}

export function scrollBy(
  target: ScrollTarget,
  dx: number,
  dy: number,
): AppAction<Promise<void>> {
  return (state$, { scrollController }) => {
    const { keyboardSettings } = state$.value;
    return scrollController.scrollBy(
      target,
      dx,
      dy,
      keyboardSettings.scrollDuration,
      SMOOTH_SCROLL_EASING,
    );
  };
}

export function scrollTo(
  target: ScrollTarget,
  destX: number,
  destY: number,
): AppAction<Promise<void>> {
  return (state$, { scrollController }) => {
    const { keyboardSettings } = state$.value;
    return scrollController.scrollTo(
      target,
      destX,
      destY,
      keyboardSettings.scrollDuration,
      SMOOTH_SCROLL_EASING,
    );
  };
}

export function sendNotification(
  type: NotificationType,
  message: string,
  timeout?: number,
): AppAction<void> {
  return (state$) => {
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
  return (state$) => {
    state$.mutate((state) => {
      state.osd = { message, timeout };
    });
  };
}

export function toggleKeyboardShortcuts(opened?: boolean): AppAction<void> {
  return (_state$, { state$ }) => {
    state$.mutate((state) => {
      state.keyboardShortcutsOpened = opened ?? !state.keyboardShortcutsOpened;
    });
  };
}

export function toggleSidebar(opened?: boolean): AppAction<void> {
  return (state$) => {
    state$.mutate((state) => {
      state.sidebarOpened = opened ?? !state.sidebarOpened;
    });
  };
}

export function waitForScroll(target: ScrollTarget): AppAction<Promise<void>> {
  return (_state$, { scrollController }) => {
    return scrollController.waitForScroll(target);
  };
}
