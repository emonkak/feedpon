import { createComponent, type RenderContext } from 'barebind';
import { LocalAtom } from 'barebind/extras/hooks';
import { FormControl, type FormValidation } from '../primitives/FormControl.ts';

interface TrackingUrlPatternFormProps {
  onAdd: (pattern: string) => void;
}

const patternValidations: FormValidation[] = [
  (element) =>
    isValidPattern(element.value) ? null : 'Invalid regular expression.',
];

export const TrackingUrlPatternForm = createComponent(
  function TrackingUrlPatternForm(
    { onAdd }: TrackingUrlPatternFormProps,
    $: RenderContext,
  ): unknown {
    const pattern$ = $.use(LocalAtom(''));

    const handleChange = $.useCallback((event: Event) => {
      pattern$.value = (event.currentTarget as HTMLInputElement).value;
    }, []);

    const handleSubmit = $.useCallback(
      (event: Event) => {
        event.preventDefault();
        onAdd(pattern$.value);
        pattern$.value = '';
      },
      [onAdd],
    );

    return $.html`
    <form class="form" @submit=${handleSubmit}>
      <div class="form-legend">New tracking URL pattern</div>
      <div class="input-group">
        <${FormControl({
          as: 'input',
          validations: patternValidations,
          ownProps: {
            class: 'form-control',
            placeholder: '^https://...',
            required: true,
            type: 'text',
            $value: pattern$,
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
  },
);

function isValidPattern(pattern: string): boolean {
  try {
    return !!new RegExp(pattern);
  } catch (_error) {
    return false;
  }
}
