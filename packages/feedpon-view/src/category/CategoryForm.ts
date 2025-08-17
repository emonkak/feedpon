import { createComponent, type RenderContext } from 'barebind';
import { LocalAtom } from 'barebind/extras/hooks';
import type { Category } from 'feedpon-messaging';
import { openAlertDialog } from '../primitives/AlertDialog.ts';

interface CategoryFormProps {
  category: Category;
  onCategoryDelete: (categoryId: string | number, label: string) => void;
  onCategoryUpdate: (category: Category, newLabel: string) => void;
}

export const CategoryForm = createComponent(function CategoryForm(
  { category, onCategoryDelete, onCategoryUpdate }: CategoryFormProps,
  $: RenderContext,
): unknown {
  const currentLabel$ = $.use(LocalAtom(category.label));

  const handleDelete = $.useCallback(() => {
    openAlertDialog({
      confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Delete</button>
        `,
      cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
      onConfirm: () => {
        onCategoryDelete(category.categoryId, category.label);
      },
      title: `Delete "${category.label}"`,
      message: 'Are you sure you want to delete this category?',
    });
  }, [category, onCategoryDelete]);

  const handleUpdate = $.useCallback(() => {
    openAlertDialog({
      confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-negative" type="button" @click=${onConfirm}>Delete</button>
        `,
      cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
      onConfirm: () => {
        onCategoryUpdate(category, currentLabel$.value);
      },
      title: `Rename "${category.label}" to "${currentLabel$.value}"`,
      message: 'Are you sure you want to change the label of this category?',
    });
  }, [category, onCategoryUpdate]);

  const handleChangeLabel = $.useCallback((event: Event) => {
    currentLabel$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  return $.html`
    <div class="form">
      <div class="form-legend">Edit Category</div>
      <div class="input-group">
        <input
          class="form-control"
          required
          type="text"
          $value=${currentLabel$}
          @input=${handleChangeLabel}
        >
        <button
          type="button"
          class="button button-positive"
          disabled=${
            category.isLoading ||
            currentLabel$.value === '' ||
            currentLabel$.value === category.label
          }
          @click=${handleUpdate}
        >
          Update
        </button>
        <button
          class="button button-negative"
          disabled=${category.isLoading}
          type="button"
          @click=${handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  `;
});
