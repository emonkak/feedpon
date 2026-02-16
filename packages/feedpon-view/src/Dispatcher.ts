import {
  createComponent,
  type HookFunction,
  Keyed,
  type RenderContext,
} from 'barebind';
import { CurrentHistory } from 'barebind/addons/router';
import type { AppStore, Theme } from 'feedpon-store';

import { AuthenticationPage } from './authentication/AuthenticationPage.ts';
import { SidebarLayout } from './layout/SidebarLayout.ts';
import { SingleLayout } from './layout/SingleLayout.ts';
import { router } from './router.ts';

export interface DispatcherProps {
  store: AppStore;
}

export const Dispatcher = createComponent(function Dispatcher(
  { store }: DispatcherProps,
  $: RenderContext,
): unknown {
  const { state$ } = store;
  const userStyle = $.use(state$.get('userStyle'));
  const credential = $.use(state$.get('credential'));
  const theme = $.use(state$.get('theme'));

  const { location, navigator } = $.use(CurrentHistory);

  $.use(store);
  $.use(UserStyle(userStyle));
  $.use(Theme(theme));

  if (credential === null) {
    return SingleLayout({
      child: AuthenticationPage({}),
    });
  }

  const child = Keyed(
    router.match(location.url, { navigator, store }),
    location.url.pathname,
  );

  return SidebarLayout({
    child,
  });
});

function UserStyle(style: string): HookFunction<void> {
  return (context) => {
    context.useInsertionEffect(() => {
      const sheet = new CSSStyleSheet();

      sheet.replaceSync(style);

      document.adoptedStyleSheets.push(sheet);

      return () => {
        document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
          (s) => s !== sheet,
        );
      };
    }, [style]);
  };
}

function Theme(theme: Theme): HookFunction<void> {
  return (context) => {
    context.useInsertionEffect(() => {
      document.body.dataset['theme'] = theme;

      return () => {
        document.body.dataset['theme'] = undefined;
      };
    }, [theme]);
  };
}
