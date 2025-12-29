import {
  type CustomHookFunction,
  createComponent,
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
    location.url.pathname,
    router.handle(location.url, { navigator, store }),
  );

  return SidebarLayout({
    child,
  });
});

function UserStyle(rule: string): CustomHookFunction<void> {
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

function Theme(theme: Theme): CustomHookFunction<void> {
  return (context) => {
    context.useInsertionEffect(() => {
      document.body.dataset['theme'] = theme;

      return () => {
        document.body.dataset['theme'] = undefined;
      };
    }, [theme]);
  };
}
