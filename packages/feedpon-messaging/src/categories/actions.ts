import * as feedly from 'feedpon-adapters/feedly';
import type { AsyncThunk, Category } from '../index';
import { getFeedlyToken } from '../backend/actions';

export function createCategory(label: string, callback: (category: Category) => void): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'CATEGORY_CREATING'
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const categoryId = `user/${token.id}/category/${label}`;
            const category = {
                categoryId,
                streamId: categoryId,
                label,
                isLoading: false
            };

            callback(category);

            dispatch({
                type: 'CATEGORY_CREATED',
                category
            });
        } catch (error) {
            dispatch({
                type: 'CATEGORY_CREATING_FAILED'
            });

            throw error;
        }
    };
}

export function deleteCategory(categoryId: string | number, label: string): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'CATEGORY_DELETING',
            categoryId,
            label
        });

        try {
            const token = await dispatch(getFeedlyToken());

            await feedly.deleteCategory(token.access_token, categoryId as string);

            dispatch({
                type: 'CATEGORY_DELETED',
                categoryId,
                label
            });
        } catch (error) {
            dispatch({
                type: 'CATEGORY_DELETING_FAILED',
                categoryId,
                label
            });

            throw error;
        }
    };
}

export function updateCategory(category: Category, newLabel: string): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'CATEGORY_UPDATING',
            categoryId: category.categoryId
        });

        try {
            const token = await dispatch(getFeedlyToken());

            await feedly.changeCategoryLabel(token.access_token, category.streamId, newLabel);

            dispatch({
                type: 'CATEGORY_UPDATED',
                prevCategory: category,
                category: {
                    categoryId: category.categoryId,
                    streamId: category.streamId,
                    label: newLabel,
                    isLoading: false
                }
            });
        } catch (error) {
            dispatch({
                type: 'CATEGORY_UPDATING_FAILED',
                categoryId: category.categoryId
            });

            throw error;
        }
    };
}
