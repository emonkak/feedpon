import { createComponent, type RenderContext } from 'barebind';
import { LocalAtom } from 'barebind/addons/signal';
import type { Category } from 'feedpon-store';

import { openAlertDialog } from '../primitives/AlertDialog.ts';

interface CategoryFormProps {
  category: Category;
  onCategoryDelete: (categoryId: string) => Promise<void>;
  onCategoryUpdate: (
    categoryId: string,
    newLabel: string,
    oldLabel: string,
  ) => Promise<void>;
}

export const CategoryForm = createComponent(function CategoryForm(
  { category, onCategoryDelete, onCategoryUpdate }: CategoryFormProps,
  $: RenderContext,
): unknown {
  const [isLoading, setIsLoading] = $.useState(false);

  const newLabel$ = $.use(LocalAtom(category.label ?? ''));

  const handleDelete = $.useCallback(() => {
    openAlertDialog(
      {
        confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Delete</button>
        `,
        cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
        onConfirm: async () => {
          setIsLoading(true);
          try {
            await onCategoryDelete(category.id);
          } finally {
            setIsLoading(false);
          }
        },
        title: `Delete "${category.label}"`,
        message: 'Are you sure you want to delete this category?',
      },
      $,
    );
  }, [category, onCategoryDelete]);

  const handleUpdate = $.useCallback(() => {
    openAlertDialog(
      {
        confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Delete</button>
        `,
        cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
        onConfirm: async () => {
          setIsLoading(true);
          try {
            await onCategoryUpdate(
              category.id,
              newLabel$.value,
              category.label ?? '',
            );
          } finally {
            setIsLoading(false);
          }
        },
        title: `Rename "${category.label}" to "${newLabel$.value}"`,
        message: 'Are you sure you want to change the label of this category?',
      },
      $,
    );
  }, [category, onCategoryUpdate]);

  const handleChangeLabel = $.useCallback((event: Event) => {
    newLabel$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  return $.html`
    <div class="form">
      <div class="form-legend">Edit Category</div>
      <div class="input-group">
        <input
          class="form-control"
          required
          type="text"
          $value=${newLabel$}
          @input=${handleChangeLabel}
        >
        <button
          type="button"
          class="button button-positive"
          disabled=${
            isLoading ||
            newLabel$.value === '' ||
            newLabel$.value === category.label
          }
          @click=${handleUpdate}
        >
          Update
        </button>
        <button
          class="button button-negative"
          disabled=${isLoading}
          type="button"
          @click=${handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  `;
});
