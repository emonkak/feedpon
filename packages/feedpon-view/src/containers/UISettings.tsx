import React, { PureComponent } from 'react';

import bindActions from 'feedpon-utils/flux/bindActions';
import connect from 'feedpon-utils/flux/react/connect';
import type { State, ThemeKind } from 'feedpon-messaging';
import { THEMES, changeCustomStyles, changeTheme } from 'feedpon-messaging/ui';

interface UISettingsProps {
  currentTheme: ThemeKind;
  customStyles: string;
  onChangeCustomStyles: typeof changeCustomStyles;
  onChangeTheme: typeof changeTheme;
}

interface UISettingsState {
  customStyles: string;
}

class UISettings extends PureComponent<UISettingsProps, UISettingsState> {
  constructor(props: UISettingsProps) {
    super(props);

    this.state = {
      customStyles: props.customStyles,
    };

    this.handleChangeCustomStyle = this.handleChangeCustomStyle.bind(this);
    this.handleChangeTheme = this.handleChangeTheme.bind(this);
    this.handleSubmitCustomStyle = this.handleSubmitCustomStyle.bind(this);
  }

  handleChangeCustomStyle(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const customStyles = event.currentTarget.value;

    this.setState({
      customStyles,
    });
  }

  handleChangeTheme(event: React.ChangeEvent<HTMLInputElement>) {
    const { onChangeTheme } = this.props;
    const value = event.currentTarget.value as ThemeKind;

    onChangeTheme(value);
  }

  handleSubmitCustomStyle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { onChangeCustomStyles } = this.props;
    const { customStyles } = this.state;

    onChangeCustomStyles(customStyles);
  }

  override render() {
    const { currentTheme } = this.props;
    const { customStyles } = this.state;

    return (
      <section className="section">
        <h1 className="display-1">UI</h1>
        <div className="form">
          <div className="form-group">
            <span className="form-group-heading">Theme</span>
            {THEMES.map((theme) => (
              <label key={theme.value} className="form-check-label">
                <input
                  type="radio"
                  className="form-check"
                  name="theme"
                  value={theme.value}
                  checked={theme.value === currentTheme}
                  onChange={this.handleChangeTheme}
                  required
                />
                {theme.label}
              </label>
            ))}
          </div>
        </div>
        <form className="form" onSubmit={this.handleSubmitCustomStyle}>
          <div className="form-group">
            <span className="form-group-heading">Custom styles</span>
            <details>
              <summary className="u-text-muted">
                Available CSS variables
              </summary>
              <ul>
                <li>
                  <code>--vertical-rhythm</code>: The line height value for
                  adjusting vertical rhythm
                </li>
                <li>
                  <code>--navbar-height</code>: Global navigation bar height
                </li>
                <li>
                  <code>--sidebar-width</code>: Global sidebar width
                </li>
                <li>
                  <code>--container-width</code>: Main container width
                </li>
              </ul>
            </details>
            <textarea
              className="form-control"
              value={customStyles}
              rows={12}
              onChange={this.handleChangeCustomStyle}
            />
          </div>
          <div className="form-group">
            <button type="submit" className="button button-outline-positive">
              Save
            </button>
          </div>
        </form>
      </section>
    );
  }
}

export default connect({
  mapStateToProps: (state: State) => ({
    currentTheme: state.ui.theme,
    customStyles: state.ui.customStyles,
  }),
  mapDispatchToProps: bindActions({
    onChangeTheme: changeTheme,
    onChangeCustomStyles: changeCustomStyles,
  }),
})(UISettings);
