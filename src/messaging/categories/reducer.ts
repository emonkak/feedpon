import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/distinct';
import '@emonkak/enumerable/extensions/startWith';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/orderBy';

import { Event, Categories } from 'messaging/types';

export default function reducer(categories: Categories, event: Event): Categories {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                isLoading: false,
                items: categories.items,
                version: categories.version
            };

        case 'CATEGORY_CREATING':
            return {
                isLoading: true,
                items: categories.items,
                version: categories.version
            };

        case 'CATEGORY_CREATING_FAILED':
            return {
                isLoading: false,
                items: categories.items,
                version: categories.version
            };

        case 'CATEGORY_CREATED':
            return {
                isLoading: false,
                items: new Enumerable(categories.items)
                    .startWith(event.category)
                    .distinct((category) => category.categoryId)
                    .orderBy((category) => category.label)
                    .toArray(),
                version: categories.version
            };

        case 'CATEGORY_UPDATING':
            return {
                isLoading: categories.isLoading,
                items: categories.items.map((category) => {
                    if (category.categoryId !== event.category.categoryId) {
                        return category;
                    }
                    return {
                        ...category,
                        isLoading: true
                    };
                }),
                version: categories.version
            };

        case 'CATEGORY_UPDATING_FAILED':
            return {
                isLoading: categories.isLoading,
                items: categories.items.map((category) => {
                    if (category.categoryId !== event.category.categoryId) {
                        return category;
                    }
                    return {
                        ...category,
                        isLoading: false
                    };
                }),
                version: categories.version
            };

        case 'CATEGORY_UPDATED':
            return {
                isLoading: categories.isLoading,
                items: new Enumerable(categories.items)
                    .select((category) => {
                        if (category.categoryId !== event.prevCategory.categoryId) {
                            return category;
                        }
                        return event.category;
                    })
                    .distinct((category) => category.categoryId)
                    .orderBy((category) => category.label)
                    .toArray(),
                version: categories.version
            };

        case 'CATEGORY_DELETING':
            return {
                isLoading: categories.isLoading,
                items: categories.items.map((category) => {
                    if (category.categoryId !== event.category.categoryId) {
                        return category;
                    }
                    return {
                        ...category,
                        isLoading: true
                    };
                }),
                version: categories.version
            };

        case 'CATEGORY_DELETING_FAILED':
            return {
                isLoading: categories.isLoading,
                items: categories.items.map((category) => {
                    if (category.categoryId !== event.category.categoryId) {
                        return category;
                    }
                    return {
                        ...category,
                        isLoading: false
                    };
                }),
                version: categories.version
            };

        case 'CATEGORY_DELETED':
            return {
                isLoading: false,
                items: categories.items
                    .filter((category) => category.categoryId !== event.category.categoryId),
                version: categories.version
            };

        case 'SUBSCRIPTIONS_FETCHING':
            return {
                isLoading: true,
                items: categories.items,
                version: categories.version
            };

        case 'SUBSCRIPTIONS_FETCHED':
            return {
                isLoading: false,
                items: event.categories,
                version: categories.version
            };

        default:
            return categories;
    }
}
