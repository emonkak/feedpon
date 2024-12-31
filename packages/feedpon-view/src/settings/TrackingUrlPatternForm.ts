import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { Atom, component, live } from '@emonkak/ebit/directives.js';

import { FormControl, type FormValidation } from '../primitives/FormControl';

interface TrackingUrlPatternFormProps {
  onAdd: (pattern: string) => void;
}

const patternValidations: FormValidation<'input'>[] = [
  (element) =>
    isValidPattern(element.value) ? null : 'Invalid regular expression.',
];

export function TrackingUrlPatternForm(
  { onAdd }: TrackingUrlPatternFormProps,
  context: RenderContext,
): TemplateResult {
  const pattern$ = context.useMemo(() => new Atom(''), []);

  const handleChange = context.useCallback((event: Event) => {
    pattern$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleSubmit = context.useCallback(
    (event: Event) => {
      event.preventDefault();
      onAdd(pattern$.value);
      pattern$.value = '';
    },
    [onAdd],
  );

  return context.html`
    <form class="form" @submit=${handleSubmit}>
      <div class="form-legend">New tracking URL pattern</div>
      <div class="input-group">
        <${component(FormControl<'input'>, {
          as: 'input',
          validations: patternValidations,
          ownProps: {
            class: 'form-control',
            placeholder: '^https://...',
            required: true,
            type: 'text',
            '.value': pattern$.map(live),
            '@input': handleChange,
          },
        })}>
        <button type="submit" class="button button-outline-positive">
          Add
        </button>
      </div>
      <span class="u-text-muted">
        A regular expression to match tracking urls.
      </span>
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
