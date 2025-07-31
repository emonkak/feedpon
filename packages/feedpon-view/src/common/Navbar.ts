import type { RenderContext } from 'barebind';

interface NavbarProps {
  children: unknown;
  progress?: number;
  onToggleSidebar?: () => void;
}

export function Navbar(
  { children, onToggleSidebar, progress }: NavbarProps,
  context: RenderContext,
): unknown {
  return context.html`
    <nav class="navbar">
      <div class="navbar-container">
        <button
          type="button"
          class="navbar-action"
          @click=${onToggleSidebar}
        >
          <i class="icon icon-24 icon-menu"></i>
        </button>
        <${children}>
      </div>
      <${
        progress !== undefined
          ? context.html`<div :style=${{ width: `${progress * 100}%` }} class="navbar-indicator"></div>`
          : null
      }>
    </nav>
  `;
}
