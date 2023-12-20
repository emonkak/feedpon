import React, { useState } from 'react';

import type { SiteinfoItem } from 'feedpon-messaging';
import ValidatableControl from '../components/ValidatableControl';
import useEvent from '../hooks/useEvent';

interface UserSiteinfoFormProps {
  children?: React.ReactNode;
  item?: SiteinfoItem;
  legend: string;
  onSubmit: (item: SiteinfoItem) => void;
}

const PATTERN_VALIDATIONS = [
  {
    message: 'Invalid regular expression.',
    rule: isValidPattern,
  },
];

const XPATH_VALIDATIONS = [
  {
    message: 'Invalid XPath expression.',
    rule: isValidXPath,
  },
];

export default function UserSiteinfoForm({
  children,
  item,
  legend,
  onSubmit,
}: UserSiteinfoFormProps) {
  const [formData, setFormData] = useState({
    name: item?.name ?? '',
    urlPattern: item?.urlPattern ?? '',
    contentExpression: item?.contentExpression ?? '',
    nextLinkExpression: item?.nextLinkExpression ?? '',
  });

  const handleSubmit = useEvent((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      id: item?.id ?? Date.now(),
      name: formData.name,
      urlPattern: formData.urlPattern,
      contentExpression: formData.contentExpression,
      nextLinkExpression: formData.nextLinkExpression,
    });

    if (!item) {
      setFormData({
        name: '',
        urlPattern: '',
        contentExpression: '',
        nextLinkExpression: '',
      });
    }
  });

  const handleChange = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.currentTarget;

      setFormData((formData) => ({
        ...formData,
        [name]: value,
      }));
    },
  );

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-legend">{legend}</div>
      <div className="form-group">
        <label>
          <span className="form-group-heading form-required">Name</span>
          <ValidatableControl>
            <input
              className="form-control"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </ValidatableControl>
        </label>
      </div>
      <div className="form-group">
        <label>
          <span className="form-group-heading form-required">URL pattern</span>
          <ValidatableControl validations={PATTERN_VALIDATIONS}>
            <input
              className="form-control"
              name="urlPattern"
              onChange={handleChange}
              required
              type="text"
              value={formData.urlPattern}
            />
          </ValidatableControl>
        </label>
        <span className="u-text-muted">
          The regular expression for the url.
        </span>
      </div>
      <div className="form-group">
        <label>
          <span className="form-group-heading form-required">
            Content expression
          </span>
          <ValidatableControl validations={XPATH_VALIDATIONS}>
            <input
              className="form-control"
              name="contentExpression"
              onChange={handleChange}
              required
              type="text"
              value={formData.contentExpression}
            />
          </ValidatableControl>
        </label>
        <span className="u-text-muted">
          The XPath expression to the element representing the content.
        </span>
      </div>
      <div className="form-group">
        <label>
          <span className="form-group-heading">Next link expression</span>
          <ValidatableControl validations={XPATH_VALIDATIONS}>
            <input
              className="form-control"
              name="nextLinkExpression"
              onChange={handleChange}
              type="text"
              value={formData.nextLinkExpression}
            />
          </ValidatableControl>
        </label>
        <span className="u-text-muted">
          The XPath expression to the anchor element representing the next link.
        </span>
      </div>
      <div className="form-group">{children}</div>
    </form>
  );
}

function isValidXPath(expression: string): boolean {
  try {
    const resolver = document.createNSResolver(document);
    return !!document.createExpression(expression, resolver);
  } catch (_error) {
    return false;
  }
}

function isValidPattern(pattern: string): boolean {
  try {
    return !!new RegExp(pattern);
  } catch (_error) {
    return false;
  }
}
