import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { atom, live, nonKeyedList } from '@emonkak/ebit/directives.js';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit.ts';
import type { State, ThemeKind } from 'feedpon-messaging';
import { THEMES, changeCustomStyles, changeTheme } from 'feedpon-messaging/ui';

export interface UISettingsProps {}

export function UISettings(
  {}: UISettingsProps,
  context: RenderContext,
): TemplateResult {
  const {
    currentTheme,
    customStyles: initialCustomStyles,
    onChangeCustomStyles,
    onChangeTheme,
  } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        currentTheme: state.ui.theme,
        customStyles: state.ui.customStyles,
      }),
      mapDispatchToProps: bindActions({
        onChangeTheme: changeTheme,
        onChangeCustomStyles: changeCustomStyles,
      }),
    }),
  );

  const customStyles$ = context.useMemo(() => atom(initialCustomStyles), []);

  const handleChangeCustomStyle = context.useCallback((event: Event) => {
    customStyles$.value = (event.currentTarget as HTMLTextAreaElement).value;
  }, []);

  const handleChangeTheme = context.useCallback(
    (event: Event) => {
      const newTheme = (event.currentTarget as HTMLInputElement)
        .value as ThemeKind;
      onChangeTheme(newTheme);
    },
    [onChangeTheme],
  );

  const handleSubmitCustomStyle = context.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      onChangeCustomStyles(customStyles$.value);
    },
    [onChangeCustomStyles],
  );

  const themeCheckboxes = nonKeyedList(
    THEMES,
    (theme) => context.html`
      <label key={theme.value} class="form-check-label">
        <input
          checked=${theme.value === currentTheme}
          class="form-check"
          name="theme"
          required
          type="radio"
          value=${theme.value}
          @change=${handleChangeTheme}
        >
        ${theme.label}
      </label>
    `,
  );

  return context.html`
    <section class="section">
      <h1 class="display-1">UI</h1>
      <div class="form">
        <div class="form-group">
          <span class="form-group-heading">Theme</span>
          <${themeCheckboxes}>
        </div>
      </div>
      <form class="form" @submit=${handleSubmitCustomStyle}>
        <div class="form-group">
          <span class="form-group-heading">Custom styles</span>
          <textarea
            class="form-control"
            rows="12"
            .value=${customStyles$.map(live)}
            @change=${handleChangeCustomStyle}
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
}
