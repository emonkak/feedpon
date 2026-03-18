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

  const closeDropdown = () => {
    setOpen(false);
    onMenuToggle?.(false);
  };

  const toggleDropdown = () => {
    setOpen((open) => !open);
    onMenuToggle?.(!open);
  };

  const handleItemAction = (event: Event) => {
    if (!event.defaultPrevented) {
      closeDropdown();
    }
  };

  const handleMenuToggle = (open: boolean) => {
    setOpen(open);
    onMenuToggle?.(open);
  };

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
