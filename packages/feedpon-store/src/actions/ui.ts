import type { AppAction, NotificationType } from '../index.ts';

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
