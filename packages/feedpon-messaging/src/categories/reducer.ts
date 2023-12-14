import filterObject from 'feedpon-utils/filterObject';
import mapObject from 'feedpon-utils/mapObject';

import type { Categories, Category, Event } from '../index';

export default function reducer(
  categories: Categories,
  event: Event,
): Categories {
  switch (event.type) {
    case 'APPLICATION_INITIALIZED':
      return {
        ...categories,
        isLoading: false,
        items: mapObject(categories.items, (category) => {
          if (!category.isLoading) {
            return category;
          }
          return {
            ...category,
            isLoading: false,
          };
        }),
      };

    case 'CATEGORY_CREATING':
      return {
        ...categories,
        isLoading: true,
      };

    case 'CATEGORY_CREATING_FAILED':
      return {
        ...categories,
        isLoading: false,
      };

    case 'CATEGORY_CREATED':
      return {
        ...categories,
        isLoading: false,
        items: {
          ...categories.items,
          [event.category.streamId]: event.category,
        },
      };

    case 'CATEGORY_UPDATING':
      return {
        ...categories,
        items: mapObject(categories.items, (category) => {
          if (category.categoryId !== event.categoryId) {
            return category;
          }
          return {
            ...category,
            isLoading: true,
          };
        }),
      };

    case 'CATEGORY_UPDATING_FAILED':
      return {
        ...categories,
        items: mapObject(categories.items, (category) => {
          if (category.categoryId !== event.categoryId) {
            return category;
          }
          return {
            ...category,
            isLoading: false,
          };
        }),
      };

    case 'CATEGORY_UPDATED':
      return {
        ...categories,
        isLoading: false,
        items: {
          ...categories.items,
          [event.category.categoryId]: event.category,
        },
      };

    case 'CATEGORY_DELETING':
      return {
        ...categories,
        items: mapObject(categories.items, (category) => {
          if (category.categoryId !== event.categoryId) {
            return category;
          }
          return {
            ...category,
            isLoading: true,
          };
        }),
      };

    case 'CATEGORY_DELETING_FAILED':
      return {
        ...categories,
        items: mapObject(categories.items, (category) => {
          if (category.categoryId !== event.categoryId) {
            return category;
          }
          return {
            ...category,
            isLoading: false,
          };
        }),
      };

    case 'CATEGORY_DELETED':
      return {
        ...categories,
        isLoading: false,
        items: filterObject(
          categories.items,
          (category) => category.categoryId !== event.categoryId,
        ),
      };

    case 'SUBSCRIPTIONS_FETCHING':
      return {
        ...categories,
        isLoading: true,
      };

    case 'SUBSCRIPTIONS_FETCHED':
      return {
        ...categories,
        isLoading: false,
        items: event.categories.reduce<{ [key: string]: Category }>(
          (acc, category) => {
            acc[category.streamId] = category;
            return acc;
          },
          {},
        ),
        lastUpdatedAt: event.fetchedAt,
      };

    default:
      return categories;
  }
}
