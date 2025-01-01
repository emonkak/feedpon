import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { optional, styleMap } from '@emonkak/ebit/directives.js';

interface NavbarProps {
  children: TemplateResult;
  progress?: number;
  onToggleSidebar?: () => void;
}

export function Navbar(
  { children, onToggleSidebar, progress }: NavbarProps,
  context: RenderContext,
): TemplateResult {
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
      <${optional(
        progress !== undefined
          ? context.html`<div class="navbar-indicator" style=${styleMap({ width: `${progress * 100}%` })}></div>`
          : null,
      )}>
    </nav>
  `;
}
