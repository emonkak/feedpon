import { bindActions } from 'feedpon-flux';
import { useStore } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';
import {
  commandTable,
  deleteKeyMapping,
  resetKeyMappings,
  updateKeyMapping,
} from 'feedpon-messaging/keyMappings';
import * as Trie from 'feedpon-utils/Trie';
import createAscendingComparer from 'feedpon-utils/createAscendingComparer';
import React, { useState } from 'react';

import { ConfirmModal } from '../common/components/ConfirmModal';
import { useEvent } from '../common/hooks/useEvent';
import { KeyMappingForm } from './KeyMappingForm';
import { KeyMappingItem } from './KeyMappingItem';

export interface KeyboardSettingsProps {}

export function KeyboardSettings(_props: KeyboardSettingsProps) {
  const {
    keyMappings,
    onDeleteKeyMapping,
    onResetKeyMappings,
    onUpdateKeyMapping,
  } = useStore({
    mapStateToProps: (state: State) => ({
      keyMappings: state.keyMappings.items,
    }),
    mapDispatchToProps: bindActions({
      onDeleteKeyMapping: deleteKeyMapping,
      onResetKeyMappings: resetKeyMappings,
      onUpdateKeyMapping: updateKeyMapping,
    }),
  });
  const [isResetting, setIsResetting] = useState(false);

  const handleCancelResetting = useEvent(() => {
    setIsResetting(false);
  });

  const handleStartResetting = useEvent(() => {
    setIsResetting(true);
  });

  const keyMappingItems = Trie.toArray(keyMappings)
    .sort(createAscendingComparer(0))
    .map(([keys, keyMapping]) => (
      <KeyMappingItem
        commandTable={commandTable as any}
        key={keys.join('')}
        keyMapping={keyMapping}
        keys={keys}
        onDelete={onDeleteKeyMapping}
        onUpdate={onUpdateKeyMapping}
      />
    ));

  return (
    <section className="section">
      <h1 className="display-1">Key mappings</h1>
      <KeyMappingForm
        commandTable={commandTable as any}
        legend="New key mapping"
        onSubmit={onUpdateKeyMapping}
      >
        <button type="submit" className="button button-outline-positive">
          Add
        </button>
      </KeyMappingForm>
      <div className="u-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Key</th>
              <th>Command</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{keyMappingItems}</tbody>
        </table>
      </div>
      <div className="form">
        <button
          type="button"
          className="button button-outline-negative"
          onClick={handleStartResetting}
        >
          Reset all key mappings
        </button>
      </div>
      <ConfirmModal
        confirmButtonClassName="button button-negative"
        confirmButtonLabel="Reset"
        isOpened={isResetting}
        message="Are you sure you want to reset all key mappings?"
        onClose={handleCancelResetting}
        onConfirm={onResetKeyMappings}
        title="Reset all keymappings"
      />
    </section>
  );
}
