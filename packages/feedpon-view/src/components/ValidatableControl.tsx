import classnames from 'classnames';
import React, { cloneElement, useEffect, useRef, useState } from 'react';

import useEvent from '../hooks/useEvent';

type ControlElement =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

interface ValidatableControlProps {
  children: React.ReactElement<React.HTMLProps<ControlElement>>;
  invalidClassName?: string | null;
  validClassName?: string | null;
  validations?: Validation[];
}

interface Validation {
  rule: (value: string) => boolean;
  message: string;
}

type ControlStatus = 'empty' | 'valid' | 'invalid';

export default function ValidatableControl({
  children,
  invalidClassName = 'has-error',
  validClassName = 'has-success',
  validations = [],
}: ValidatableControlProps) {
  const controlRef = useRef<ControlElement | null>(null);
  const [status, setStatus] = useState<ControlStatus>('empty');

  const runValidations = () => {
    const control = controlRef.current!;

    if (control.value) {
      let error = '';

      for (const validation of validations) {
        if (!validation.rule(control.value)) {
          error = validation.message;
          break;
        }
      }

      control.setCustomValidity(error);

      setStatus(control.validity.valid ? 'valid' : 'invalid');
    } else {
      control.setCustomValidity('');

      setStatus('empty');
    }
  };

  useEffect(runValidations);

  const handleChange = useEvent(
        (
            event: React.FormEvent<
                HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            >,
        ) => {
            runValidations();
            children.props.onChange?.(event);
        },
    );

  return cloneElement(children, {
    ref: controlRef,
    className: classnames(
      children.props.className,
      invalidClassName && { [invalidClassName]: status === 'invalid' },
      validClassName && { [validClassName]: status === 'valid' },
    ),
    onChange: handleChange,
  });
}
