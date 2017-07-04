import React from 'react';

import { Category } from 'messaging/types';
import { Nav, NavItem } from 'components/parts/Nav';
import { UNCATEGORIZED } from 'messaging/categories/constants';

interface CategoriesNavProps {
    categories: Category[];
    label: string | symbol;
    onSelectCategory: (label: string) => void;
}

const CategoriesNav: React.SFC<CategoriesNavProps> = ({
    categories,
    label,
    onSelectCategory 
}) => {
    return (
        <Nav onSelect={onSelectCategory}>
            <NavItem
                value={UNCATEGORIZED}
                isSelected={label === UNCATEGORIZED}>
                Uncategorized
            </NavItem>
            {categories.map((category) =>
                <NavItem
                    key={category.categoryId}
                    value={category.label}
                    isSelected={label === category.label}>
                    {category.label}
                </NavItem>
            )}
        </Nav>
    );
}

export default CategoriesNav;
