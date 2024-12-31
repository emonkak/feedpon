import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { Atom, component, keyedList, live } from '@emonkak/ebit/directives.js';
import { bindActions } from 'feedpon-flux';
import type { State } from 'feedpon-messaging';
import {
  addTrackingUrlPattern,
  changeTrakingUrlCacheCapacity,
  deleteTrackingUrlPattern,
  resetTrackingUrlPatterns,
} from 'feedpon-messaging/trackingUrls';

import { getStoreHook } from 'feedpon-flux/ebit';
import { AlertDialog } from '../primitives/AlertDialog';
import { TrackingUrlPatternForm } from './TrackingUrlPatternForm';
import { TrackingUrlPatternRow } from './TrackingUrlPatternRow';

export interface TrackingUrlSettingsProps {}

export function TrackingUrlSettings(
  _props: TrackingUrlSettingsProps,
  context: RenderContext,
): TemplateResult {
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

  const cacheCapacity$ = context.useMemo(
    () => new Atom(initialCacheCapacity),
    [],
  );

  const handleChangeCacheCapacity = context.useCallback((event: Event) => {
    cacheCapacity$.value = (
      event.currentTarget as HTMLInputElement
    ).valueAsNumber;
  }, []);

  const handleReset = context.useCallback(() => {
    AlertDialog.open(
      {
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
      },
      context,
    );
  }, [onResetTrackingUrlPatterns]);

  const handleSubmitCacheCapacity = context.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      onChangeTrakingUrlCacheCapacity(cacheCapacity$.value);
    },
    [],
  );

  const rows = keyedList(
    patterns,
    (pattern) => pattern,
    (pattern) =>
      component(TrackingUrlPatternRow, {
        pattern,
        onDelete: onDeleteTrackingUrlPattern,
      }),
  );

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
                .value=${cacheCapacity$.map(live)}
                @change=${handleChangeCacheCapacity}
              />
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
