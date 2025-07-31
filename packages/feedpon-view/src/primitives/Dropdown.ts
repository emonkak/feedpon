import { component, type RenderContext } from 'barebind';

import { Menu, type MenuItem } from './Menu.ts';

export interface DropdownProps {
  items: MenuItem[];
  onToggle?: (open: boolean) => void;
  trigger: (props: TriggerProps, context: RenderContext) => unknown;
}

export interface TriggerProps {
  id: string;
  onToggle: () => void;
  open: boolean;
}

export function Dropdown(
  { items, trigger, onToggle }: DropdownProps,
  context: RenderContext,
): unknown {
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

  const handleItemAction = context.useCallback((event: Event) => {
    if (!event.defaultPrevented) {
      closeDropdown();
    }
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
        onItemAction: handleItemAction,
        onToggle: handleToggle,
        open: open,
      })}>
    </div>
  `;
}
