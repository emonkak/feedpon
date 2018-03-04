import React from 'react';

import CleanHtml from 'components/widgets/CleanHtml';
import { FullContent } from 'messaging/types';

interface FullContentsProps {
    isLoading: boolean;
    isNotFound: boolean;
    items: FullContent[];
    onFetchNext: React.MouseEventHandler<any>;
}

const FullContents: React.SFC<FullContentsProps> = ({
    isLoading,
    isNotFound,
    items,
    onFetchNext
}) => {
    if (items.length === 0) {
        return (
            <div className="entry-content u-clearfix u-text-wrap">
                <div className="message message-positive">
                    This entry could not extract the full content.
                </div>
            </div>
        );
    }

    const pages = items.map((fullContent, index) =>
        <section key={index} className="entry-page">
            {index > 0 &&
                <header className="entry-page-header">
                    <h2 className="entry-page-title">
                        <a className="link-soft" href={fullContent.url} target="_blank">{'Page ' + (index + 1)}</a>
                    </h2>
                </header>}
            <CleanHtml
                baseUrl={fullContent.url}
                className="entry-page-content"
                html={fullContent.content} />
        </section>
    );

    let nextPageButton: React.ReactElement<any> | null = null;

    if (isNotFound) {
        nextPageButton = <div className="message message-positive">The next page cannot be extracted.</div>;
    } else {
        const latestItem = items[items.length - 1];
        if (latestItem && latestItem.nextPageUrl) {
            nextPageButton = isLoading
                ? <button className="button button-block button-outline-positive" disabled={true}><i className="icon icon-20 icon-spinner animation-rotating" /></button>
                : <button className="button button-block button-outline-positive" onClick={onFetchNext}>Next page</button>;
        }
    }

    return (
        <div className="entry-content u-clearfix u-text-wrap">
            {pages}
            {nextPageButton}
        </div>
    );
};

export default FullContents;
