import Enumerable from '@emonkak/enumerable';
import React, { PureComponent } from 'react';

import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/orderBy';

import * as Trie from 'utils/containers/Trie';
import * as commands from 'messaging/keyMappings/commands';
import ConfirmModal from 'components/widgets/ConfirmModal';
import KeyMappingForm from 'components/parts/KeyMappingForm';
import KeyMappingItem from 'components/parts/KeyMappingItem';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { KeyMapping, State } from 'messaging/types';
import { deleteKeyMapping, resetKeyMappings, updateKeyMapping } from 'messaging/keyMappings/actions';

interface KeyboardSettingsProps {
    keyMappings: Trie.Trie<KeyMapping>;
    onDeleteKeyMapping: typeof deleteKeyMapping;
    onResetKeyMappings: typeof resetKeyMappings;
    onUpdateKeyMapping: typeof updateKeyMapping;
}

interface KeyboardSettingsState {
    isResetting: boolean;
}

class KeyboardSettings extends PureComponent<KeyboardSettingsProps, KeyboardSettingsState> {
    constructor(props: KeyboardSettingsProps, context: any) {
        super(props, context);

        this.state = {
            isResetting: false
        };

        this.handleCancelResetting = this.handleCancelResetting.bind(this);
        this.handleStartResetting = this.handleStartResetting.bind(this);
    }

    handleCancelResetting() {
        this.setState({
            isResetting: false
        });
    }

    handleStartResetting() {
        this.setState({
            isResetting: true
        });
    }

    render() {
        const { keyMappings, onDeleteKeyMapping, onResetKeyMappings, onUpdateKeyMapping } = this.props;
        const { isResetting } = this.state;

        const keyMappingItems = new Enumerable(Trie.iterate(keyMappings))
            .orderBy(([keys]) => keys)
            .select(([keys, keyMapping]) =>
                <KeyMappingItem
                    commands={commands as any}
                    key={keys.join('')}
                    keyMapping={keyMapping}
                    keys={keys}
                    onDelete={onDeleteKeyMapping}
                    onUpdate={onUpdateKeyMapping} />
            )
            .toArray();

        return (
            <section className="section">
                <h1 className="display-1">Key mappings</h1>
                <KeyMappingForm
                    commands={commands as any}
                    legend="New key mapping"
                    onSubmit={onUpdateKeyMapping}>
                    <button type="submit" className="button button-outline-positive">Add</button>
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
                        <tbody>
                            {keyMappingItems}
                        </tbody>
                    </table>
                </div>
                <div className="form">
                    <button
                        className="button button-outline-negative"
                        onClick={this.handleStartResetting}>
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
                    title="Reset all keymappings" />
            </section>
        );
    }
}

export default connect(() => {
    return {
        mapStateToProps: (state: State) => ({
            keyMappings: state.keyMappings.items
        }),
        mapDispatchToProps: bindActions({
            onDeleteKeyMapping: deleteKeyMapping,
            onResetKeyMappings: resetKeyMappings,
            onUpdateKeyMapping: updateKeyMapping
        })
    };
})(KeyboardSettings);
