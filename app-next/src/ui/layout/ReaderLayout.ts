import { createComponent, html, type VElement } from 'barebind';
import type { AsyncResource } from '../hooks/AsyncResource.ts';

export interface ReaderLayoutProps {
  page: AsyncResource<VElement>;
  sidebar: AsyncResource<VElement>;
}

export const ReaderLayout = createComponent(function ReaderLayout({
  page,
  sidebar,
}: ReaderLayoutProps) {
  return html`
    <div class="ReaderLayout">
      <aside
        class=${['ReaderLayout-Sidebar', { loading: sidebar.state === 'pending' }]}
        inert=${sidebar.state === 'pending'}
      >
        <${sidebar.value}>
      </aside>
      <main
        class=${['ReaderLayout-Page', { loading: page.state === 'pending' }]}
        inert=${page.state === 'pending'}
      >
        <${page.value}>
      </main>
    </div>
  `;
});
