import React, { useEffect } from 'react';

import connect from 'feedpon-flux/react/connect';
import type { State, ThemeKind } from 'feedpon-messaging';
import { THEMES } from 'feedpon-messaging/ui';

interface RootLayoutProps {
  children: React.ReactNode;
  customStyles: string;
  theme: ThemeKind;
}

function RootLayout({ children, customStyles, theme }: RootLayoutProps) {
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

export default connect(RootLayout, {
  mapStateToProps: (state: State) => ({
    customStyles: state.ui.customStyles,
    theme: state.ui.theme,
  }),
});
