import { createComponent, type RenderContext } from 'barebind';

import { Menu, type MenuItem } from './Menu.ts';

export interface DropdownProps {
  items: MenuItem[];
  onMenuToggle?: (open: boolean) => void;
  trigger: (props: TriggerProps, context: RenderContext) => unknown;
}

export interface TriggerProps {
  id: string;
  onMenuToggle: () => void;
  open: boolean;
}

export const Dropdown = createComponent(function Dropdown(
  { items, trigger, onMenuToggle }: DropdownProps,
  $: RenderContext,
): unknown {
  const [open, setOpen] = $.useState(false);

  const closeDropdown = $.useCallback(() => {
    setOpen(false);
    onMenuToggle?.(false);
  }, []);

  const toggleDropdown = $.useCallback(() => {
    setOpen((open) => {
      const newOpen = !open;
      onMenuToggle?.(newOpen);
      return newOpen;
    });
  }, []);

  const handleItemAction = $.useCallback((event: Event) => {
    if (!event.defaultPrevented) {
      closeDropdown();
    }
  }, []);

  const handleMenuToggle = $.useCallback((open: boolean) => {
    setOpen(open);
    onMenuToggle?.(open);
  }, []);

  const triggerId = $.useId();

  return $.html`
    <div
      class="Dropdown"
    >
      <${trigger({ id: triggerId, onMenuToggle: toggleDropdown, open }, $)}>
      <${Menu({
        target: triggerId,
        items,
        onItemAction: handleItemAction,
        onMenuToggle: handleMenuToggle,
        open: open,
      })}>
    </div>
  `;
});
