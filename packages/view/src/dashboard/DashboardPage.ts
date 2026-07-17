import { BindActionCreators } from '@feedpon/foundation';
import { AppStore, parseStreamId, type Session } from '@feedpon/model';
import * as uiActions from '@feedpon/model/actions/ui';
import { Navbar, RelativeTime } from '@feedpon/primitives';
import { createComponent, html } from 'barebind';
import { MainLayout } from '../layout/MainLayout.ts';

export interface DashboardPageProps {}

export const DashboardPage = createComponent<DashboardPageProps>(
  function DashboardPage() {
    const { state$ } = this.use(AppStore);
    const pastSessions = this.use(state$.get('pastSessions'));

    const { toggleSidebar } = this.use(BindActionCreators(AppStore, uiActions));

    const pastSessionList =
      pastSessions.length === 0
        ? html`
          <p>No sessions yet.</p>
        `
        : html`
          <ol class="list-group">
            <${pastSessions.map((session) =>
              PastSessionView({ session }).withKey(session.id),
            )}>
          </ol>
        `;

    return MainLayout({
      content: html`
        <div class="container">
          <section class="section">
            <h1 class="display-1">Recently read</h1>
            <${pastSessionList}>
          </section>
        </div>
      `,
      header: Navbar({
        onSidebarToggle: toggleSidebar,
        children: html`
          <h1 class="navbar-title">Dashboard</h1>
        `,
      }),
    });
  },
);

interface PastSessionViewProps {
  session: Session;
}

const PastSessionView = createComponent<PastSessionViewProps>(
  function PastSessionView({ session }) {
    const icon =
      parseStreamId(session.id).type === 'feed'
        ? html`<i class="icon icon-16 icon-file"></i>`
        : html`<i class="icon icon-16 icon-folder"></i>`;

    return html`
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
  },
);
