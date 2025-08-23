import { createComponent, type RenderContext, Repeat } from 'barebind';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { State } from 'feedpon-messaging';
import {
  addUrlReplacement,
  deleteUrlReplacement,
  resetUrlReplacements,
  updateUrlReplacement,
} from 'feedpon-messaging/urlReplacements';

import { openAlertDialog } from '../primitives/AlertDialog.ts';
import { UrlReplacementForm } from './UrlReplacementForm.ts';
import { UrlReplacementRow } from './UrlReplacementRow.ts';

export interface UrlReplacementSettingsProps {}

export const UrlReplacementSettings = createComponent(
  function UrlReplacementSettings(
    {}: UrlReplacementSettingsProps,
    $: RenderContext,
  ): unknown {
    const {
      items,
      onAddUrlReplacement,
      onResetUrlReplacements,
      onDeleteUrlReplacement,
      onUpdateUrlReplacement,
    } = $.use(
      getStoreHook({
        mapStateToProps: (state: State) => ({
          items: state.urlReplacements.items,
        }),
        mapDispatchToProps: bindActions({
          onAddUrlReplacement: addUrlReplacement,
          onDeleteUrlReplacement: deleteUrlReplacement,
          onResetUrlReplacements: resetUrlReplacements,
          onUpdateUrlReplacement: updateUrlReplacement,
        }),
      }),
    );

    const handleReset = $.useCallback(() => {
      openAlertDialog(
        {
          confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Reset</button>
        `,
          cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
          onConfirm: () => {
            onResetUrlReplacements();
          },
          title: 'Reset all tracking URLs',
          message: 'Are you sure you want to reset all tracking URLs?',
        },
        $,
      );
    }, []);

    const rows = Repeat({
      source: items,
      valueSelector: (item, index) =>
        UrlReplacementRow({
          index,
          item,
          onDelete: onDeleteUrlReplacement,
          onUpdate: onUpdateUrlReplacement,
        }),
    });

    return $.html`
    <section class="section">
      <h1 class="display-1">URL Replacement</h1>
      <p>
        These rules replace matched entry URLs. If there are multiple matchs in
        rules, them are applied to all. Thereby you can get the correct number
        of bookmarks.
      </p>
      <${UrlReplacementForm({
        onSubmit: onAddUrlReplacement,
      })}>
      <h2 class="display-2">Current rules</h2>
      <div class="u-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Pattern</th>
              <th>Replacement</th>
              <th>Flags</th>
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
          Reset all URL replacement rules
        </button>
      </div>
    </section>
  `;
  },
);
