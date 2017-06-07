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
                ...categories,
                isLoading: false
            };

        case 'CATEGORY_CREATING':
            return {
                ...categories,
                isLoading: true
            };

        case 'CATEGORY_CREATING_FAILED':
            return {
                ...categories,
                isLoading: false
            };

        case 'CATEGORY_CREATED':
            return {
                ...categories,
                isLoading: false,
                items: new Enumerable(categories.items)
                    .startWith(event.category)
                    .distinct((category) => category.categoryId)
                    .orderBy((category) => category.label)
                    .toArray()
            };

        case 'CATEGORY_UPDATING':
            return {
                ...categories,
                items: categories.items.map((category) => {
                    if (category.categoryId !== event.category.categoryId) {
                        return category;
                    }
                    return {
                        ...category,
                        isLoading: true
                    };
                })
            };

        case 'CATEGORY_UPDATING_FAILED':
            return {
                ...categories,
                items: categories.items.map((category) => {
                    if (category.categoryId !== event.category.categoryId) {
                        return category;
                    }
                    return {
                        ...category,
                        isLoading: false
                    };
                })
            };

        case 'CATEGORY_UPDATED':
            return {
                ...categories,
                items: new Enumerable(categories.items)
                    .select((category) => {
                        if (category.categoryId !== event.prevCategory.categoryId) {
                            return category;
                        }
                        return event.category;
                    })
                    .distinct((category) => category.categoryId)
                    .orderBy((category) => category.label)
                    .toArray()
            };

        case 'CATEGORY_DELETING':
            return {
                ...categories,
                items: categories.items.map((category) => {
                    if (category.categoryId !== event.category.categoryId) {
                        return category;
                    }
                    return {
                        ...category,
                        isLoading: true
                    };
                })
            };

        case 'CATEGORY_DELETING_FAILED':
            return {
                ...categories,
                items: categories.items.map((category) => {
                    if (category.categoryId !== event.category.categoryId) {
                        return category;
                    }
                    return {
                        ...category,
                        isLoading: false
                    };
                })
            };

        case 'CATEGORY_DELETED':
            return {
                ...categories,
                isLoading: false,
                items: categories.items
                    .filter((category) => category.categoryId !== event.category.categoryId)
            };

        case 'SUBSCRIPTIONS_FETCHING':
            return {
                ...categories,
                isLoading: true
            };

        case 'SUBSCRIPTIONS_FETCHED':
            return {
                ...categories,
                isLoading: false,
                items: event.categories
            };

        default:
            return categories;
    }
}
