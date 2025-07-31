import { component, type RenderContext, repeat } from 'barebind';
import { Atom } from 'barebind/extensions/signal';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State } from 'feedpon-messaging';
import {
  addTrackingUrlPattern,
  changeTrakingUrlCacheCapacity,
  deleteTrackingUrlPattern,
  resetTrackingUrlPatterns,
} from 'feedpon-messaging/trackingUrls';

import { AlertDialog } from '../primitives/AlertDialog.ts';
import { TrackingUrlPatternForm } from './TrackingUrlPatternForm.ts';
import { TrackingUrlPatternRow } from './TrackingUrlPatternRow.ts';

export interface TrackingUrlSettingsProps {}

export function TrackingUrlSettings(
  _props: TrackingUrlSettingsProps,
  context: RenderContext,
): unknown {
  const {
    cacheCapacity: initialCacheCapacity,
    onAddTrackingUrlPattern,
    onChangeTrakingUrlCacheCapacity,
    onDeleteTrackingUrlPattern,
    onResetTrackingUrlPatterns,
    patterns,
  } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        cacheCapacity: state.trackingUrls.items.capacity,
        patterns: state.trackingUrls.patterns,
      }),
      mapDispatchToProps: bindActions({
        onAddTrackingUrlPattern: addTrackingUrlPattern,
        onChangeTrakingUrlCacheCapacity: changeTrakingUrlCacheCapacity,
        onDeleteTrackingUrlPattern: deleteTrackingUrlPattern,
        onResetTrackingUrlPatterns: resetTrackingUrlPatterns,
      }),
    }),
  );

  const cacheCapacity$ = context.use(Atom.untracked(initialCacheCapacity));

  const handleChangeCacheCapacity = context.useCallback((event: Event) => {
    cacheCapacity$.value = (
      event.currentTarget as HTMLInputElement
    ).valueAsNumber;
  }, []);

  const handleReset = context.useCallback(() => {
    AlertDialog.open({
      confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Reset</button>
        `,
      cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
      onConfirm: () => {
        onResetTrackingUrlPatterns();
      },
      title: 'Reset all tracking URLs',
      message: 'Are you sure you want to reset all tracking URLs?',
    });
  }, [onResetTrackingUrlPatterns]);

  const handleSubmitCacheCapacity = context.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      onChangeTrakingUrlCacheCapacity(cacheCapacity$.value);
    },
    [],
  );

  const rows = repeat({
    source: patterns,
    keySelector: (pattern) => pattern,
    valueSelector: (pattern) =>
      component(TrackingUrlPatternRow, {
        pattern,
        onDelete: onDeleteTrackingUrlPattern,
      }),
  });

  return context.html`
    <section class="section">
      <h1 class="display-1">Tracking URL</h1>
      <p>
        It expands the url that matches any tracking url pattern. Thereby you
        can get the correct number of bookmarks.
      </p>
      <form class="form" @submit=${handleSubmitCacheCapacity}>
        <div class="form-group">
          <label>
            <div class="form-group-heading">Cache capacity</div>
            <div class="input-group">
              <input
                class="form-control"
                min="1"
                required
                type="number"
                .value=${cacheCapacity$}
                @change=${handleChangeCacheCapacity}
              >
              <button type="submit" class="button button-outline-positive">
                Save
              </button>
            </div>
          </label>
        </div>
      </form>
      <${component(TrackingUrlPatternForm, { onAdd: onAddTrackingUrlPattern })}>
      <h2 class="display-2">Available patterns</h2>
      <div class="u-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Pattern</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody><${rows}></tbody>
        </table>
      </div>
      <div class="form">
        <button
          class="button button-outline-negative"
          type="button"
          @click=${handleReset}
        >
          Reset all tracking URLs
        </button>
      </div>
    </section>
  `;
}
