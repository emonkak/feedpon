import Enumerable from '@emonkak/enumerable';
import React, { PureComponent } from 'react';

import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/orderBy';

import * as Trie from 'feedpon-utils/containers/Trie';
import ConfirmModal from '../components/ConfirmModal';
import KeyMappingForm from '../modules/KeyMappingForm';
import KeyMappingItem from '../modules/KeyMappingItem';
import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { KeyMapping, State } from 'feedpon-messaging';
import {
  commandTable,
  deleteKeyMapping,
  resetKeyMappings,
  updateKeyMapping,
} from 'feedpon-messaging/keyMappings';

interface KeyboardSettingsProps {
  keyMappings: Trie.Trie<KeyMapping>;
  onDeleteKeyMapping: typeof deleteKeyMapping;
  onResetKeyMappings: typeof resetKeyMappings;
  onUpdateKeyMapping: typeof updateKeyMapping;
}

interface KeyboardSettingsState {
  isResetting: boolean;
}

class KeyboardSettings extends PureComponent<
  KeyboardSettingsProps,
  KeyboardSettingsState
> {
  constructor(props: KeyboardSettingsProps) {
    super(props);

    this.state = {
      isResetting: false,
    };

    this.handleCancelResetting = this.handleCancelResetting.bind(this);
    this.handleStartResetting = this.handleStartResetting.bind(this);
  }

  handleCancelResetting() {
    this.setState({
      isResetting: false,
    });
  }

  handleStartResetting() {
    this.setState({
      isResetting: true,
    });
  }

  override render() {
    const {
      keyMappings,
      onDeleteKeyMapping,
      onResetKeyMappings,
      onUpdateKeyMapping,
    } = this.props;
    const { isResetting } = this.state;

    const keyMappingItems = new Enumerable(Trie.toArray(keyMappings))
      .orderBy(([keys]) => keys)
      .select(([keys, keyMapping]) => (
        <KeyMappingItem
          commandTable={commandTable as any}
          key={keys.join('')}
          keyMapping={keyMapping}
          keys={keys}
          onDelete={onDeleteKeyMapping}
          onUpdate={onUpdateKeyMapping}
        />
      ))
      .toArray();

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
            onClick={this.handleStartResetting}
          >
            Reset all key mappings
          </button>
        </div>
        <ConfirmModal
          confirmButtonClassName="button button-negative"
          confirmButtonLabel="Reset"
          isOpened={isResetting}
          message="Are you sure you want to reset all key mappings?"
          onClose={this.handleCancelResetting}
          onConfirm={onResetKeyMappings}
          title="Reset all keymappings"
        />
      </section>
    );
  }
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
