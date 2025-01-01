import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component } from '@emonkak/ebit/directives.js';
import type { RelativeURL } from '@emonkak/ebit/router.js';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit';
import { toggleSidebar } from 'feedpon-messaging/ui';

import { MainLayout } from '../common/MainLayout';
import { Navbar } from '../common/Navbar';
import { TabList } from '../primitives/TabList';

export interface SettingsProps {
  children: unknown;
  url: RelativeURL;
}

export function SettingsPage(
  { children, url }: SettingsProps,
  context: RenderContext,
): TemplateResult {
  const { onToggleSidebar } = context.use(
    getStoreHook({
      mapDispatchToProps: bindActions({
        onToggleSidebar: toggleSidebar,
      }),
    }),
  );

  const header = component(Navbar, {
    onToggleSidebar,
    children: context.html`
      <h1 class="navbar-title">Settings</h1>
    `,
  });

  const tabList = component(TabList, {
    items: [
      {
        key: 'ui',
        href: '#/settings/ui',
        selected: url.pathname === '/settings/ui',
        children: context.html`
          <i class="u-inline-block u-md-none icon icon-20 icon-browser-window"></i>
          <span class="u-none u-md-inline">UI</span>
        `,
      },
      {
        key: 'stream',
        href: '#/settings/stream',
        selected: url.pathname === '/settings/stream',
        children: context.html`
          <i class="u-inline-block u-md-none icon icon-20 icon-news-feed"></i>
          <span class="u-none u-md-inline">Stream</span>
        `,
      },
      {
        key: 'tracking_url',
        href: '#/settings/tracking_url',
        selected: url.pathname === '/settings/tracking_url',
        children: context.html`
          <i class="u-inline-block u-md-none icon icon-20 icon-link"></i>
          <span class="u-none u-md-inline">Tracking URL</span>
        `,
      },
      {
        key: 'url_replacement',
        href: '#/settings/url_replacement',
        selected: url.pathname === '/settings/url_replacement',
        children: context.html`
          <i class="u-inline-block u-md-none icon icon-20 icon-replace"></i>
          <span class="u-none u-md-inline">URL Replacement</span>
        `,
      },
      {
        key: 'siteinfo',
        href: '#/settings/siteinfo',
        selected: url.pathname === '/settings/siteinfo',
        children: context.html`
          <i class="u-inline-block u-md-none icon icon-20 icon-database"></i>
          <span class="u-none u-md-inline">Siteinfo</span>
        `,
      },
      {
        key: 'keyboard',
        href: '#/settings/keyboard',
        selected: url.pathname === '/settings/keyboard',
        children: context.html`
          <i class="u-inline-block u-md-none icon icon-20 icon-keyboard"></i>
          <span class="u-none u-md-inline">Keyboard</span>
        `,
      },
    ],
  });

  const content = context.html`
    <div class="container">
      <${tabList}>
      <${children}>
    </div>
  `;

  return MainLayout(
    {
      header,
      content,
    },
    context,
  );
}
