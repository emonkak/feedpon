import type { AppAction, Theme } from '../index.ts';

export function updateTheme(theme: Theme): AppAction<void> {
  return (state$) => {
    state$.mutate((state) => {
      state.theme = theme;
    });
  };
}

export function updateUserStyle(userStyle: string): AppAction<void> {
  return (state$) => {
    state$.mutate((state) => {
      state.userStyle = userStyle;
    });
  };
}
