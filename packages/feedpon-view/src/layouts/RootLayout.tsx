import React, { PureComponent } from 'react';

import connect from 'feedpon-flux/react/connect';
import type { State, ThemeKind } from 'feedpon-messaging';
import { THEMES } from 'feedpon-messaging/ui';

interface RootLayoutProps {
  children: React.ReactNode;
  customStyles: string;
  theme: ThemeKind;
}

class RootLayout extends PureComponent<RootLayoutProps> {
  override componentDidMount() {
    const { theme } = this.props;

    this.updateTheme(theme);
  }

  override componentDidUpdate(prevProps: RootLayoutProps, _prevState: {}) {
    const { theme } = this.props;

    if (theme !== prevProps.theme) {
      this.updateTheme(theme);
    }
  }

  override componentWillUnmount() {
    this.clearTheme();
  }

  updateTheme(nextTheme: ThemeKind) {
    for (const theme of THEMES) {
      if (theme.value !== nextTheme) {
        document.body.classList.remove(theme.value);
      }
    }

    document.body.classList.add(nextTheme);
  }

  clearTheme() {
    for (const theme of THEMES) {
      document.body.classList.remove(theme.value);
    }
  }

  override render() {
    const { children, customStyles } = this.props;

    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        {children}
      </div>
    );
  }
}

export default connect({
  mapStateToProps: (state: State) => ({
    customStyles: state.ui.customStyles,
    theme: state.ui.theme,
  }),
})(RootLayout);
