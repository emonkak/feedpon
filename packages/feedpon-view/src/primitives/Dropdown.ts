import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component } from '@emonkak/ebit/directives.js';

import { Menu } from './Menu';

export interface DropdownProps {
  onToggle?: (open: boolean) => void;
  renderItems: (
    actions: DropdownActions,
    context: RenderContext,
  ) => TemplateResult;
  renderToggle: (
    actions: DropdownActions,
    context: RenderContext,
  ) => TemplateResult;
}

export interface DropdownActions {
  close: () => void;
  open: () => void;
  toggle: () => void;
}

export function Dropdown(
  { onToggle, renderItems, renderToggle }: DropdownProps,
  context: RenderContext,
): TemplateResult {
  const [isOpened, setIsOpened] = context.useState(false);

  const toggleId = context.useId();

  const open = context.useCallback(() => {
    setIsOpened(true);
    onToggle?.(true);
  }, []);
  const close = context.useCallback(() => {
    setIsOpened(false);
    onToggle?.(false);
  }, []);
  const toggle = context.useCallback(() => {
    setIsOpened((isOpened) => {
      onToggle?.(!isOpened);
      return !isOpened;
    });
  }, []);
  const actions = { open, close, toggle };

  return context.html`
    <div class="Dropdown">
      <div class="Dropdown-toggle" id=${toggleId}>
        <${renderToggle(actions, context)}>
      </div>
      <div class="Dropdown-menu">
        <${component(Menu, {
          anchorTarget: toggleId,
          children: renderItems(actions, context),
          onClose: close,
          open: isOpened,
        })}>
      </div>
    </div>
  `;
}
