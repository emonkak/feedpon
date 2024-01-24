import React, { useState } from 'react';

import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { State, ThemeKind } from 'feedpon-messaging';
import { THEMES, changeCustomStyles, changeTheme } from 'feedpon-messaging/ui';
import useEvent from '../hooks/useEvent';

interface UISettingsProps {
  currentTheme: ThemeKind;
  customStyles: string;
  onChangeCustomStyles: typeof changeCustomStyles;
  onChangeTheme: typeof changeTheme;
}

function UISettings({
  currentTheme,
  customStyles: initialCustomStyles,
  onChangeCustomStyles,
  onChangeTheme,
}: UISettingsProps) {
  const [customStyles, setCustomStyles] = useState(initialCustomStyles);

  const handleChangeCustomStyle = useEvent(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newCustomStyles = event.currentTarget.value;
      setCustomStyles(newCustomStyles);
    },
  );

  const handleChangeTheme = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newTheme = event.currentTarget.value as ThemeKind;
      onChangeTheme(newTheme);
    },
  );

  const handleSubmitCustomStyle = useEvent(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onChangeCustomStyles(customStyles);
    },
  );

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
                onChange={handleChangeTheme}
                required
              />
              {theme.label}
            </label>
          ))}
        </div>
      </div>
      <form className="form" onSubmit={handleSubmitCustomStyle}>
        <div className="form-group">
          <span className="form-group-heading">Custom styles</span>
          <details>
            <summary className="u-text-muted">Available CSS variables</summary>
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
            onChange={handleChangeCustomStyle}
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
