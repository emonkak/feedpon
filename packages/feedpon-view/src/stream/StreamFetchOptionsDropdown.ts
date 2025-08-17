import { createComponent, type RenderContext } from 'barebind';
import { LocalAtom } from 'barebind/extras/hooks';
import type {
  EntryOrderKind,
  StreamFetchOptions,
  StreamViewKind,
} from 'feedpon-messaging';
import { Dropdown } from '../primitives/Dropdown.ts';
import type { MenuItem } from '../primitives/Menu.ts';

interface StreamFetchOptionsDropdownProps {
  fetchOptions: StreamFetchOptions;
  isLoading: boolean;
  onChangeEntryOrder: (order: EntryOrderKind) => void;
  onChangeNumberOfEntries: (numEntries: number) => void;
  onChangeStreamView: (streamView: StreamViewKind) => void;
  onToggleOnlyUnread: () => void;
  streamView: StreamViewKind;
}

export const StreamFetchOptionsDropdown = createComponent(
  function StreamFetchOptionsDropdown(
    {
      fetchOptions,
      isLoading,
      onChangeEntryOrder,
      onChangeNumberOfEntries,
      onChangeStreamView,
      onToggleOnlyUnread,
      streamView,
    }: StreamFetchOptionsDropdownProps,
    $: RenderContext,
  ): unknown {
    const numEntriesToFetch$ = $.use(LocalAtom(fetchOptions.numEntries));

    const handleUpdateNumberOfEntries = $.useCallback(() => {
      onChangeNumberOfEntries(numEntriesToFetch$.value);
    }, [onChangeNumberOfEntries]);

    const handleInputNumberOfEntries = $.useCallback(
      (event: InputEvent) => {
        numEntriesToFetch$.value = (
          event.currentTarget as HTMLInputElement
        ).valueAsNumber;
      },
      [onChangeNumberOfEntries],
    );

    const handleToggleOnlyUnread = $.useCallback(() => {
      onToggleOnlyUnread();
    }, [onToggleOnlyUnread]);

    const checkmark = $.html`<i class="icon icon-16 icon-checkmark"></i>`;

    return Dropdown({
      trigger: ({ id, onToggle, open }, context) => context.html`
        <button
          aria-expanded=${open.toString()}
          aria-label="Stream fetch options"
          type="button"
          class="navbar-action"
          id=${id}
          @click=${onToggle}
        >
          <i class="icon icon-24 icon-menu-2"></i>
        </button>
      `,
      items: [
        {
          type: 'group',
          key: 'view',
          label: 'View',
          childItems: [
            { key: 'expanded' as StreamViewKind, label: 'Expanded view' },
            { key: 'collapsible' as StreamViewKind, label: 'Collapsible view' },
          ].map(
            ({ key, label }) =>
              ({
                type: 'button',
                key,
                checked: streamView === key,
                children: $.html`
                <div class="MenuItem-icon"><${streamView === key ? checkmark : null}></div>
                <div class="MenuItem-content">${label}</div>
              `,
                onAction: $.useCallback(() => {
                  onChangeStreamView(key);
                }, [onChangeStreamView]),
              }) as MenuItem,
          ),
        },
        {
          type: 'separator',
          key: 'separator1',
        },
        {
          type: 'group',
          key: 'order',
          label: 'Order',
          childItems: [
            { key: 'newest' as EntryOrderKind, label: 'Newest first' },
            { key: 'oldest' as EntryOrderKind, label: 'Oldest first' },
          ].map(
            ({ key, label }) =>
              ({
                type: 'button',
                key,
                checked: fetchOptions.entryOrder === key,
                children: $.html`
                <div class="MenuItem-icon"><${fetchOptions.entryOrder === key ? checkmark : null}></div>
                <div class="MenuItem-content">${label}</div>
              `,
                onAction: $.useCallback(() => {
                  onChangeEntryOrder(key);
                }, [onChangeStreamView]),
              }) as MenuItem,
          ),
        },
        {
          type: 'separator',
          key: 'separator2',
        },
        {
          type: 'group',
          key: 'number_of_entries_to_fetch',
          label: fetchOptions.numEntries.toLocaleString() + ' entries fetching',
          childItems: [
            {
              type: 'form',
              key: 'number_of_entries_to_fetch',
              ariaLabel: 'Number of entries to fetch',
              children: $.html`
              <div class="MenuItem-content">
                <div class="input-group">
                  <input
                    class="form-control u-text-right"
                    disabled=${isLoading}
                    min="1"
                    style="width: 6ch"
                    type="number"
                    $value=${numEntriesToFetch$}
                    @input=${handleInputNumberOfEntries}
                  >
                  <button type="submit" class="button button-positive">
                    OK
                  </button>
                </div>
              </div>
            `,
              onAction: handleUpdateNumberOfEntries,
            },
          ],
        },
        {
          type: 'separator',
          key: 'separator3',
        },
        {
          type: 'button',
          key: 'only_unread',
          checked: fetchOptions.onlyUnread,
          children: $.html`
          <div class="MenuItem-icon"><${fetchOptions.onlyUnread ? checkmark : null}></div>
          <div class="MenuItem-content">Only unread</div>
        `,
          onAction: handleToggleOnlyUnread,
        },
      ],
    });
  },
);
