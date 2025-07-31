import { Literal, type RenderContext } from 'barebind';

export interface FormControlProps<TTagName extends FormControlElementTagName> {
  as: TTagName;
  validations?: FormValidation<TTagName>[];
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

export type FormValidation<TTagName extends FormControlElementTagName> = (
  element: HTMLElementTagNameMap[TTagName],
) => string | null;

enum FormControlStatus {
  Empty,
  Valid,
  Invalid,
}

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
): unknown {
  const [status, setStatus] = context.useState(FormControlStatus.Empty);
  const elementRef = context.useRef<HTMLElementTagNameMap[TTagName] | null>(
    null,
  );

  const runValidations = () => {
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
        setStatus(FormControlStatus.Invalid);
      } else {
        setStatus(FormControlStatus.Valid);
      }
    } else {
      element.setCustomValidity('');
      setStatus(FormControlStatus.Empty);
    }
  };

  const handleInput = context.useCallback(() => {
    runValidations();
  }, [validations]);

  context.useEffect(() => {
    runValidations();
  });

  if (isVoidElement(as)) {
    return context.dynamicHTML`
      <${new Literal(as)}
        :ref=${elementRef}
        :classlist=${[
          {
            'is-valid': status === FormControlStatus.Valid,
            'is-invalid': status === FormControlStatus.Invalid,
          },
        ]}
        @change=${handleInput}
        ${ownProps}
      >
    `;
  } else {
    return context.dynamicHTML`
      <${new Literal(as)}
        ${ownProps}
        :ref=${elementRef}
        :classlist=${[
          {
            'is-valid': status === FormControlStatus.Valid,
            'is-invalid': status === FormControlStatus.Invalid,
          },
        ]}
        @input=${handleInput}
      ></${new Literal(as)}
    `;
  }
}

function isVoidElement(tagName: string): boolean {
  return VOID_ELEMENTS.includes(tagName);
}
