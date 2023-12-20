import React, { useState } from 'react';

import ValidatableControl from '../components/ValidatableControl';
import useEvent from '../hooks/useEvent';

interface TrackingUrlPatternFormProps {
  onAdd: (pattern: string) => void;
}

const patternValidation = {
  message: 'Invalid regular expression.',
  rule: isValidPattern,
};

export default function TrackingUrlPatternForm({
  onAdd,
}: TrackingUrlPatternFormProps) {
  const [pattern, setPattern] = useState('');

  const handleChange = useEvent((event: React.FormEvent<HTMLInputElement>) => {
    const pattern = event.currentTarget.value;

    setPattern(pattern);
  });

  const handleSubmit = useEvent((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onAdd(pattern);

    setPattern('');
  });

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-legend">New tracking URL pattern</div>
      <div className="input-group">
        <ValidatableControl validations={[patternValidation]}>
          <input
            type="text"
            className="form-control"
            placeholder="^https://..."
            value={pattern}
            onChange={handleChange}
            required
          />
        </ValidatableControl>
        <button type="submit" className="button button-outline-positive">
          Add
        </button>
      </div>
      <span className="u-text-muted">
        The regular expression for the tracking url.
      </span>
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
