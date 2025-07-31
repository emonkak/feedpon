import { component, type RenderContext, repeat } from 'barebind';
import { Atom } from 'barebind/extensions/signal';
import type { Command, KeyMapping } from 'feedpon-messaging';

import { FormControl } from '../primitives/FormControl.ts';

interface KeyMappingFormProps {
  commandTable: { [commandId: string]: Command<any> };
  keyMapping?: KeyMapping | null;
  keyStroke?: string;
  onCancel: () => void;
  onSubmit: (keyStroke: string, keyMapping: KeyMapping) => void;
}

const JSON_VALIDATIONS = [
  (element: HTMLTextAreaElement) => {
    if (!isValidJson(element.value)) {
      return 'Invalid JSON representation.';
    }
    return null;
  },
];

export function KeyMappingForm(
  {
    commandTable,
    keyMapping = null,
    keyStroke = '',
    onCancel,
    onSubmit,
  }: KeyMappingFormProps,
  context: RenderContext,
): unknown {
  const commandId$ = context.use(Atom.untracked(keyMapping?.commandId ?? ''));
  const keyStroke$ = context.use(Atom.untracked(keyStroke));
  const paramsJson$ = context.use(
    Atom.untracked(toPrettyJson(keyMapping?.params ?? {})),
  );

  const handleChangeCommand = context.useCallback(
    (event: Event) => {
      const commandId = (event.currentTarget as HTMLSelectElement).value;
      const selectedCommand = commandTable[commandId];

      if (selectedCommand) {
        commandId$.value = commandId;
        paramsJson$.value = toPrettyJson(selectedCommand.defaultParams);
      } else {
        commandId$.value = '';
        paramsJson$.value = toPrettyJson({});
      }
    },
    [commandTable],
  );

  const handleChangeKeyStroke = context.useCallback((event: Event) => {
    keyStroke$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleChangeParamsJson = context.useCallback((event: Event) => {
    paramsJson$.value = (event.currentTarget as HTMLTextAreaElement).value;
  }, []);

  const handleSubmit = context.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();

      onSubmit?.(keyStroke, {
        commandId: commandId$.value,
        params: JSON.parse(paramsJson$.value),
      });

      if (keyMapping === null) {
        commandId$.value = '';
        keyStroke$.value = '';
        paramsJson$.value = '';
      }
    },
    [keyMapping],
  );

  const commandOptions = repeat({
    source: Object.keys(commandTable),
    keySelector: (key) => key,
    valueSelector: (key) => context.html`
      <option key=${key} value=${key}>
        ${commandTable[key]!.name}
      </option>
    `,
  });

  const selectedCommand = commandTable[commandId$.value];

  return context.html`
    <form class="form" @submit=${handleSubmit}>
      <div class="form-legend">${keyMapping !== null ? 'Edit key mapping' : 'New key mapping'}</div>
      <div class="form-group">
        <label>
          <div class="form-group-heading">Key stroke</div>
          <input
            class="form-control"
            required
            $value=${keyStroke$}
            @change=${handleChangeKeyStroke}
          >
        </label>
      </div>
      <div class="form-group">
        <label>
          <div class="form-group-heading">Command</div>
          <select
            class="form-control"
            required
            $value=${commandId$}
            @change=${handleChangeCommand}
          >
            <option value="">Please select a command...</option>
            <${commandOptions}>
          </select>
          <${
            selectedCommand !== undefined
              ? context.html`<div class="u-text-muted">${selectedCommand.description}</div>`
              : null
          }>
        </label>
      </div>
      <div class="form-group">
        <label>
          <div class="form-group-heading">Command parameters(JSON)</div>
          <${component(FormControl<'textarea'>, {
            validations: JSON_VALIDATIONS,
            as: 'textarea',
            ownProps: {
              class: 'form-control',
              required: true,
              rows: '6',
              spellCheck: 'false',
              $value: paramsJson$,
              '@input': handleChangeParamsJson,
            },
          })}>
        </label>
      </div>
      <div class="form-group">
        <div class="button-toolbar">
          <button type="submit" class="button button-outline-positive">
            ${keyMapping !== null ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            class="button button-outline-default"
            @click=${onCancel}
          >
            Cancel
          </button>
      </div>
    </form>
  `;
}

function isValidJson(json: string): boolean {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
}

function toPrettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
