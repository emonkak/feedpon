import React from 'react';
import { Link } from 'react-router';

import { Category } from 'messaging/types';

interface CategoryHeaderProps {
    category: Category;
    numEntries: number;
    numSubscriptions: number;
}

const CategoryHeader: React.SFC<CategoryHeaderProps> = ({
    category,
    numEntries,
    numSubscriptions
}: CategoryHeaderProps) => {
    return (
        <header className="stream-header">
            <div className="container">
                <div className="u-flex u-flex-align-items-center u-flex-justify-content-between">
                    <div className="u-margin-right-2">
                        <div className="list-inline list-inline-dotted">
                            <div className="list-inline-item u-text-muted"><span className="u-text-x-large">{numEntries}</span> entries</div>
                            <div className="list-inline-item u-text-muted"><span className="u-text-x-large">{numSubscriptions}</span> subscriptions</div>
                        </div>
                    </div>
                    <div>
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
    )
};

export default CategoryHeader;
