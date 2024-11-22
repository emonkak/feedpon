import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { atom, component, live, optional } from '@emonkak/ebit/directives.js';
import type {
  EntryOrderKind,
  StreamFetchOptions,
  StreamViewKind,
} from 'feedpon-messaging';
import { Menu } from '../primitives/Menu';

interface StreamFetchOptionsDropdownProps {
  fetchOptions: StreamFetchOptions;
  isLoading: boolean;
  onChangeEntryOrder: (order: EntryOrderKind) => void;
  onChangeNumberOfEntries: (numEntries: number) => void;
  onChangeStreamView: (streamView: StreamViewKind) => void;
  onToggleOnlyUnread: () => void;
  streamView: StreamViewKind;
}

export function StreamFetchOptionsDropdown(
  {
    fetchOptions,
    isLoading,
    onChangeEntryOrder,
    onChangeNumberOfEntries,
    onChangeStreamView,
    onToggleOnlyUnread,
    streamView,
  }: StreamFetchOptionsDropdownProps,
  context: RenderContext,
): TemplateResult {
  const [isOpened, setIsOpened] = context.useState(false);
  const numEntries$ = context.useMemo(() => atom(fetchOptions.numEntries), []);

  const toggleId = context.useId();

  const closeDropdown = context.useCallback(() => {
    setIsOpened(false);
  }, []);

  const toggleDropdown = context.useCallback(() => {
    setIsOpened((isOpened) => !isOpened);
  }, []);

  const checkmark = context.html`<i class="icon icon-16 icon-checkmark"></i>`;

  const menuChildren = context.html`
    <div class="MenuSection" role="group">
      <div class="MenuHeading" role="heading">View</div>
      <button
        class="MenuItem"
        role="menuitem"
        type="button"
        @click=${context.useCallback(() => {
          onChangeStreamView('expanded');
          closeDropdown();
        }, [onChangeStreamView])}>
        <div class="MenuItem-icon"><${optional(streamView === 'expanded' ? checkmark : null)}></div>
        <div class="MenuItem-content">Expanded view</div>
      </button>
      <button
        class="MenuItem"
        type="button"
        @click=${context.useCallback(() => {
          onChangeStreamView('collapsible');
          closeDropdown();
        }, [onChangeStreamView])}>
        <div class="MenuItem-icon"><${optional(streamView === 'collapsible' ? checkmark : null)}></div>
        <div class="MenuItem-content">Collapsible view</div>
      </button>
    </div>
    <hr class="MenuSeparator">
    <div class="MenuSection" role="group">
      <div class="MenuHeading" role="heading">Order</div>
      <button
        class="MenuItem"
        disabled=${isLoading}
        role="menuitem"
        type="button"
        @click=${context.useCallback(() => {
          onChangeEntryOrder('newest');
          closeDropdown();
        }, [onChangeEntryOrder])}>
        <div class="MenuItem-icon"><${optional(fetchOptions.entryOrder === 'newest' ? checkmark : null)}></div>
        <div class="MenuItem-content">Newest first</div>
      </button>
      <button
        class="MenuItem"
        disabled=${isLoading}
        role="menuitem"
        type="button"
        @click=${context.useCallback(() => {
          onChangeEntryOrder('oldest');
          closeDropdown();
        }, [onChangeEntryOrder])}>
        <div class="MenuItem-icon"><${optional(fetchOptions.entryOrder === 'oldest' ? checkmark : null)}></div>
        <div class="MenuItem-content">Oldest first</div>
      </button>
    </div>
    <hr class="MenuSeparator">
    <div class="MenuSection" role="group">
      <div class="MenuHeading" role="heading">
        ${fetchOptions.numEntries} entries fetching
      </div>
      <form
        class="MenuItem"
        role="menuitem"
        @submit=${context.useCallback(() => {
          onChangeNumberOfEntries(numEntries$.value);
          closeDropdown();
        }, [onChangeNumberOfEntries])}>
        <div class="MenuItem-content">
          <div class="input-group">
            <input
              class="form-control u-text-right"
              disabled=${isLoading}
              min="1"
              style="width: 6ch"
              type="number"
              .value=${numEntries$.map(live)}
              @input=${context.useCallback((event: Event) => {
                numEntries$.value = Number.parseInt(
                  (event.currentTarget as HTMLInputElement).value,
                  10,
                );
              }, [])}
            >
            <button type="submit" class="button button-positive">
              OK
            </button>
          </div>
        </div>
      </form>
    </div>
    <hr class="MenuSeparator">
    <button
      class="MenuItem"
      disabled=${isLoading}
      role="menuitem"
      type="button"
      @click=${context.useCallback(() => {
        onToggleOnlyUnread();
        closeDropdown();
      }, [onToggleOnlyUnread])}>
      <div class="MenuItem-icon"><${optional(fetchOptions.onlyUnread ? checkmark : null)}></div>
      <div class="MenuItem-content">Only unread</div>
    </button>
  `;

  return context.html`
    <div class="Dropdown">
      <button
        aria-label="Stream fetch options"
        type="button"
        class="navbar-action"
        id=${toggleId}
        @click=${toggleDropdown}
      >
        <i class="icon icon-24 icon-menu-2"></i>
      </button>
      <${component(Menu, {
        anchorTarget: toggleId,
        children: menuChildren,
        onClose: closeDropdown,
        open: isOpened,
      })}>
    </div>
  `;
}
