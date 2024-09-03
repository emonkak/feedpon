import React, { useEffect } from 'react';

import { useStore } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';
import { THEMES } from 'feedpon-messaging/ui';

export interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const { customStyles, theme } = useStore({
    mapStateToProps: (state: State) => ({
      customStyles: state.ui.customStyles,
      theme: state.ui.theme,
    }),
  });

  useEffect(() => {
    for (const THEME of THEMES) {
      if (THEME.value !== theme) {
        document.body.classList.remove(THEME.value);
      }
    }

    document.body.classList.add(theme);

    return () => {
      for (const THEME of THEMES) {
        document.body.classList.remove(THEME.value);
      }
    };
  }, [theme]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      {children}
    </>
  );
}
