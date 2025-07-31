import {
  type CustomHookFunction,
  component,
  type RenderContext,
} from 'barebind';
import { CurrentHistory } from 'barebind/extensions/router';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State, Store, ThemeKind } from 'feedpon-messaging';
import { THEMES } from 'feedpon-messaging/ui';

import { AuthenticationPage } from './authentication/AuthenticationPage.ts';
import { SidebarLayout } from './common/SidebarLayout.ts';
import { SingleLayout } from './common/SingleLayout.ts';
import { router } from './router.ts';

export interface DispatcherProps {}

export function Dispatcher(
  _props: DispatcherProps,
  context: RenderContext,
): unknown {
  const { store, customStyles, isAuthenticated, theme } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        customStyles: state.ui.customStyles,
        isAuthenticated: !!state.backend.token,
        theme: state.ui.theme,
      }),
      mapStoreToProps: (store) => ({ store: store as Store }),
    }),
  );
  const [location, navigator] = context.use(CurrentHistory);

  context.use(styleHook(customStyles));
  context.use(themeHook(theme));

  if (!isAuthenticated) {
    return context.html`<${component(SingleLayout, {
      child: component(AuthenticationPage, {}),
    })}>`;
  }

  const child = router.handle(location.url, { navigator, store });

  return context.html`<${component(SidebarLayout, {
    child,
  })}>`;
}

function styleHook(rule: string): CustomHookFunction<void> {
  return (context) => {
    context.useInsertionEffect(() => {
      const style = document.createElement('style');

      document.body.append(style);

      if (rule !== '') {
        style.sheet!.insertRule(rule);
      }

      return () => {
        document.body.removeChild(style);
      };
    }, [rule]);
  };
}

function themeHook(theme: ThemeKind): CustomHookFunction<void> {
  return (context) => {
    context.useLayoutEffect(() => {
      for (const THEME of THEMES) {
        if (THEME.value !== theme) {
          document.body.classList.remove(THEME.value);
        }
      }

      document.body.classList.add(theme);

      return () => {
        document.body.classList.remove(theme);
      };
    }, [theme]);
  };
}
