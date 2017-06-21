import React, { Children, PureComponent } from 'react';

import connect from 'utils/flux/react/connect';
import { State, ThemeKind } from 'messaging/types';
import { THEMES } from 'messaging/ui/constants';

interface RootLayoutProps {
    children: React.ReactElement<any>;
    theme: ThemeKind,
}

class RootLayout extends PureComponent<RootLayoutProps, any> {
    componentDidMount() {
        const { theme } = this.props;

        this.updateTheme(theme);
    }

    componentDidUpdate(prevProps: RootLayoutProps, prevState: {}) {
        const { theme } = this.props;

        if (theme !== prevProps.theme) {
            this.updateTheme(theme);
        }
    }

    componentWillUnmount() {
        this.clearTheme();
    }

    updateTheme(nextTheme: ThemeKind) {
        for (const theme of THEMES) {
            if (theme.value !== nextTheme) {
                document.documentElement.classList.remove(theme.value);
            }
        }

        document.documentElement.classList.add(nextTheme);
    }

    clearTheme() {
        for (const theme of THEMES) {
            document.documentElement.classList.remove(theme.value);
        }
    }

    render() {
        return Children.only(this.props.children);
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        theme: state.ui.theme
    })
})(RootLayout);
