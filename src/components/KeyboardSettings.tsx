import Enumerable from '@emonkak/enumerable';
import React, { PureComponent } from 'react';

import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/orderBy';

import * as Trie from 'utils/containers/Trie';
import * as commands from 'messaging/keyMappings/commands';
import KeyMappingForm from 'components/parts/KeyMappingForm';
import KeyMappingItem from 'components/parts/KeyMappingItem';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { KeyMapping, State } from 'messaging/types';
import { deleteKeyMapping, updateKeyMapping } from 'messaging/keyMappings/actions';

interface KeyboardSettingsProps {
    keyMappings: Trie.Trie<KeyMapping>;
    onDeleteKeyMapping: typeof deleteKeyMapping;
    onUpdateKeyMapping: typeof updateKeyMapping;
}

class KeyboardSettings extends PureComponent<KeyboardSettingsProps, {}> {
    render() {
        const { keyMappings, onDeleteKeyMapping, onUpdateKeyMapping } = this.props;

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
            onUpdateKeyMapping: updateKeyMapping
        })
    };
})(KeyboardSettings);
