import { html, type VElement } from 'barebind';
import type { AsyncResource } from '../hooks/AsyncResource.ts';

export interface ReaderScreenProps {
  page: AsyncResource<VElement | undefined>;
  sidenav: VElement;
  sidetoc: VElement;
}

export function ReaderScreen({ page, sidenav, sidetoc }: ReaderScreenProps) {
  return html`
    <div class="ReaderScreen">
      <nav class="ReaderScreen-Sidenav">
        <${sidenav}>
      </nav>
      <main
        class="ReaderScreen-Main"
        inert=${page.state === 'pending'}
      >
        <${page.value}>
      </main>
      <aside class="ReaderScreen-Sidetoc">
        <${sidetoc}>
      </aside>
    </div>
  `;
}
