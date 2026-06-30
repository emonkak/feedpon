import { type Bindable, createComponent, type HookFunction } from 'barebind';
import { NavigationContext } from 'barebind/addons/router';
import type { AppStore, Theme } from 'feedpon-store';

import { AuthenticationPage } from './authentication/AuthenticationPage.ts';
import { SidebarLayout } from './layout/SidebarLayout.ts';
import { SingleLayout } from './layout/SingleLayout.ts';
import { router } from './router.ts';

export interface DispatcherProps {
  store: AppStore;
}

export const Dispatcher = createComponent<DispatcherProps>(function Dispatcher({
  store,
}) {
  const { state$ } = store;
  const userStyle = this.use(state$.get('userStyle'));
  const credential = this.use(state$.get('credential'));
  const theme = this.use(state$.get('theme'));

  const { scene } = this.inject(NavigationContext);

  this.use(store);
  this.use(UserStyle(userStyle));
  this.use(Theme(theme));

  if (credential === null) {
    return SingleLayout({
      child: AuthenticationPage({}),
    });
  }

  const matched = router.match(scene.url) as
    | { withKey(key: string): Bindable }
    | undefined;
  const child = matched?.withKey(scene.url);

  return SidebarLayout({
    child,
  });
});

function UserStyle(style: string): HookFunction<void> {
  return (context) => {
    context.useEffect(() => {
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
    context.useEffect(() => {
      document.documentElement.dataset['theme'] = theme;

      return () => {
        document.documentElement.dataset['theme'] = undefined;
      };
    }, [theme]);
  };
}
