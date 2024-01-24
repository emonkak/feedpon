import React, { useState } from 'react';

import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import createAscendingComparer from 'feedpon-utils/createAscendingComparer';
import type { KeyMapping, State } from 'feedpon-messaging';
import {
  commandTable,
  deleteKeyMapping,
  resetKeyMappings,
  updateKeyMapping,
} from 'feedpon-messaging/keyMappings';
import * as Trie from 'feedpon-utils/Trie';
import ConfirmModal from '../components/ConfirmModal';
import KeyMappingForm from '../modules/KeyMappingForm';
import KeyMappingItem from '../modules/KeyMappingItem';
import useEvent from '../hooks/useEvent';

interface KeyboardSettingsProps {
  keyMappings: Trie.Trie<KeyMapping>;
  onDeleteKeyMapping: typeof deleteKeyMapping;
  onResetKeyMappings: typeof resetKeyMappings;
  onUpdateKeyMapping: typeof updateKeyMapping;
}

function KeyboardSettings({
  keyMappings,
  onDeleteKeyMapping,
  onResetKeyMappings,
  onUpdateKeyMapping,
}: KeyboardSettingsProps) {
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

export default connect(() => {
  return {
    mapStateToProps: (state: State) => ({
      keyMappings: state.keyMappings.items,
    }),
    mapDispatchToProps: bindActions({
      onDeleteKeyMapping: deleteKeyMapping,
      onResetKeyMappings: resetKeyMappings,
      onUpdateKeyMapping: updateKeyMapping,
    }),
  };
})(KeyboardSettings);
