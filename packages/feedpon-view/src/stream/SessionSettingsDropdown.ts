import { createComponent, type RenderContext } from 'barebind';
import { LocalAtom, LocalComputed } from 'barebind/extras/hooks';
import type { Computed } from 'barebind/extras/signal';
import type {
  StreamLayout,
  EntriesOrdering,
  SessionSettings,
} from 'feedpon-store/state';
import { Dropdown } from '../primitives/Dropdown.ts';
import type { MenuItem } from '../primitives/Menu.ts';

interface SessionSetttingsDropdownProps {
  disabled: boolean;
  onSessionSettingsUpdate: (
    newSessionSettings: SessionSettings,
    oldSessionSettings: SessionSettings,
  ) => void;
  sessionSettings: SessionSettings;
}

export const SessionSettingsDropdown = createComponent(function SessionDropdown(
  {
    sessionSettings,
    disabled,
    onSessionSettingsUpdate,
  }: SessionSetttingsDropdownProps,
  $: RenderContext,
): unknown {
  const count$ = $.use(LocalAtom(sessionSettings.count));
  const layout$ = $.use(LocalAtom(sessionSettings.layout));
  const ranked$ = $.use(LocalAtom(sessionSettings.ranked));
  const unreadOnly$ = $.use(LocalAtom(sessionSettings.unreadOnly));
  const sessionSettings$: Computed<SessionSettings> = $.use(
    LocalComputed(
      (count, layout, ranked, unreadOnly) => ({
        count,
        layout,
        ranked,
        unreadOnly,
      }),
      [count$, layout$, ranked$, unreadOnly$],
    ),
  );

  const handleSessionSettingsUpdate = () => {
    onSessionSettingsUpdate(sessionSettings$.value, sessionSettings);
  };

  const handleCountChange = (event: Event) => {
    count$.value = (event.currentTarget as HTMLInputElement).valueAsNumber;
  };

  const handleRankedChange = (_event: Event, key: string) => {
    ranked$.value = key as EntriesOrdering;
    onSessionSettingsUpdate(sessionSettings$.value, sessionSettings);
  };

  const handleLayoutChange = (_event: Event, key: string) => {
    layout$.value = key as StreamLayout;
    onSessionSettingsUpdate(sessionSettings$.value, sessionSettings);
  };

  const handleUnreadonlyChange = () => {
    unreadOnly$.value = !unreadOnly$.value;
    onSessionSettingsUpdate(sessionSettings$.value, sessionSettings);
  };

  const checkmark = $.html`<i class="icon icon-16 icon-checkmark"></i>`;

  const items: MenuItem[] = [
    {
      type: 'group',
      key: 'layout',
      label: 'Layout',
      childItems: [
        { key: 'full' satisfies StreamLayout, label: 'Full Layout' },
        {
          key: 'compact' satisfies StreamLayout,
          label: 'Compact Layout',
        },
      ].map(
        ({ key, label }) =>
          ({
            type: 'button',
            key,
            checked: key === layout$.value,
            children: $.html`
              <div class="MenuItem-icon"><${key === layout$.value ? checkmark : null}></div>
              <div class="MenuItem-content">${label}</div>
            `,
            onAction: handleLayoutChange,
          }) satisfies MenuItem,
      ),
    },
    {
      type: 'separator',
      key: 'separator1',
    },
    {
      type: 'group',
      key: 'ranked',
      label: 'Ordering',
      childItems: [
        {
          key: 'engagement' as EntriesOrdering,
          label: 'Higher engagement first',
        },
        { key: 'newest' as EntriesOrdering, label: 'Newest first' },
        { key: 'oldest' as EntriesOrdering, label: 'Oldest first' },
      ].map(
        ({ key, label }) =>
          ({
            type: 'button',
            key,
            checked: key === ranked$.value,
            children: $.html`
              <div class="MenuItem-icon"><${key === ranked$.value ? checkmark : null}></div>
              <div class="MenuItem-content">${label}</div>
            `,
            onAction: handleRankedChange,
          }) as MenuItem,
      ),
    },
    {
      type: 'separator',
      key: 'separator2',
    },
    {
      type: 'group',
      key: 'count',
      label: `Fetch ${sessionSettings.count} entries at a time`,
      childItems: [
        {
          type: 'form',
          key: 'count',
          ariaLabel: 'Number of entries to fetch',
          children: $.html`
              <div class="MenuItem-content">
                <div class="input-group">
                  <input
                    class="form-control u-text-right"
                    disabled=${disabled}
                    min="1"
                    style="width: 6ch"
                    type="number"
                    $value=${count$}
                    @input=${handleCountChange}
                  >
                  <button type="submit" class="button button-positive">
                    Save
                  </button>
                </div>
              </div>
            `,
          onAction: handleSessionSettingsUpdate,
        },
      ],
    },
    {
      type: 'separator',
      key: 'separator3',
    },
    {
      type: 'button',
      key: 'unreadOnly',
      checked: unreadOnly$.value,
      children: $.html`
        <div class="MenuItem-icon"><${sessionSettings.unreadOnly ? checkmark : null}></div>
        <div class="MenuItem-content">Only unread</div>
      `,
      onAction: handleUnreadonlyChange,
    },
  ];

  return Dropdown({
    trigger: ({ id, onMenuToggle, open }, context) => context.html`
        <button
          aria-expanded=${open.toString()}
          aria-label="Stream fetch options"
          type="button"
          class="navbar-action"
          id=${id}
          @click=${onMenuToggle}
        >
          <i class="icon icon-24 icon-menu-2"></i>
        </button>
      `,
    items,
  });
});
