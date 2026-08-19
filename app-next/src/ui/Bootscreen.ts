import { html } from 'barebind';

export interface BootScreenProps {
  message: string;
}

export function BootScreen({ message }: BootScreenProps) {
  return html`
    <div class="BootScreen">
      <h1 class="BootScreen-title">Feedpon</h1>
      <div class="BootScreen-message">${message}</div>
    </div>
  `;
}
