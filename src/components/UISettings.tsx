import React, { PureComponent } from 'react';

import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, ThemeKind } from 'messaging/types';
import { THEMES } from 'messaging/ui/constants';
import { changeTheme } from 'messaging/ui/actions';

interface UISettingsProps {
    currentTheme: ThemeKind;
    onChangeTheme: typeof changeTheme;
}

class UISettings extends PureComponent<UISettingsProps, {}> {
    constructor(props: UISettingsProps, context: any) {
        super(props, context);

        this.handleChangeTheme = this.handleChangeTheme.bind(this);
    }

    handleChangeTheme(event: React.ChangeEvent<HTMLInputElement>) {
        const { onChangeTheme } = this.props;
        const value = event.currentTarget.value as ThemeKind;

        onChangeTheme(value);
    }

    render() {
        const { currentTheme } = this.props;

        return (
            <section className="section">
                <h1 className="display-1">UI</h1>
                <div className="form">
                    <div className="form-group">
                        <span className="form-group-heading">Theme</span>
                        {THEMES.map((theme) =>
                            <label key={theme.value} className="form-check-label">
                                <input
                                    type="radio"
                                    className="form-check"
                                    name="theme"
                                    value={theme.value}
                                    checked={theme.value === currentTheme}
                                    onChange={this.handleChangeTheme}
                                    required />
                                {theme.label}
                            </label>
                        )}
                    </div>
                </div>
            </section>
        );
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        currentTheme: state.ui.theme
    }),
    mapDispatchToProps: bindActions({
        onChangeTheme: changeTheme
    })
})(UISettings);
