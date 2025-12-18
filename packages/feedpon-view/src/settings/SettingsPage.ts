import { createComponent, type RenderContext } from 'barebind';
import type { RelativeURL } from 'barebind/extras/router';
import { AppStore } from 'feedpon-store';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'state-management';
import { MainLayout } from '../layout/MainLayout.ts';
import { Navbar } from '../primitives/Navbar.ts';
import { TabList } from '../primitives/TabList.ts';

export interface SettingsProps {
  children: unknown;
  url: RelativeURL;
}

export const SettingsPage = createComponent(function SettingsPage(
  { children, url }: SettingsProps,
  $: RenderContext,
): unknown {
  const { toggleSidebar } = $.use(BindActionCreators(AppStore, uiActions));

  const header = Navbar({
    onSidebarToggle: toggleSidebar,
    children: $.html`
      <h1 class="navbar-title">Settings</h1>
    `,
  });

  const tabList = TabList({
    items: [
      {
        key: 'ui',
        href: '#/settings/ui',
        selected: url.pathname === '/settings/ui',
        children: $.html`
          <i class="u-inline-block u-md-none icon icon-20 icon-browser-window"></i>
          <span class="u-none u-md-inline">UI</span>
        `,
      },
      {
        key: 'stream',
        href: '#/settings/stream',
        selected: url.pathname === '/settings/stream',
        children: $.html`
          <i class="u-inline-block u-md-none icon icon-20 icon-news-feed"></i>
          <span class="u-none u-md-inline">Stream</span>
        `,
      },
    ],
  });

  const content = $.html`
    <div class="container">
      <${tabList}>
      <${children}>
    </div>
  `;

  return MainLayout({
    header,
    content,
  });
});
