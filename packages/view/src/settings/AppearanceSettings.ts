import { BindActionCreators } from '@feedpon/foundation';
import type { Theme } from '@feedpon/model';
import { AppStore } from '@feedpon/model';
import * as appearanceActions from '@feedpon/model/actions/appearance';
import { createComponent, html } from 'barebind';
import { LocalAtom } from 'barebind/addons/signal';

export interface AppearanceSettingsProps {}

export const AppearanceSettings = createComponent<AppearanceSettingsProps>(
  function AppearanceSettings() {
    const { state$ } = this.use(AppStore);
    const currentUserStyle = this.use(state$.get('userStyle'));
    const currentTheme = this.use(state$.get('theme'));

    const userStyle$ = this.use(LocalAtom(currentUserStyle));

    const { updateTheme, updateUserStyle } = this.use(
      BindActionCreators(AppStore, appearanceActions),
    );

    const handleUserStyleChange = (event: Event) => {
      userStyle$.value = (event.currentTarget as HTMLTextAreaElement).value;
    };

    const handleUserStyleUpdate = (event: SubmitEvent) => {
      event.preventDefault();
      updateUserStyle(userStyle$.value);
    };

    const handleThemeUpdate = this.useCallback(
      (event: Event) => {
        const newTheme = (event.currentTarget as HTMLInputElement)
          .value as Theme;
        updateTheme(newTheme);
      },
      [updateTheme],
    );

    const themeItems = (['system', 'light', 'dark'] as Theme[]).map(
      (theme) =>
        html`
          <label key={theme} class="form-check-label">
            <input
              checked=${theme === currentTheme}
              class="form-check"
              name="theme"
              required
              type="radio"
              value=${theme}
              @change=${handleThemeUpdate}
            >
            ${theme}
          </label>
        `,
    );

    return html`
      <section class="section">
        <h1 class="display-1">UI</h1>
        <div class="form">
          <div class="form-group">
            <span class="form-group-heading">Theme</span>
            <${themeItems}>
          </div>
        </div>
        <form class="form" @submit=${handleUserStyleUpdate}>
          <div class="form-group">
            <span class="form-group-heading">Custom styles</span>
            <textarea
              class="form-control"
              rows="12"
              $value=${userStyle$}
              @change=${handleUserStyleChange}
            ></textarea>
          </div>
          <div class="form-group">
            <button type="submit" class="button button-outline-positive">
              Save
            </button>
          </div>
        </form>
      </section>
    `;
  },
);
