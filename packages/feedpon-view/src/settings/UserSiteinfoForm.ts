import { createComponent, type RenderContext } from 'barebind';
import { LocalAtom } from 'barebind/extras/hooks';
import type { SiteinfoItem } from 'feedpon-messaging';
import { FormControl, type FormValidation } from '../primitives/FormControl.ts';

interface UserSiteinfoFormProps {
  item?: SiteinfoItem;
  onSubmit: (item: SiteinfoItem) => void;
}

const PATTERN_VALIDATIONS: FormValidation[] = [
  (element) =>
    isValidPattern(element.value) ? null : 'Invalid regular expression.',
];

const XPATH_VALIDATIONS: FormValidation[] = [
  (element) =>
    isValidXPath(element.value) ? null : 'Invalid XPath expression.',
];

export const UserSiteinfoForm = createComponent(function UserSiteinfoForm(
  { item, onSubmit }: UserSiteinfoFormProps,
  $: RenderContext,
): unknown {
  const name$ = $.use(LocalAtom(item?.name ?? ''));
  const urlPattern$ = $.use(LocalAtom(item?.urlPattern ?? ''));
  const contentExpression$ = $.use(LocalAtom(item?.contentExpression ?? ''));
  const nextLinkExpression$ = $.use(LocalAtom(item?.nextLinkExpression ?? ''));

  const handleSubmit = $.useCallback(
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

  const handleNameInput = $.useCallback((event: Event) => {
    name$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleUrlPatternInput = $.useCallback((event: Event) => {
    urlPattern$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleContentExpressionInput = $.useCallback((event: Event) => {
    contentExpression$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  const handleNextLinkInput = $.useCallback((event: Event) => {
    nextLinkExpression$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  return $.html`
    <form class="form" @submit=${handleSubmit}>
      <div class="form-legend">${item !== undefined ? 'Edit siteinfo' : 'New siteinfo'}</div>
      <div class="form-group">
        <label>
          <span class="form-group-heading form-required">Name</span>
          <${FormControl({
            as: 'input',
            ownProps: {
              class: 'form-control',
              name: 'name',
              required: true,
              type: 'text',
              $value: name$,
              '@input': handleNameInput,
            },
          })}>
        </label>
      </div>
      <div class="form-group">
        <label>
          <span class="form-group-heading form-required">URL pattern</span>
          <${FormControl({
            as: 'input',
            validations: PATTERN_VALIDATIONS,
            ownProps: {
              class: 'form-control',
              name: 'urlPattern',
              required: true,
              type: 'text',
              $value: urlPattern$,
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
          <${FormControl({
            as: 'input',
            validations: PATTERN_VALIDATIONS,
            ownProps: {
              class: 'form-control',
              name: 'contentExpression',
              required: true,
              type: 'text',
              $value: contentExpression$,
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
          <${FormControl({
            as: 'input',
            validations: XPATH_VALIDATIONS,
            ownProps: {
              class: 'form-control',
              name: 'nextLinkExpression',
              type: 'text',
              $value: nextLinkExpression$,
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
});

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
