import { type Atom, atom } from '@emonkak/ebit/directives.js';

import type { Action, State, Store } from '../store.ts';
import getUUID from '../utils/getUUID.ts';

export interface UISeed {
  keyboardShortcutsShown: boolean;
  notifications: Notification[];
  osd: string | null;
  sidebarShown: boolean;
  theme: Theme;
  userStyle: string;
  version: number;
}

export interface StreamOptions {
  entries: number;
  order: EntryOrder;
  unreadOnly: boolean;
}

export type EntryOrder = 'newest' | 'oldest';

export interface UIContext {
  uiStore: Store<UIState>;
}

export interface History {
  streamId: string;
  timestamp: number;
}

export type Theme = 'light' | 'dark';

export interface Notification {
  id: string;
  type: NotificationType;
  dismissAfter: number;
  message: string;
}

export type NotificationType =
  | 'informational'
  | 'success'
  | 'warning'
  | 'error';

const defaultSeed: UISeed = {
  keyboardShortcutsShown: false,
  notifications: [],
  osd: null,
  sidebarShown: true,
  theme: 'light',
  userStyle: '',
  version: 1,
};

export class UIState implements State<UISeed> {
  readonly keyboardShortcutsShown$: Atom<boolean>;

  readonly notifications$: Atom<Notification[]>;

  readonly osd$: Atom<string | null>;

  readonly sidebarShown$: Atom<boolean>;

  readonly theme$: Atom<Theme>;

  readonly userStyle$: Atom<string>;

  readonly version$: Atom<number>;

  constructor(seed: UISeed = defaultSeed) {
    this.keyboardShortcutsShown$ = atom(seed.keyboardShortcutsShown);
    this.notifications$ = atom(seed.notifications);
    this.osd$ = atom(seed.osd);
    this.sidebarShown$ = atom(seed.sidebarShown);
    this.theme$ = atom(seed.theme);
    this.userStyle$ = atom(seed.userStyle);
    this.version$ = atom(seed.version);
  }

  closeOSD(): void {
    this.osd$.value = null;
  }

  dismissNotification({ id }: { id: string }): void {
    this.notifications$.value = this.notifications$.value.filter(
      (notification) => notification.id !== id,
    );
  }

  sendNotification({
    message,
    type,
    dismissAfter,
  }: { message: string; type: NotificationType; dismissAfter: number }): void {
    this.notifications$.value = [
      ...this.notifications$.value,
      {
        id: getUUID(),
        message,
        type,
        dismissAfter,
      },
    ];
  }

  setTheme({ theme }: { theme: Theme }): void {
    this.theme$.value = theme;
  }

  setUserStyle({ userStyle }: { userStyle: string }): void {
    this.userStyle$.value = userStyle;
  }

  showOSD({ message }: { message: string }): void {
    this.osd$.value = message;
  }

  toSnapshot(): UISeed {
    return {
      keyboardShortcutsShown: this.keyboardShortcutsShown$.value,
      notifications: this.notifications$.value,
      osd: this.osd$.value,
      sidebarShown: this.sidebarShown$.value,
      theme: this.theme$.value,
      userStyle: this.userStyle$.value,
      version: this.version$.value,
    };
  }

  toggleKeyboardShortcuts(): void {
    this.keyboardShortcutsShown$.value = !this.keyboardShortcutsShown$.value;
  }

  toggleSidebar(): void {
    this.sidebarShown$.value = !this.sidebarShown$.value;
  }
}

export function toggleSidebar(): Action<UIContext> {
  return ({ uiStore }) => {
    uiStore.dispatch({
      type: 'toggleSidebar',
    });
  };
}
