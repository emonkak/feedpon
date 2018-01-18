import React, { PureComponent } from 'react';

import connect from 'utils/flux/react/connect';
import { State, ThemeKind } from 'messaging/types';
import { THEMES } from 'messaging/ui/constants';

interface RootLayoutProps {
    children: React.ReactElement<any>;
    customStyles: string;
    theme: ThemeKind;
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

    render() {
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
        theme: state.ui.theme
    })
})(RootLayout);
