import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { optional, styleMap } from '@emonkak/ebit/directives.js';
import React from 'react';

interface ReactNavbarProps {
  children?: React.ReactNode;
  progress?: number;
  onToggleSidebar?: () => void;
}

export function ReactNavbar({
  children,
  onToggleSidebar,
  progress,
}: ReactNavbarProps) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button
          type="button"
          className="navbar-action"
          onClick={onToggleSidebar}
        >
          <i className="icon icon-24 icon-menu" />
        </button>
        {children}
      </div>
      {progress != null && (
        <div
          className="navbar-indicator"
          style={{ width: `${progress * 100}%` }}
        />
      )}
    </nav>
  );
}

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
