import { type Atom, atom } from '@emonkak/ebit/directives.js';

import type { Action, State, Store } from '../store.ts';
import type { StreamState } from './stream.ts';
import type { SubscriptionState } from './subscription.ts';
import type { UIState } from './ui.ts';

export interface NavigationSeed {
  keyboardShortcuts: KeyboardShortcut[];
  scrollBehavior: ScrollBehavior;
  scrollDistanceRatio: number;
  version: number;
}

export interface NavigationContext {
  navigationStore: Store<NavigationState>;
  streamStore: Store<StreamState>;
  subscriptionStore: Store<SubscriptionState>;
  uiStore: Store<UIState>;
}

export interface KeyboardCommand {
  title: string;
  action: Action<NavigationContext>;
}

export interface KeyboardShortcut {
  keyStorokes: KeyStroke[];
  actionId: keyof typeof keyboardCommands;
}

export interface KeyStroke {
  key: string;
  modifiers: Modifier[];
}

export type Modifier = 'S' | 'C' | 'A' | 'M';

const defaultSeed: NavigationSeed = {
  keyboardShortcuts: [
    { keyStorokes: [{ key: ' ', modifiers: [] }], actionId: 'scrollDown' },
    { keyStorokes: [{ key: ' ', modifiers: ['S'] }], actionId: 'scrollUp' },
  ],
  scrollBehavior: 'smooth',
  scrollDistanceRatio: 0.5,
  version: 1,
};

export const keyboardCommands = {
  scrollDown: {
    title: 'Scroll down the page',
    action({
      navigationStore: {
        state: { scrollBehavior$, scrollDistanceRatio$ },
      },
    }) {
      scrollBy({
        left: 0,
        top:
          -document.documentElement.clientHeight / scrollDistanceRatio$.value,
        behavior: scrollBehavior$.value,
      });
    },
  },
  scrollUp: {
    title: 'Scroll up the page',
    action({
      navigationStore: {
        state: { scrollBehavior$, scrollDistanceRatio$ },
      },
    }) {
      scrollBy({
        left: 0,
        top:
          -document.documentElement.clientHeight * scrollDistanceRatio$.value,
        behavior: scrollBehavior$.value,
      });
    },
  },
} as const satisfies Record<string, KeyboardCommand>;

export class NavigationState implements State<NavigationSeed> {
  readonly keyboardShortcuts$: Atom<KeyboardShortcut[]>;

  readonly scrollBehavior$: Atom<ScrollBehavior>;

  readonly scrollDistanceRatio$: Atom<number>;

  readonly version$: Atom<number>;

  constructor(seed: NavigationSeed = defaultSeed) {
    this.keyboardShortcuts$ = atom(seed.keyboardShortcuts);
    this.scrollBehavior$ = atom(seed.scrollBehavior);
    this.scrollDistanceRatio$ = atom(seed.scrollDistanceRatio);
    this.version$ = atom(seed.version);
  }

  toSnapshot(): NavigationSeed {
    return {
      keyboardShortcuts: this.keyboardShortcuts$.value,
      scrollBehavior: this.scrollBehavior$.value,
      scrollDistanceRatio: this.scrollDistanceRatio$.value,
      version: this.version$.value,
    };
  }
}
