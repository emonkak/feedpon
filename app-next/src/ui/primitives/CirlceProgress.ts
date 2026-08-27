import { html } from 'barebind';

export interface CircleProgressProps {
  label: string;
  progress: number;
}

export function CircleProgress({ label, progress }: CircleProgressProps) {
  const content =
    progress < 1
      ? html`<div class="slot-content">${label}</div>`
      : html`<div class="PathIcon solid checkmark slot-content"></div>`;
  return html`
    <div class="CircleProgress" data-progress=${progress}>
      <${content}>
    </div>
  `;
}
