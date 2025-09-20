import type { AppAction } from '../action.ts';
import type { NotificationType, Theme } from '../state.ts';

export function closeOSD(): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.osd = null;
    });
  };
}

export function dismissNotification(id: string): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== id,
      );
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

export function setTheme(theme: Theme): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.theme = theme;
    });
  };
}

export function setUserStyle(userStyle: string): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.userStyle = userStyle;
    });
  };
}

export function showOSD(message: string): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.osd = message;
    });
  };
}

export function toggleKeyboardShortcuts(): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.keyboardShortcutsShown = !state.keyboardShortcutsShown;
    });
  };
}

export function toggleSidebar(): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.sidebarShown = !state.sidebarShown;
    });
  };
}
