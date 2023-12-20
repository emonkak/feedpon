import React, { useState } from 'react';

import ValidatableControl from '../components/ValidatableControl';
import type { Command, KeyMapping } from 'feedpon-messaging';
import useEvent from '../hooks/useEvent';

interface KeyMappingFormProps {
  children: React.ReactNode;
  commandTable: { [commandId: string]: Command<any> };
  keyMapping?: KeyMapping;
  keyStroke?: string;
  legend: string;
  onSubmit: (keyStroke: string, keyMapping: KeyMapping) => void;
}

const JSON_VALIDATIONS = [
  {
    rule: isValidJson,
    message: 'Invalid JSON string.',
  },
];

export default function KeyMappingForm({
  children,
  commandTable,
  keyMapping,
  keyStroke = '',
  legend,
  onSubmit,
}: KeyMappingFormProps) {
  const [commandId, setCommandId] = useState(keyMapping?.commandId ?? '');
  const [editingKeyStroke, setEditingKeyStroke] = useState(keyStroke);
  const [paramsJson, setParamsJson] = useState(
    toJson(keyMapping?.params ?? {}),
  );

  const handleChangeCommand = useEvent(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const commandId = event.currentTarget.value;
      const selectedCommand = commandTable[commandId];

      if (selectedCommand) {
        setCommandId(commandId);
        setParamsJson(toJson(selectedCommand.defaultParams));
      } else {
        setCommandId('');
        setParamsJson(toJson({}));
      }
    },
  );

  const handleChangeKeyStroke = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const keyStroke = event.currentTarget.value;
      setEditingKeyStroke(keyStroke);
    },
  );

  const handleChangeParamsJson = useEvent(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const paramsJson = event.currentTarget.value;
      setParamsJson(paramsJson);
    },
  );

  const handleSubmit = useEvent((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit(editingKeyStroke, {
      commandId,
      params: JSON.parse(paramsJson),
    });

    if (!keyMapping) {
      setCommandId('');
      setEditingKeyStroke('');
      setParamsJson(toJson({}));
    }
  });

  const selectedCommand = commandTable[commandId];

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-legend">{legend}</div>
      <div className="form-group">
        <label>
          <div className="form-group-heading">Key stroke</div>
          <input
            className="form-control"
            value={editingKeyStroke}
            onChange={handleChangeKeyStroke}
            required
          />
          <details>
            <summary className="u-text-muted">Vim like key notation</summary>
            <div className="message message-default">
              <h3>Key name</h3>
              <ul>
                <li>
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key"
                    target="_blank"
                  >
                    <code>event.key</code>
                  </a>{' '}
                  value is used as the key name.
                </li>
                <li>
                  If the key name is two or more characters, enclose it with
                  angle bracket.
                </li>
                <li>
                  An uppercase alphabet represent as a combination with shift
                  key.
                </li>
              </ul>

              <h3>Special keys</h3>
              <p>The following keys require special name.</p>
              <ul>
                <li>
                  <kbd> </kbd>: <code>{`<Space>`}</code>
                </li>
                <li>
                  <kbd>\</kbd>: <code>{`<Bslash>`}</code>
                </li>
                <li>
                  <kbd>|</kbd>: <code>{`<Bar>`}</code>
                </li>
                <li>
                  <kbd>&lt;</kbd>: <code>{`<Lt>`}</code>
                </li>
              </ul>

              <h3>Modifier keys</h3>
              <ul>
                <li>
                  <kbd>Shift</kbd>: <code>{`<S-{key}>`}</code>
                </li>
                <li>
                  <kbd>Control</kbd>: <code>{`<C-{key}>`}</code>
                </li>
                <li>
                  <kbd>Alt</kbd>: <code>{`<A-{key}>`}</code>
                </li>
                <li>
                  <kbd>Meta</kbd>: <code>{`<M-{key}>`}</code>
                </li>
              </ul>

              <h3>Examples</h3>
              <ul>
                <li>
                  <kbd>a</kbd>: <code>{`a`}</code>
                </li>
                <li>
                  <kbd>Shift-A</kbd>: <code>{`A`}</code>
                </li>
                <li>
                  <kbd>Ctrl-A</kbd>: <code>{`<C-a>`}</code>
                </li>
                <li>
                  <kbd>Ctrl-Shift-A</kbd>: <code>{`<C-A>`}</code>
                </li>
                <li>
                  <kbd>Ctrl-Shift-Space</kbd>: <code>{`<C-S-Space>`}</code>
                </li>
              </ul>
            </div>
          </details>
        </label>
      </div>
      <div className="form-group">
        <label>
          <div className="form-group-heading">Command</div>
          <select
            className="form-control"
            value={commandId}
            onChange={handleChangeCommand}
            required
          >
            <option value="">&lt;Please select the command&gt;</option>)
            {Object.keys(commandTable).map((key) => (
              <option key={key} value={key}>
                {commandTable[key]!.name}
              </option>
            ))}
          </select>
          {selectedCommand && (
            <div className="u-text-muted">{selectedCommand.description}</div>
          )}
        </label>
      </div>
      <div className="form-group">
        <label>
          <div className="form-group-heading">Command parameters(JSON)</div>
          <ValidatableControl
            validations={JSON_VALIDATIONS}
            validClassName={null}
          >
            <textarea
              className="form-control"
              rows={6}
              value={paramsJson}
              onChange={handleChangeParamsJson}
              spellCheck={false}
              required
            />
          </ValidatableControl>
        </label>
      </div>
      <div className="form-group">{children}</div>
    </form>
  );
}

function isValidJson(json: string): boolean {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
}

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
