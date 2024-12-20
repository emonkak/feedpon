import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component } from '@emonkak/ebit/directives.js';
import { Menu, type MenuPrimitive } from './Menu';

export interface DropdownProps {
  items: MenuPrimitive[];
  onToggle?: (open: boolean) => void;
  trigger: (props: ToggleButtonProps, context: RenderContext) => TemplateResult;
}

export interface ToggleButtonProps {
  id: string;
  onToggle: () => void;
  open: boolean;
}

export function Dropdown(
  { items, trigger, onToggle }: DropdownProps,
  context: RenderContext,
): TemplateResult {
  const [open, setOpen] = context.useState(false);

  const closeDropdown = context.useCallback(() => {
    setOpen(false);
    onToggle?.(false);
  }, []);

  const toggleDropdown = context.useCallback(() => {
    setOpen((open) => {
      const newOpen = !open;
      onToggle?.(newOpen);
      return newOpen;
    });
  }, []);

  const handleToggle = context.useCallback((open: boolean) => {
    setOpen(open);
    onToggle?.(open);
  }, []);

  const triggerId = context.useId();

  return context.html`
    <div
      class="Dropdown"
    >
      <${trigger({ id: triggerId, onToggle: toggleDropdown, open }, context)}>
      <${component(Menu, {
        target: triggerId,
        items,
        onItemSelect: closeDropdown,
        onToggle: handleToggle,
        open: open,
      })}>
    </div>
  `;
}
