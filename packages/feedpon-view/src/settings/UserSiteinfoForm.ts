import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import type { SiteinfoItem } from 'feedpon-messaging';

import { Atom, component, live } from '@emonkak/ebit/directives.js';
import { FormControl, type FormValidation } from '../primitives/FormControl.ts';

interface UserSiteinfoFormProps {
  item?: SiteinfoItem;
  onSubmit: (item: SiteinfoItem) => void;
}

const PATTERN_VALIDATIONS: FormValidation<'input'>[] = [
  (element) =>
    isValidPattern(element.value) ? null : 'Invalid regular expression.',
];

const XPATH_VALIDATIONS: FormValidation<'input'>[] = [
  (element) =>
    isValidXPath(element.value) ? null : 'Invalid XPath expression.',
];

export function UserSiteinfoForm(
  { item, onSubmit }: UserSiteinfoFormProps,
  context: RenderContext,
): TemplateResult {
  const name$ = context.useMemo(() => new Atom(item?.name ?? ''), []);
  const urlPattern$ = context.useMemo(
    () => new Atom(item?.urlPattern ?? ''),
    [],
  );
  const contentExpression$ = context.useMemo(
    () => new Atom(item?.contentExpression ?? ''),
    [],
  );
  const nextLinkExpression$ = context.useMemo(
    () => new Atom(item?.nextLinkExpression ?? ''),
    [],
  );

  const handleSubmit = context.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();

      onSubmit({
        id: item?.id ?? Date.now(),
        name: name$.value,
        urlPattern: urlPattern$.value,
        contentExpression: contentExpression$.value,
        nextLinkExpression: nextLinkExpression$.value,
      });

      if (item === undefined) {
        name$.value = '';
        urlPattern$.value = '';
        contentExpression$.value = '';
        nextLinkExpression$.value = '';
      }
    },
    [onSubmit, item],
  );

  const handleNameInput = context.useCallback((event: Event) => {
    name$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleUrlPatternInput = context.useCallback((event: Event) => {
    urlPattern$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleContentExpressionInput = context.useCallback((event: Event) => {
    contentExpression$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleNextLinkInput = context.useCallback((event: Event) => {
    nextLinkExpression$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  return context.html`
    <form class="form" @submit=${handleSubmit}>
      <div class="form-legend">${item !== undefined ? 'Edit siteinfo' : 'New siteinfo'}</div>
      <div class="form-group">
        <label>
          <span class="form-group-heading form-required">Name</span>
          <${component(FormControl<'input'>, {
            as: 'input',
            ownProps: {
              class: 'form-control',
              name: 'name',
              required: true,
              type: 'text',
              '.value': name$.map(live),
              '@input': handleNameInput,
            },
          })}>
        </label>
      </div>
      <div class="form-group">
        <label>
          <span class="form-group-heading form-required">URL pattern</span>
          <${component(FormControl<'input'>, {
            as: 'input',
            validations: PATTERN_VALIDATIONS,
            ownProps: {
              class: 'form-control',
              name: 'urlPattern',
              required: true,
              type: 'text',
              '.value': urlPattern$.map(live),
              '@input': handleUrlPatternInput,
            },
          })}>
        </label>
        <span class="u-text-muted">The regular expression for URL.</span>
      </div>
      <div class="form-group">
        <label>
          <span class="form-group-heading form-required">
            Content expression
          </span>
          <${component(FormControl<'input'>, {
            as: 'input',
            validations: PATTERN_VALIDATIONS,
            ownProps: {
              class: 'form-control',
              name: 'contentExpression',
              required: true,
              type: 'text',
              '.value': contentExpression$.map(live),
              '@input': handleContentExpressionInput,
            },
          })}>
        </label>
        <span class="u-text-muted">
          The XPath expression to an element representing the content.
        </span>
      </div>
      <div class="form-group">
        <label>
          <span class="form-group-heading">Next link expression</span>
          <${component(FormControl<'input'>, {
            as: 'input',
            validations: XPATH_VALIDATIONS,
            ownProps: {
              class: 'form-control',
              name: 'nextLinkExpression',
              type: 'text',
              '.value': nextLinkExpression$.map(live),
              '@input': handleNextLinkInput,
            },
          })}>
        </label>
        <span class="u-text-muted">
          The XPath expression to an anchor element representing the next link.
        </span>
      </div>
      <div class="form-group">
        <button class="button button-outline-positive" type="submit">
          ${item !== undefined ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  `;
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
