import React, { useState } from 'react';

import ValidatableControl from '../components/ValidatableControl';
import type { UrlReplacement } from 'feedpon-messaging';
import useEvent from '../hooks/useEvent';

interface UrlReplacementFormProps {
  children?: React.ReactNode;
  item?: UrlReplacement;
  legend: string;
  onSubmit: (item: UrlReplacement) => void;
}

const patternValidation = {
  message: 'Invalid regular expression.',
  rule: isValidPattern,
};

export default function UrlReplacementForm({
  children,
  item,
  onSubmit,
  legend,
}: UrlReplacementFormProps) {
  const [pattern, setPattern] = useState(item?.pattern ?? '');
  const [replacement, setReplacement] = useState(item?.replacement ?? '');
  const [flags, setFlags] = useState(item?.flags ?? '');

  const handleChangePattern = useEvent((
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const pattern = event.currentTarget.value;

    setPattern(pattern);
  });

  const handleChangeReplacement = useEvent((
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const replacement = event.currentTarget.value;

    setReplacement(replacement);
  });

  const handleChangeFlags = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const flags = event.currentTarget.value;

      setFlags(flags);
    },
  );

  const handleSubmit = useEvent((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      pattern,
      replacement,
      flags,
    });

    if (!item) {
      setPattern('');
      setReplacement('');
      setFlags('');
    }
  });

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-legend">{legend}</div>
      <div className="form-group">
        <label>
          <span className="form-group-heading form-required">Pattern</span>
          <ValidatableControl validations={[patternValidation]}>
            <input
              type="text"
              className="form-control"
              placeholder="^https://..."
              value={pattern}
              onChange={handleChangePattern}
              required
            />
          </ValidatableControl>
        </label>
      </div>
      <div className="form-group">
        <label>
          <span className="form-group-heading">Replacement</span>
          <ValidatableControl>
            <input
              type="text"
              className="form-control"
              value={replacement}
              onChange={handleChangeReplacement}
            />
          </ValidatableControl>
        </label>
      </div>
      <div className="form-group">
        <label>
          <span className="form-group-heading">Flags</span>
          <ValidatableControl>
            <input
              type="text"
              className="form-control"
              value={flags}
              onChange={handleChangeFlags}
              pattern="^[gimuy]+$"
            />
          </ValidatableControl>
        </label>
      </div>
      <div className="form-group">{children}</div>
    </form>
  );
}

function isValidPattern(pattern: string): boolean {
  try {
    return !!new RegExp(pattern);
  } catch (_error) {
    return false;
  }
}
