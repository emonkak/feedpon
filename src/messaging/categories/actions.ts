import * as feedly from 'adapters/feedly/api';
import { AsyncEvent, Category } from 'messaging/types';
import { getFeedlyToken } from 'messaging/credential/actions';

export function createCategory(label: string, callback: (category: Category) => void): AsyncEvent {
    return async ({ dispatch, getState }) => {
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

export function deleteCategory(category: Category): AsyncEvent {
    return async ({ dispatch, getState }) => {
        dispatch({
            type: 'CATEGORY_DELETING',
            category
        });

        try {
            const token = await dispatch(getFeedlyToken());

            await feedly.deleteCategory(token.access_token, category.categoryId as string);

            dispatch({
                type: 'CATEGORY_DELETED',
                category
            });
        } catch (error) {
            dispatch({
                type: 'CATEGORY_DELETING_FAILED',
                category
            });

            throw error;
        }
    };
}

export function updateCategory(category: Category, label: string): AsyncEvent {
    return async ({ dispatch, getState }) => {
        dispatch({
            type: 'CATEGORY_UPDATING',
            category
        });

        try {
            const token = await dispatch(getFeedlyToken());

            await feedly.changeCategoryLabel(token.access_token, category.categoryId as string, label);

            const categoryId = `user/${token.id}/category/${label}`;

            dispatch({
                type: 'CATEGORY_UPDATED',
                prevCategory: category,
                category: {
                    categoryId,
                    streamId: categoryId,
                    label,
                    isLoading: false
                }
            });
        } catch (error) {
            dispatch({
                type: 'CATEGORY_UPDATING_FAILED',
                category
            });

            throw error;
        }
    };
}
