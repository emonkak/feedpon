import React, { PureComponent } from 'react';

import ValidatableControl from 'components/widgets/ValidatableControl';
import { Command, KeyMapping } from 'messaging/types';

interface KeyMappingFormProps {
    commands: { [commandId: string]: Command<any> };
    keyMapping?: KeyMapping;
    keyStroke?: string;
    legend: string;
    onSubmit: (keyStroke: string, keyMapping: KeyMapping) => void;
}

interface KeyMappingFormState {
    commandId: string;
    keyStroke: string;
    paramsJson: string;
    preventNotification: boolean;
}

const jsonValidation = {
    rule: isValidJson,
    message: 'Invalid JSON string.'
};

export default class KeyMappingForm extends PureComponent<KeyMappingFormProps, KeyMappingFormState> {
    constructor(props: KeyMappingFormProps, context: any) {
        super(props, context);

        const { keyMapping, keyStroke } = props;

        if (keyMapping) {
            this.state = {
                commandId: keyMapping.commandId,
                keyStroke: keyStroke || '',
                paramsJson: prettyPrintJson(keyMapping.params || {}),
                preventNotification: !!keyMapping.preventNotification
            };
        } else {
            this.state = {
                commandId: '',
                keyStroke: keyStroke || '',
                paramsJson: prettyPrintJson({}),
                preventNotification: false
            };
        }

        this.handleChangeCommand = this.handleChangeCommand.bind(this);
        this.handleChangeKeyStroke = this.handleChangeKeyStroke.bind(this);
        this.handleChangeParamsJson = this.handleChangeParamsJson.bind(this);
        this.handleChangePreventNotification = this.handleChangePreventNotification.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChangeCommand(event: React.ChangeEvent<HTMLSelectElement>) {
        const { commands } = this.props;
        const commandId = event.currentTarget.value;
        const selectedCommand = commands[commandId];

        if (selectedCommand) {
            this.setState((state) => ({
                keyStroke: state.keyStroke,
                commandId: selectedCommand.commandId,
                paramsJson: prettyPrintJson(selectedCommand.defaultParams || {})
            }));
        } else {
            this.setState((state) => ({
                keyStroke: state.keyStroke,
                commandId: '',
                paramsJson: prettyPrintJson({})
            }));
        }
    }

    handleChangeKeyStroke(event: React.ChangeEvent<HTMLInputElement>) {
        const keyStroke = event.currentTarget.value;

        this.setState((state) => ({
            ...state,
            keyStroke
        }));
    }

    handleChangeParamsJson(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const paramsJson = event.currentTarget.value;

        this.setState((state) => ({
            ...state,
            paramsJson
        }));
    }

    handleChangePreventNotification(event: React.ChangeEvent<HTMLInputElement>) {
        const preventNotification = event.currentTarget.checked;

        this.setState((state) => ({
            ...state,
            preventNotification
        }));
    }

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const { keyMapping, onSubmit } = this.props;
        const { commandId, keyStroke, paramsJson, preventNotification } = this.state;

        onSubmit(keyStroke, {
            commandId,
            params: JSON.parse(paramsJson),
            preventNotification
        });

        if (!keyMapping) {
            this.resetToDefaultState();
        }
    }

    resetToDefaultState() {
        this.setState({
            commandId: '',
            keyStroke: '',
            paramsJson: prettyPrintJson({}),
            preventNotification: false
        });
    }

    render() {
        const { children, commands, legend } = this.props;
        const { commandId, keyStroke, paramsJson, preventNotification } = this.state;

        const selectedCommand = commands[commandId];

        return (
            <form className="form" onSubmit={this.handleSubmit}>
                <div className="form-legend">{legend}</div>
                <div className="form-group">
                    <label>
                        <div className="form-group-heading">Key stroke</div>
                        <input
                            className="form-control"
                            value={keyStroke}
                            onChange={this.handleChangeKeyStroke}
                            required />
                        <div className="u-text-muted">Vim like key notation</div>
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        <div className="form-group-heading">Command</div>
                        <select
                            className="form-control"
                            value={commandId}
                            onChange={this.handleChangeCommand}
                            required>
                            <option value="">&lt;Please select a command&gt;</option>)
                            {Object.keys(commands).map((key) =>
                                <option key={key} value={key}>{commands[key].name}</option>)
                            }
                        </select>
                        {selectedCommand &&
                            <div className="u-text-muted">{selectedCommand.description}</div>}
                    </label>
                </div>
                <div className="form-group">
                    <label>
                        <div className="form-group-heading">Command parameters(JSON)</div>
                        <ValidatableControl
                            component="textarea"
                            validation={jsonValidation}
                            validClassName={null}
                            className="form-control"
                            rows={6}
                            value={paramsJson}
                            onChange={this.handleChangeParamsJson}
                            spellCheck={false}
                            required/>
                    </label>
                </div>
                <div className="form-group">
                    <label className="form-check-label">
                        <input
                            type="checkbox"
                            className="form-check"
                            checked={preventNotification}
                            onChange={this.handleChangePreventNotification} />Prevent notification when invoking command
                    </label>
                </div>
                <div className="form-group">
                    {children}
                </div>
            </form>
        );
    }
}

function isValidJson(json: string): boolean {
    try {
        JSON.parse(json);
        return true;
    } catch (e) {
        return false;
    }
}

function prettyPrintJson(value: any): string {
    return JSON.stringify(value, null, 2);
}
