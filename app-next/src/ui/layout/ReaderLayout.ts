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
        class=${['ReaderLayout-Sidebar', { loading: sidebar.status === 'pending' }]}
        inert=${sidebar.status === 'pending'}
      >
        <${sidebar.value}>
      </aside>
      <main
        class=${['ReaderLayout-Page', { loading: page.status === 'pending' }]}
        inert=${page.status === 'pending'}
      >
        <${page.value}>
      </main>
    </div>
  `;
});
