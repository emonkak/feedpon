import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component } from '@emonkak/ebit/directives.js';
import { Menu } from './Menu';

export interface DropdownProps {
  toggleButton: (
    props: ToggleButtonProps,
    context: RenderContext,
  ) => TemplateResult;
  children: TemplateResult;
}

export interface ToggleButtonProps {
  id: string;
  toggle: () => void;
  opened: boolean;
}

export function Dropdown(
  { children, toggleButton }: DropdownProps,
  context: RenderContext,
): TemplateResult {
  const [opened, setOpened] = context.useState(false);

  const close = context.useCallback(() => {
    setOpened(false);
  }, []);

  const toggle = context.useCallback(() => {
    setOpened((isOpened) => !isOpened);
  }, []);

  const toggleId = context.useId();

  return context.html`
    <div
      class="Dropdown"
    >
      <${component(toggleButton, { id: toggleId, toggle, opened })}>
      <${component(Menu, {
        anchorTarget: toggleId,
        children,
        onClose: close,
        open: opened,
      })}>
    </div>
  `;
}
