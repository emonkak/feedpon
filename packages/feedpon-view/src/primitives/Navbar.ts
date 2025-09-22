import { createComponent, type RenderContext } from 'barebind';

interface NavbarProps {
  children: unknown;
  onSidebarToggle: (shown?: boolean) => void;
  progress?: number;
}

export const Navbar = createComponent(function Navbar(
  { children, onSidebarToggle, progress }: NavbarProps,
  $: RenderContext,
): unknown {
  const handleSidebarToggle = () => {
    onSidebarToggle();
  };

  return $.html`
    <nav class="navbar">
      <div class="navbar-container">
        <button
          type="button"
          class="navbar-action"
          @click=${handleSidebarToggle}
        >
          <i class="icon icon-24 icon-menu"></i>
        </button>
        <${children}>
      </div>
      <${
        progress !== undefined
          ? $.html`<div :style=${{ width: `${progress * 100}%` }} class="navbar-indicator"></div>`
          : null
      }>
    </nav>
  `;
});
