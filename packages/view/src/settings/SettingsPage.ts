import { BindActionCreators } from '@feedpon/foundation';
import { AppStore } from '@feedpon/model';
import * as uiActions from '@feedpon/model/actions/ui';
import { Navbar, TabList } from '@feedpon/primitives';
import { createComponent, html } from 'barebind';
import { MainLayout } from '../layout/MainLayout.ts';

export interface SettingsProps {
  children: unknown;
  url: string;
}

export const SettingsPage = createComponent<SettingsProps>(
  function SettingsPage({ children, url }) {
    const { toggleSidebar } = this.use(BindActionCreators(AppStore, uiActions));

    const header = Navbar({
      onSidebarToggle: toggleSidebar,
      children: html`
        <h1 class="navbar-title">Settings</h1>
      `,
    });

    const tabList = TabList({
      items: [
        {
          key: 'appearance',
          href: '#/settings/appearance',
          selected: url === '/settings/appearance',
          children: html`
            <i class="u-inline-block u-md-none icon icon-20 icon-browser-window"></i>
            <span class="u-none u-md-inline">Appearance</span>
          `,
        },
        {
          key: 'stream',
          href: '#/settings/stream',
          selected: url === '/settings/stream',
          children: html`
            <i class="u-inline-block u-md-none icon icon-20 icon-news-feed"></i>
            <span class="u-none u-md-inline">Stream</span>
          `,
        },
      ],
    });

    const content = html`
      <div class="container">
        <${tabList}>
        <${children}>
      </div>
    `;

    return MainLayout({
      header,
      content,
    });
  },
);
