import React, { PureComponent } from 'react';

import CleanHtml from 'components/parts/CleanHtml';
import { FullContent } from 'messaging/types';

interface FullContentsProps {
    isLoading: boolean;
    items: FullContent[];
    nextPageUrl: string | null;
    onFetchNext: () => void;
}

export default class FullContents extends PureComponent<FullContentsProps, {}> {
    render() {
        const { isLoading, items, nextPageUrl, onFetchNext } = this.props;

        if (items.length === 0) {
            return (
                <div className="entry-content">
                    <div className="message message-positive">
                        The full content of this entry can not be extracted.
                    </div>
                </div>
            );
        }

        const pages = items.map((fullContent, index) =>
            <section key={index} className="entry-page">
                <header className="entry-page-header">
                    <h2 className="entry-page-title">
                        <a className="link-default" href={fullContent.url} target="_blank">{'Page ' + (index + 1)}</a>
                    </h2>
                </header>
                <CleanHtml
                    baseUrl={fullContent.url}
                    className="entry-page-content"
                    html={fullContent.content} />
            </section>
        );

        let nextPageButton: React.ReactElement<any> | null = null;

        if (nextPageUrl) {
            nextPageButton = isLoading
                ? <button className="button button-block button-outline-positive" disabled={true}><i className="icon icon-20 icon-spinner animation-clockwise-rotation" /></button> 
                : <button className="button button-block button-outline-positive" onClick={onFetchNext}>Next page</button>;
        }

        return (
            <div className="entry-content">
                {pages}
                {nextPageButton}
            </div>
        );
    }
}

