import {
  Literal,
  type RenderContext,
  type TemplateResult,
} from '@emonkak/ebit';
import { classMap, ref } from '@emonkak/ebit/directives.js';

export interface FormControlProps<TTagName extends FormControlElementTagName> {
  as: TTagName;
  validations?: Validation<TTagName>[];
  ownProps?: Record<string, any>;
}

export type FormControlElementTagName = {
  [P in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[P] extends FormControlElement
    ? P
    : never;
}[keyof HTMLElementTagNameMap];

export interface FormControlElement extends HTMLElement {
  readonly validationMessage: string;
  readonly validity: ValidityState;
  readonly willValidate: boolean;
  value: string;
  checkValidity(): boolean;
  reportValidity(): boolean;
  setCustomValidity(error: string): void;
}

export type Validation<TTagName extends FormControlElementTagName> = (
  element: HTMLElementTagNameMap[TTagName],
) => string | null;

type FormControlStatus =
  | { type: 'empty' }
  | { type: 'valid' }
  | { type: 'invalid'; errors: string[] };

const VOID_ELEMENTS = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

export function FormControl<TTagName extends FormControlElementTagName>(
  { as, validations = [], ownProps = {} }: FormControlProps<TTagName>,
  context: RenderContext,
): TemplateResult {
  const [status, setStatus] = context.useState<FormControlStatus>({
    type: 'empty',
  });
  const elementRef = context.useRef<HTMLElementTagNameMap[TTagName] | null>(
    null,
  );

  const runValidations = context.useCallback(() => {
    const element = elementRef.current!;

    if (element.value !== '') {
      const errors = [];
      for (const validation of validations) {
        const error = validation(element);
        if (error !== null) {
          errors.push(error);
        }
      }
      if (errors.length > 0) {
        element.setCustomValidity(errors.join('\n'));
        setStatus({ type: 'invalid', errors });
      } else {
        element.setCustomValidity('');
        setStatus({ type: 'valid' });
      }
    } else {
      element.setCustomValidity('');
      setStatus({ type: 'empty' });
    }
  }, [validations]);

  const handleInput = context.useCallback(() => {
    runValidations();
  }, []);

  context.useEffect(runValidations);

  if (isVoidElement(as)) {
    return context.dynamicHTML`
      <${new Literal(as)}
        ref=${ref(elementRef)}
        class=${classMap({
          'is-valid': status.type === 'valid',
          'is-invalid': status.type === 'invalid',
        })}
        @change=${handleInput}
        ${ownProps}
      >
    `;
  } else {
    return context.dynamicHTML`
      <${new Literal(as)}
        ${ownProps}
        ref=${ref(elementRef)}
        class=${classMap({
          'is-valid': status.type === 'valid',
          'is-invalid': status.type === 'invalid',
        })}
        @input=${handleInput}
      ></${new Literal(as)}
    `;
  }
}

function isVoidElement(tagName: string): boolean {
  return VOID_ELEMENTS.includes(tagName);
}
