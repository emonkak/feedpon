import { createComponent, html, Partial } from 'barebind';

export interface FormControlProps {
  as: FormControlElementTagName;
  validations?: FormValidation[];
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

export type FormValidation = (element: FormControlElement) => string | null;

enum FormControlStatus {
  Empty,
  Valid,
  Invalid,
}

export const FormControl = createComponent<FormControlProps>(
  function FormControl({ as, validations = [] }) {
    const [status, setStatus] = this.useState(FormControlStatus.Empty);
    const elementRef = this.useRef<FormControlElement | null>(null);

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

    const handleInput = this.useCallback(() => {
      runValidations();
    }, [validations]);

    this.useEffect(() => {
      runValidations();
    });

    if (as.toLowerCase() === 'input') {
      return Partial.html`
        <${Partial.literal(as)}
          class=${{
            'is-valid': status === FormControlStatus.Valid,
            'is-invalid': status === FormControlStatus.Invalid,
          }}
          @change=${handleInput}
          ${elementRef}
        >
      `;
    } else {
      return html`
        <${Partial.literal(as)}
          class=${{
            'is-valid': status === FormControlStatus.Valid,
            'is-invalid': status === FormControlStatus.Invalid,
          }}
          @input=${handleInput}
          ${elementRef}
        ></${Partial.literal(as)}>
      `;
    }
  },
);
