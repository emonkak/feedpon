import type { Reactive } from 'barebind/extras/reactive';

export type Command<TContext, TResult> = (context: TContext) => TResult;

export interface CommandHandler<TContext> {
  scrollDown: Command<TContext, void>;
  scrollUp: Command<TContext, void>;
}

export type CommandId = keyof CommandHandler<unknown>;

export interface KeyStroke {
  key: string;
  modifiers: Modifier[];
}

export interface KeyboardShortcut {
  keyStorokes: KeyStroke[];
  commandId: CommandId;
}

export type Modifier = 'A' | 'C' | 'M' | 'S';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  dismissAfter: number;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type Theme = 'system' | 'light' | 'dark';

export type UIAction<TResult> = (context: UIContext) => TResult;

export interface UIContext {
  commandHandler: CommandHandler<this>;
  state$: Reactive<{ uiState: UIState }>;
}

export class UIState {
  authenticating: boolean = false;
  keyboardShortcuts: KeyboardShortcut[] = [
    { keyStorokes: [{ key: ' ', modifiers: [] }], commandId: 'scrollDown' },
    { keyStorokes: [{ key: ' ', modifiers: ['S'] }], commandId: 'scrollUp' },
  ];
  keyboardShortcutsShown: boolean = false;
  notifications: Notification[] = [];
  osd: string | null = null;
  scrollBehavior: ScrollBehavior = 'smooth';
  scrollDistanceRatio: number = 0.5;
  sidebarShown: boolean = true;
  theme: Theme = 'light';
  userStyle: string = '';
}

export function closeOSD(): UIAction<void> {
  return ({ state$ }) => {
    const uiState$ = state$.get('uiState');

    uiState$.mutate((state) => {
      state.osd = null;
    });
  };
}

export function dismissNotification(id: string): UIAction<void> {
  return ({ state$ }) => {
    state$.get('uiState').mutate((state) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== id,
      );
    });
  };
}

export function sendNotification(
  type: NotificationType,
  message: string,
  dismissAfter: number = -1,
): UIAction<void> {
  return ({ state$ }) => {
    const uiState$ = state$.get('uiState');

    uiState$.mutate((state) => {
      state.notifications = state.notifications.concat({
        id: crypto.randomUUID(),
        type,
        message,
        dismissAfter,
      });
    });
  };
}

export function setTheme(theme: Theme): UIAction<void> {
  return ({ state$ }) => {
    const uiState$ = state$.get('uiState');

    uiState$.mutate((state) => {
      state.theme = theme;
    });
  };
}

export function setUserStyle(userStyle: string): UIAction<void> {
  return ({ state$ }) => {
    const uiState$ = state$.get('uiState');

    uiState$.mutate((state) => {
      state.userStyle = userStyle;
    });
  };
}

export function showOSD(message: string): UIAction<void> {
  return ({ state$ }) => {
    const uiState$ = state$.get('uiState');

    uiState$.mutate((state) => {
      state.osd = message;
    });
  };
}

export function toggleKeyboardShortcuts(): UIAction<void> {
  return ({ state$ }) => {
    const uiState$ = state$.get('uiState');

    uiState$.mutate((state) => {
      state.keyboardShortcutsShown = !state.keyboardShortcutsShown;
    });
  };
}

export function toggleSidebar(): UIAction<void> {
  return ({ state$ }) => {
    const uiState$ = state$.get('uiState');

    uiState$.mutate((state) => {
      state.sidebarShown = !state.sidebarShown;
    });
  };
}
