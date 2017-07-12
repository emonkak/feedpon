import React, { PureComponent } from 'react';

import ConfirmModal from 'components/widgets/ConfirmModal';
import KeyMappingForm from 'components/parts/KeyMappingForm';
import Modal from 'components/widgets/Modal';
import { Command, KeyMapping } from 'messaging/types';

interface KeyMappingItemProps {
    commands: { [commandId: string]: Command<any> };
    keyMapping: KeyMapping;
    keys: string[];
    onDelete: (keyStroke: string) => void;
    onUpdate: (keyStroke: string, keyMapping: KeyMapping) => void;
}

interface KeyMappingItemState {
    isDeleting: boolean;
    isEditing: boolean;
}

export default class KeyMappingItem extends PureComponent<KeyMappingItemProps, KeyMappingItemState> {
    constructor(props: KeyMappingItemProps, context: any) {
        super(props, context);

        this.state = {
            isDeleting: false,
            isEditing: false
        };

        this.handleCancelDeleting = this.handleCancelDeleting.bind(this);
        this.handleCancelEditing = this.handleCancelEditing.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleStartDeleting = this.handleStartDeleting.bind(this);
        this.handleStartEditing = this.handleStartEditing.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    handleCancelDeleting() {
        this.setState((state) => ({
            ...state,
            isDeleting: false
        }));
    }

    handleCancelEditing() {
        this.setState((state) => ({
            ...state,
            isEditing: false
        }));
    }

    handleDelete() {
        const { keys, onDelete } = this.props;

        onDelete(keys.join(''));
    }

    handleStartDeleting() {
        this.setState((state) => ({
            ...state,
            isDeleting: true
        }));
    }

    handleStartEditing() {
        this.setState((state) => ({
            ...state,
            isEditing: true
        }));
    }

    handleUpdate(keyStroke: string, keyMapping: KeyMapping) {
        const { onUpdate } = this.props;

        onUpdate(keyStroke, keyMapping);

        this.setState((state) => ({
            ...state,
            isEditing: false
        }));
    }

    render() {
        const { commands, keys, keyMapping } = this.props;
        const { isDeleting, isEditing } = this.state;

        const command = commands[keyMapping.commandId];
        const commandName = command ? command.name : `<${keyMapping.commandId}>`;

        return (
            <tr key={keys.join('')}>
                <td>{keys.map((key, index) => <kbd key={index}>{key}</kbd>)}</td>
                <td><span>{commandName}</span></td>
                <td className="u-text-nowrap">
                    <div className="button-toolbar">
                        <button
                            className="button button-small button-outline-default"
                            onClick={this.handleStartEditing}>
                            <i className="icon icon-16 icon-edit" />
                        </button>
                        <button
                            className="button button-small button-outline-negative"
                            onClick={this.handleStartDeleting}>
                            <i className="icon icon-16 icon-trash" />
                        </button>
                    </div>
                    <ConfirmModal
                        confirmButtonClassName="button button-negative"
                        confirmButtonLabel="Delete"
                        isOpened={isDeleting}
                        message="Are you sure you want to delete this key mapping?"
                        onClose={this.handleCancelDeleting}
                        onConfirm={this.handleDelete}
                        title={`Delete "${keys.join('')}" mapping`} />
                    <Modal
                        isOpened={isEditing}
                        onClose={this.handleCancelEditing}>
                        <KeyMappingForm
                            keyStroke={keys.join('')}
                            keyMapping={keyMapping}
                            commands={commands}
                            legend="Edit key mapping"
                            onSubmit={this.handleUpdate}>
                            <div className="button-toolbar">
                                <button type="submit" className="button button-outline-positive">Update</button>
                                <button className="button button-outline-default" onClick={this.handleCancelEditing}>Cancel</button>
                            </div>
                        </KeyMappingForm>
                    </Modal>
                </td>
            </tr>
        );
    }
}
