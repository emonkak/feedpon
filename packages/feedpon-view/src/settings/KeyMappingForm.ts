import { createComponent, type RenderContext, Repeat } from 'barebind';
import { LocalAtom } from 'barebind/extras/hooks';
import type { Command, KeyMapping } from 'feedpon-messaging';
import {
  FormControl,
  type FormControlElement,
  type FormValidation,
} from '../primitives/FormControl.ts';

interface KeyMappingFormProps {
  commandTable: { [commandId: string]: Command<any> };
  keyMapping?: KeyMapping | null;
  keyStroke?: string;
  onCancel: () => void;
  onSubmit: (keyStroke: string, keyMapping: KeyMapping) => void;
}

const JSON_VALIDATIONS: FormValidation[] = [
  (element: FormControlElement) => {
    if (!isValidJson(element.value)) {
      return 'Invalid JSON representation.';
    }
    return null;
  },
];

export const KeyMappingForm = createComponent(function KeyMappingForm(
  {
    commandTable,
    keyMapping = null,
    keyStroke = '',
    onCancel,
    onSubmit,
  }: KeyMappingFormProps,
  $: RenderContext,
): unknown {
  const commandId$ = $.use(LocalAtom(keyMapping?.commandId ?? ''));
  const keyStroke$ = $.use(LocalAtom(keyStroke));
  const paramsJson$ = $.use(LocalAtom(toPrettyJson(keyMapping?.params ?? {})));

  const handleChangeCommand = $.useCallback(
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

  const handleChangeKeyStroke = $.useCallback((event: Event) => {
    keyStroke$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleChangeParamsJson = $.useCallback((event: Event) => {
    paramsJson$.value = (event.currentTarget as HTMLTextAreaElement).value;
  }, []);

  const handleSubmit = $.useCallback(
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

  const commandOptions = Repeat({
    source: Object.keys(commandTable),
    keySelector: (key) => key,
    valueSelector: (key) => $.html`
      <option key=${key} value=${key}>
        ${commandTable[key]!.name}
      </option>
    `,
  });

  const selectedCommand = commandTable[commandId$.value];

  return $.html`
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
              ? $.html`<div class="u-text-muted">${selectedCommand.description}</div>`
              : null
          }>
        </label>
      </div>
      <div class="form-group">
        <label>
          <div class="form-group-heading">Command parameters(JSON)</div>
          <${FormControl({
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
});

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
