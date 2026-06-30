import type { AppAction, Theme } from '../index.ts';

export function updateTheme(theme: Theme): AppAction<void> {
  return (state$) => {
    state$.scope((state) => {
      state.theme = theme;
    });
  };
}

export function updateUserStyle(userStyle: string): AppAction<void> {
  return (state$) => {
    state$.scope((state) => {
      state.userStyle = userStyle;
    });
  };
}
