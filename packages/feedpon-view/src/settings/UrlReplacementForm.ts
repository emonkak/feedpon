import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { Atom, component, live } from '@emonkak/ebit/directives.js';
import type { UrlReplacement } from 'feedpon-messaging';

import { FormControl, type FormValidation } from '../primitives/FormControl.ts';

interface UrlReplacementFormProps {
  item?: UrlReplacement;
  onSubmit: (item: UrlReplacement) => void;
}

const patternValidations: FormValidation<'input'>[] = [
  (element) =>
    isValidPattern(element.value) ? null : 'Invalid regular expression.',
];

export function UrlReplacementForm(
  { item, onSubmit }: UrlReplacementFormProps,
  context: RenderContext,
): TemplateResult {
  const pattern$ = context.useMemo(() => new Atom(item?.pattern ?? ''), []);
  const replacement$ = context.useMemo(
    () => new Atom(item?.replacement ?? ''),
    [],
  );
  const flags$ = context.useMemo(() => new Atom(item?.flags ?? ''), []);

  const handleChangePattern = context.useCallback((event: Event) => {
    pattern$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleChangeReplacement = context.useCallback((event: Event) => {
    replacement$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleChangeFlags = context.useCallback((event: Event) => {
    flags$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleSubmit = context.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();

      onSubmit({
        pattern: pattern$.value,
        replacement: replacement$.value,
        flags: flags$.value,
      });

      if (item === undefined) {
        pattern$.value = '';
        replacement$.value = '';
        flags$.value = '';
      }
    },
    [onSubmit],
  );

  return context.html`
    <form class="form" @submit=${handleSubmit}>
      <div class="form-legend">${item !== undefined ? 'Edit rule' : 'New rule'}</div>
      <div class="form-group">
        <label>
          <span class="form-group-heading form-required">Pattern</span>
          <${component(FormControl<'input'>, {
            as: 'input',
            validations: patternValidations,
            ownProps: {
              class: 'form-control',
              placeholder: 'https://...',
              type: 'text',
              required: true,
              '.value': pattern$.map(live),
              '@input': handleChangePattern,
            },
          })}>
        </label>
      </div>
      <div class="form-group">
        <label>
          <span class="form-group-heading">Replacement</span>
          <input
            class="form-control"
            type="text"
            .value=${replacement$.map(live)}
            @change=${handleChangeReplacement}
          >
        </label>
      </div>
      <div class="form-group">
        <label>
          <span class="form-group-heading">Flags</span>
          <${component(FormControl<'input'>, {
            as: 'input',
            ownProps: {
              class: 'form-control',
              pattern: '^[dgimsuvy]*$',
              type: 'text',
              '.value': flags$.map(live),
              '@input': handleChangeFlags,
            },
          })}>
        </label>
      </div>
      <div class="form-group">
        <button type="submit" class="button button-outline-positive">
          ${item !== undefined ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  `;
}

function isValidPattern(pattern: string): boolean {
  try {
    return !!new RegExp(pattern);
  } catch (_error) {
    return false;
  }
}
