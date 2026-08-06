import { html } from 'barebind';
import type { AsyncResource } from '../hooks/AsyncResource.ts';

export interface ReaderLayoutProps {
  main: AsyncResource<unknown>;
  sidebar: AsyncResource<unknown>;
}

export function ReaderLayout({ main, sidebar }: ReaderLayoutProps) {
  return html`
    <div class="ReaderLayout">
      <aside class=${['ReaderLayout-Sidebar', { loading: sidebar.loading }]}>
        <${sidebar.content}>
      </aside>
      <main class=${['ReaderLayout-Main', { loading: main.loading }]}>
        <${main.content}>
      </main>
    </div>
  `;
}
