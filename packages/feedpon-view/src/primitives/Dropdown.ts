import { createComponent, type RenderContext } from 'barebind';

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

export const Dropdown = createComponent(function Dropdown(
  { items, trigger, onToggle }: DropdownProps,
  $: RenderContext,
): unknown {
  const [open, setOpen] = $.useState(false);

  const closeDropdown = $.useCallback(() => {
    setOpen(false);
    onToggle?.(false);
  }, []);

  const toggleDropdown = $.useCallback(() => {
    setOpen((open) => {
      const newOpen = !open;
      onToggle?.(newOpen);
      return newOpen;
    });
  }, []);

  const handleItemAction = $.useCallback((event: Event) => {
    if (!event.defaultPrevented) {
      closeDropdown();
    }
  }, []);

  const handleToggle = $.useCallback((open: boolean) => {
    setOpen(open);
    onToggle?.(open);
  }, []);

  const triggerId = $.useId();

  return $.html`
    <div
      class="Dropdown"
    >
      <${trigger({ id: triggerId, onToggle: toggleDropdown, open }, $)}>
      <${Menu({
        target: triggerId,
        items,
        onItemAction: handleItemAction,
        onToggle: handleToggle,
        open: open,
      })}>
    </div>
  `;
});
