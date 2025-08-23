import { createComponent, type RenderContext, Repeat } from 'barebind';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { KeyMapping, State } from 'feedpon-messaging';
import {
  commandTable,
  deleteKeyMapping,
  resetKeyMappings,
  updateKeyMapping,
} from 'feedpon-messaging/keyMappings';
import createAscendingComparer from 'feedpon-utils/createAscendingComparer.ts';
import * as Trie from 'feedpon-utils/Trie.ts';

import { openAlertDialog } from '../primitives/AlertDialog.ts';
import { Dialog } from '../primitives/Dialog.ts';
import { KeyMappingForm } from './KeyMappingForm.ts';
import { KeyMappingRow } from './KeyMappingRow.ts';

export interface KeyboardSettingsProps {}

export const KeyboardSettings = createComponent(function KeyboardSettings(
  _props: KeyboardSettingsProps,
  $: RenderContext,
): unknown {
  const {
    keyMappings,
    onDeleteKeyMapping,
    onResetKeyMappings,
    onUpdateKeyMapping,
  } = $.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        keyMappings: state.keyMappings.items,
      }),
      mapDispatchToProps: bindActions({
        onDeleteKeyMapping: deleteKeyMapping,
        onResetKeyMappings: resetKeyMappings,
        onUpdateKeyMapping: updateKeyMapping,
      }),
    }),
  );
  const [isCreating, setIsCreating] = $.useState(false);

  const handleStartCreating = $.useCallback(() => {
    setIsCreating(true);
  }, []);

  const handleEndCreating = $.useCallback(() => {
    setIsCreating(false);
  }, []);

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
          onResetKeyMappings();
        },
        title: 'Reset all keymappings',
        message: 'Are you sure you want to reset all key mappings?',
      },
      $,
    );
  }, []);

  const handleUpdateKeyMapping = $.useCallback(
    (keyStroke: string, mapping: KeyMapping) => {
      onUpdateKeyMapping(keyStroke, mapping);
      setIsCreating(false);
    },
    [],
  );

  const keyMappingRows = Repeat({
    source: Trie.toArray(keyMappings).sort(createAscendingComparer(0)),
    keySelector: ([keys]) => keys.join(''),
    valueSelector: ([keys, keyMapping]) =>
      KeyMappingRow({
        commandTable,
        keyMapping,
        keys,
        onDelete: onDeleteKeyMapping,
        onUpdate: onUpdateKeyMapping,
      }),
  });

  const keyMappingModal = Dialog({
    open: isCreating,
    children: KeyMappingForm({
      commandTable,
      onCancel: handleEndCreating,
      onSubmit: handleUpdateKeyMapping,
    }),
    onClose: handleEndCreating,
  });

  return $.html`
    <section class="section">
      <h1 class="display-1">Key mappings</h1>
      <div class="u-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Key</th>
              <th>Command</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody><${keyMappingRows}></tbody>
        </table>
      </div>
      <div class="form">
        <div class="button-toolbar">
          <button
            type="button"
            class="button button-outline-default"
            @click=${handleStartCreating}
          >
            Create a new key mapping
          </button>
          <button
            type="button"
            class="button button-outline-negative"
            @click=${handleReset}
          >
            Reset all key mappings
          </button>
        </div>
      </div>
      <${keyMappingModal}>
    </section>
  `;
});
