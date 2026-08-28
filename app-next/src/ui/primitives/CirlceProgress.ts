import { html } from 'barebind';

export interface CircleProgressProps {
  label: string;
  progress: number;
}

export function CircleProgress({ label, progress }: CircleProgressProps) {
  const content =
    progress < 1
      ? html`<div class="CircleProgress-content">${label}</div>`
      : html`<div class="CircleProgress-content PathIcon solid checkmark"></div>`;
  return html`
    <div class="CircleProgress" data-progress=${progress}>
      <${content}>
    </div>
  `;
}
