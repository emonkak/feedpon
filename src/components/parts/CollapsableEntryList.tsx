import React, { PropTypes, PureComponent, cloneElement } from 'react';

import Entry from 'components/parts/Entry';
import EntryPlaceholder from 'components/parts/EntryPlaceholder';
import ScrollSpy from 'components/parts/ScrollSpy';
import getScrollable from 'utils/dom/getScrollable';
import { Entry as EntryType } from 'messaging/types';

export default class CollapsableEntryList extends PureComponent<any, any> {
    static propTypes = {
        entries: PropTypes.arrayOf(PropTypes.object),
        loading: PropTypes.bool
    };

    static defaultProps = {
        loading: false
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            collapsedKey: null
        };
    }

    handleCollapse(collapsedKey: any) {
        this.setState(state => ({
            ...state,
            collapsedKey
        }));
    }

    handleClose() {
        this.setState(state => ({
            ...state,
            collapsedKey: null
        }));
    }

    renderActiveChild(child: React.ReactElement<any>) {
        return cloneElement(child, {
            ...child.props,
            active: true
        });
    }

    renderEntry(entry: EntryType) {
        const { collapsedKey } = this.state;
        const collapsed = collapsedKey === entry.entryId;

        return (
            <Entry
                key={entry.entryId}
                closable={collapsed}
                entry={entry}
                expanded={collapsed}
                onClickTitle={!collapsed ? this.handleCollapse.bind(this, entry.entryId) : null}
                onClose={this.handleClose.bind(this)} />
        );
    }

    render() {
        const { entries, loading } = this.props;

        if (loading) {
            return (
                <div className="entry-list">
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                    <EntryPlaceholder expanded={false} />
                </div>
            );
        }

        return (
            <ScrollSpy
                className="entry-list"
                marginTop={48}
                renderActiveChild={this.renderActiveChild.bind(this)}
                getScrollable={getScrollable}>
                {entries.map(this.renderEntry.bind(this))}
            </ScrollSpy>
        );
    }
}
