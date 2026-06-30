import { createComponent, html } from 'barebind';
import { LocalAtom, LocalComputed } from 'barebind/addons/signal';
import type { EntriesOrdering, StreamLayout } from 'feedpon-store';
import { AppStore } from 'feedpon-store';
import * as streamActions from 'feedpon-store/actions/stream';
import { BindActionCreators } from 'store';
import { openAlertDialog } from '../primitives/AlertDialog.ts';

export interface StreamSettingsProps {}

export const StreamSettings = createComponent<StreamSettingsProps>(
  function StreamSettings() {
    const { state$ } = this.use(AppStore);
    const currentDefaultSessionSettings = this.use(
      state$.get('defaultSessionSettings'),
    );
    const currentStreamSettings = this.use(state$.get('streamSettings'));

    const count$ = this.use(LocalAtom(currentDefaultSessionSettings.count));
    const ranked$ = this.use(LocalAtom(currentDefaultSessionSettings.ranked));
    const layout$ = this.use(LocalAtom(currentDefaultSessionSettings.layout));
    const unreadOnly$ = this.use(
      LocalAtom(currentDefaultSessionSettings.unreadOnly),
    );
    const maxSessions$ = this.use(LocalAtom(currentStreamSettings.maxSessions));

    const defaultSessionSettings$ = this.use(
      LocalComputed(
        (count, ranked, layout, unreadOnly) => ({
          count,
          ranked,
          layout,
          unreadOnly,
        }),
        [count$, ranked$, layout$, unreadOnly$],
      ),
    );
    const streamSettings$ = this.use(
      LocalComputed(
        (maxSessions) => ({
          maxSessions,
        }),
        [maxSessions$],
      ),
    );

    const {
      updateDefaultSessionSettings,
      updateStreamSettings,
      clearSessions,
    } = this.use(BindActionCreators(AppStore, streamActions));

    const handleCountChange = (event: Event) => {
      count$.value = (event.currentTarget as HTMLInputElement).valueAsNumber;
    };

    const handleRankedChange = (event: Event) => {
      ranked$.value = (event.currentTarget as HTMLInputElement)
        .value as EntriesOrdering;
    };

    const handleLayoutChange = (event: Event) => {
      layout$.value = (event.currentTarget as HTMLInputElement)
        .value as StreamLayout;
    };

    const handleUnreadOnlyChange = (event: Event) => {
      unreadOnly$.value = (event.currentTarget as HTMLInputElement).checked;
    };

    const handleMaxSessionsChange = (event: Event) => {
      maxSessions$.value = (
        event.currentTarget as HTMLInputElement
      ).valueAsNumber;
    };

    const handleSessionsClear = () => {
      openAlertDialog({
        confirmButton: ({ onConfirm }) => html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Clear</button>
        `,
        cancelButton: ({ onCancel }) => html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
        onConfirm: () => {
          clearSessions();
        },
        title: 'Clear stream caches',
        message: 'Are you sure you want to clear stream caches?',
      });
    };

    const handleDefaultSessionSettingsUpdate = (event: SubmitEvent) => {
      event.preventDefault();
      updateDefaultSessionSettings(defaultSessionSettings$.value);
    };

    const handleStreamSettingsUpdate = (event: SubmitEvent) => {
      event.preventDefault();
      updateStreamSettings(streamSettings$.value);
    };

    return html`
      <section class="section">
        <h1 class="display-1">Stream Settings</h1>
        <form class="form" @submit=${handleDefaultSessionSettingsUpdate}>
          <div class="form-legend">Default Session Settings</div>
          <div class="form-group">
            <label>
              <div class="form-group-heading">
                Number of entries to load at once
              </div>
              <input
                class="form-control"
                max="1000"
                min="1"
                required
                type="number"
                $value=${count$}
                @change=${handleCountChange}
              >
            </label>
          </div>
          <div class="form-group">
            <div class="form-group-heading">Entries Ordering</div>
            ${(
              ['engagement', 'newest', 'oldest'] satisfies EntriesOrdering[]
            ).map(
              (value) => html`
                <label class="form-check-label">
                  <input
                    checked=${ranked$.value === value}
                    class="form-check"
                    required
                    type="radio"
                    value=${value}
                    @change=${handleRankedChange}
                  >
                  ${value.charAt(0).toUpperCase() + value.slice(1)}
                </label>
              `,
            )}
          </div>
          <div class="form-group">
            <div class="form-group-heading">Entries Layout</div>
            ${(['full', 'compact'] satisfies StreamLayout[]).map(
              (value) => html`
                <label class="form-check-label">
                  <input
                    checked=${layout$.value === value}
                    class="form-check"
                    required
                    type="radio"
                    value=${value}
                    @change=${handleLayoutChange}
                  >
                  ${value.charAt(0).toUpperCase() + value.slice(1)}
                </label>
              `,
            )}
          </div>
          <div class="form-group">
            <label class="form-check-label">
              <input
                checked=${unreadOnly$.value}
                class="form-check"
                type="checkbox"
                @change=${handleUnreadOnlyChange}
              >
              Fetch only unread entries
            </label>
          </div>
          <div class="form-group">
            <button type="submit" class="button button-outline-positive">
              Save
            </button>
          </div>
        </form>
        <form class="form" @submit=${handleStreamSettingsUpdate}>
          <div class="form-legend">Stream Settings</div>
          <div class="form-group">
            <label>
              <div class="form-group-heading">
                Maximum number of past sessions to remember
              </div>
              <input
                class="form-control"
                min="0"
                required
                type="number"
                $value=${maxSessions$}
                @change=${handleMaxSessionsChange}
              >
            </label>
          </div>
          <div class="form-group">
            <button type="submit" class="button button-outline-positive">
              Save
            </button>
          </div>
        </form>
        <form class="form" @submit=${handleSessionsClear}>
          <div class="form-legend">Session Operations</div>
          <div class="form-group">
            <button
              type="submit"
              class="button button-outline-negative"
            >
              Clear sessions...
            </button>
          </div>
        </form>
      </section>
    `;
  },
);
