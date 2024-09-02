import React from 'react';

import type { Category } from 'feedpon-messaging';
import { UNCATEGORIZED } from 'feedpon-messaging/categories';
import { Nav, NavItem } from '../components/Nav';

interface CategoriesNavProps {
  categories: Category[];
  label: string | symbol;
  onSelectCategory: (label: string) => void;
}

export default function CategoriesNav({
  categories,
  label,
  onSelectCategory,
}: CategoriesNavProps) {
  return (
    <Nav onSelect={onSelectCategory}>
      <NavItem value={UNCATEGORIZED} isSelected={label === UNCATEGORIZED}>
        Uncategorized
      </NavItem>
      {categories.map((category) => (
        <NavItem
          key={category.categoryId}
          value={category.label}
          isSelected={label === category.label}
        >
          {category.label}
        </NavItem>
      ))}
    </Nav>
  );
}
