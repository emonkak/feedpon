import React from 'react';
import { Link } from 'react-router-dom';

import { Category } from 'messaging/types';

interface CategoryHeaderProps {
    category: Category;
    hasMoreEntries: boolean;
    numEntries: number;
}

const CategoryHeader: React.SFC<CategoryHeaderProps> = ({
    category,
    hasMoreEntries,
    numEntries
}: CategoryHeaderProps) => {
    return (
        <header className="stream-header">
            <div className="container">
                <div className="u-flex u-flex-align-items-center u-flex-justify-content-between">
                    <div className="u-margin-right-2 u-flex-grow-1">
                        <div><strong>{category.label}</strong></div>
                        <div className="list-inline list-inline-dotted">
                            <div className="list-inline-item u-text-muted">
                                <span className="u-text-x-large">{numEntries}{hasMoreEntries && '+'}</span> entries
                            </div>
                        </div>

                    </div>
                    <div className="u-flex-shrink-0">
                        <Link
                            className="button button-outline-default"
                            to={`/categories/${category.label}`}
                            title="Organize category...">
                            <i className="icon icon-20 icon-edit" />
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default CategoryHeader;
