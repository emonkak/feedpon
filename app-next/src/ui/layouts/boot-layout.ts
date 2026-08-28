import { html } from 'barebind';

export interface BootLayoutProps {
  message: string;
}

export function BootLayout({ message }: BootLayoutProps) {
  return html`
    <div class="BootLayout">
      <h1 class="BootLayout-title">Feedpon</h1>
      <div class="BootLayout-message">${message}</div>
    </div>
  `;
}
