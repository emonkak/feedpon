import { createComponent, type RenderContext, Repeat } from 'barebind';
import { AppStore, parseStreamId, type Session } from 'feedpon-store';
import {} from 'feedpon-store/actions/stream';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'state-management';

import { MainLayout } from '../layout/MainLayout.ts';
import { Navbar } from '../primitives/Navbar.ts';
import { RelativeTime } from '../primitives/RelativeTime.ts';

export interface DashboardPageProps {
  store: AppStore;
}

export const DashboardPage = createComponent(function DashboardPage(
  { store }: DashboardPageProps,
  $: RenderContext,
): unknown {
  const { state$ } = store;
  const pastSessions = $.use(state$.get('pastSessions'));

  const { toggleSidebar } = $.use(BindActionCreators(AppStore, uiActions));

  const pastSessionList =
    pastSessions.length === 0
      ? $.html`
        <p>No sessions yet.</p>
      `
      : $.html`
        <ol class="list-group">
          <${Repeat({
            source: pastSessions,
            keySelector: (session) => session.id,
            valueSelector: (session) => PastSessionView({ session }),
          })}>
        </ol>
      `;

  return MainLayout({
    content: $.html`
      <div class="container">
        <section class="section">
          <h1 class="display-1">Recently read</h1>
          <${pastSessionList}>
        </section>
      </div>
    `,
    header: Navbar({
      onSidebarToggle: toggleSidebar,
      children: $.html`
        <h1 class="navbar-title">Dashboard</h1>
      `,
    }),
  });
});

interface PastSessionViewProps {
  session: Session;
}

const PastSessionView = createComponent(function PastSessionView(
  { session }: PastSessionViewProps,
  $: RenderContext,
): unknown {
  const icon =
    parseStreamId(session.id).type === 'feed'
      ? $.html`<i class="icon icon-16 icon-file"></i>`
      : $.html`<i class="icon icon-16 icon-folder"></i>`;

  return $.html`
    <a
      class="list-group-item"
      href=${`#/streams/${encodeURIComponent(session.id)}`}
    >
      <div class="u-flex u-flex-align-items-center">
        <div class="u-flex-shrink-0 u-margin-right-2">
          <${icon}>
        </div>
        <div class="u-flex-grow-1 u-margin-right-2">
          <div>${session.title}</div>
          <div class="u-text-7 u-text-muted">
            <${RelativeTime({ time: session.updated })}>
          </div>
        </div>
      </div>
    </a>
  `;
});
