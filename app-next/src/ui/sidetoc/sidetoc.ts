import { createComponent, html } from 'barebind';
import type { NavigationScene } from 'barebind/addons/router';

export interface SidetocProps {
  scene: NavigationScene;
}

export const Sidetoc = createComponent((_props: SidetocProps) => {
  return html`
    <div class="Sidetoc">
    </div>
  `;
});
