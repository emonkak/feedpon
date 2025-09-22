import type { AppAction } from '../action.ts';
import type { Theme } from '../state.ts';

export function updateTheme(theme: Theme): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.theme = theme;
    });
  };
}

export function updateUserStyle(userStyle: string): AppAction<void> {
  return ({ state$ }) => {
    state$.mutate((state) => {
      state.userStyle = userStyle;
    });
  };
}
