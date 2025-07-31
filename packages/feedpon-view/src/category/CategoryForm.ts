import type { RenderContext } from 'barebind';
import { Atom } from 'barebind/extensions/signal';
import type { Category } from 'feedpon-messaging';

import { AlertDialog } from '../primitives/AlertDialog.ts';

interface CategoryFormProps {
  category: Category;
  onCategoryDelete: (categoryId: string | number, label: string) => void;
  onCategoryUpdate: (category: Category, newLabel: string) => void;
}

export function CategoryForm(
  { category, onCategoryDelete, onCategoryUpdate }: CategoryFormProps,
  context: RenderContext,
): unknown {
  const currentLabel$ = context.use(Atom.untracked(category.label));

  context.use(currentLabel$);

  const handleDelete = context.useCallback(() => {
    AlertDialog.open({
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

  const handleUpdate = context.useCallback(() => {
    AlertDialog.open({
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

  const handleChangeLabel = context.useCallback((event: Event) => {
    currentLabel$.value = (event.currentTarget as HTMLInputElement).value;
  }, []);

  return context.html`
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
}
