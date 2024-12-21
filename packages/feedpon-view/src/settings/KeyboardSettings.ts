import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit';
import type { KeyMapping, State } from 'feedpon-messaging';
import {
  commandTable,
  deleteKeyMapping,
  resetKeyMappings,
  updateKeyMapping,
} from 'feedpon-messaging/keyMappings';
import * as Trie from 'feedpon-utils/Trie';
import createAscendingComparer from 'feedpon-utils/createAscendingComparer';

import { component, keyedList } from '@emonkak/ebit/directives.js';
import { AlertDialog } from '../primitives/AlertDialog';
import { Dialog } from '../primitives/Dialog';
import { KeyMappingForm } from './KeyMappingForm';
import { KeyMappingRow } from './KeyMappingRow';

export interface KeyboardSettingsProps {}

export function KeyboardSettings(
  _props: KeyboardSettingsProps,
  context: RenderContext,
): TemplateResult {
  const {
    keyMappings,
    onDeleteKeyMapping,
    onResetKeyMappings,
    onUpdateKeyMapping,
  } = context.use(
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
  const [isCreating, setIsCreating] = context.useState(false);

  const handleStartCreating = context.useCallback(() => {
    setIsCreating(true);
  }, []);

  const handleEndCreating = context.useCallback(() => {
    setIsCreating(false);
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
          onResetKeyMappings();
        },
        title: 'Reset all keymappings',
        message: 'Are you sure you want to reset all key mappings?',
      },
      context,
    );
  }, []);

  const handleUpdateKeyMapping = context.useCallback(
    (keyStroke: string, mapping: KeyMapping) => {
      onUpdateKeyMapping(keyStroke, mapping);
      setIsCreating(false);
    },
    [],
  );

  const keyMappingRows = keyedList(
    Trie.toArray(keyMappings).sort(createAscendingComparer(0)),
    ([keys]) => keys.join(''),
    ([keys, keyMapping]) =>
      component(KeyMappingRow, {
        commandTable,
        keyMapping,
        keys,
        onDelete: onDeleteKeyMapping,
        onUpdate: onUpdateKeyMapping,
      }),
  );

  const keyMappingModal = component(Dialog, {
    open: isCreating,
    children: context.html`
      <${component(KeyMappingForm, {
        commandTable,
        onCancel: handleEndCreating,
        onSubmit: handleUpdateKeyMapping,
      })}>
    `,
    onClose: handleEndCreating,
  });

  return context.html`
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
}
