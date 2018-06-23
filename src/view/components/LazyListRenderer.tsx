import React, { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

interface LazyListRendererProps {
    blankSpaceAbove: number;
    blankSpaceBelow: number;
    getHeightForDomNode: (element: HTMLElement) => number;
    idAttribute: string;
    items: any[];
    renderItem: (item: any, index: number, ref: React.Ref<React.ReactInstance>) => React.ReactElement<any>;
    renderList: (items: React.ReactElement<any>[], blankSpaceAbove: number, blankSpaceBelow: number) => React.ReactElement<any>;
    sliceEnd: number;
    sliceStart: number;
}

export default class LazyListRenderer extends PureComponent<LazyListRendererProps> {
    private readonly _refs: { [id: string]: React.ReactInstance } = {};

    private readonly _refFunctions: { [id: string]: React.Ref<React.ReactInstance> } = {};

    getItemHeights(): { [id: string]: number } {
        const { getHeightForDomNode } = this.props;

        return Object.keys(this._refs).reduce<{ [id: string]: number }>((acc, id) => {
            const ref = this._refs[id];
            const element = findDOMNode(ref) as HTMLElement;
            acc[id] = getHeightForDomNode(element);
            return acc;
        }, {});
    }

    render() {
        const { renderList, blankSpaceAbove, blankSpaceBelow } = this.props;

        return renderList(this._renderItems(), blankSpaceAbove, blankSpaceBelow);
    }

    private _renderItems(): React.ReactElement<any>[] {
        const { idAttribute, items, renderItem, sliceEnd, sliceStart } = this.props;

        const elements: React.ReactElement<any>[] = [];

        for (let i = sliceStart; i < sliceEnd; i++) {
            const item = items[i];
            const id = item[idAttribute];

            let ref: React.Ref<React.ReactInstance>;

            if (this._refFunctions[id] != null) {
                ref = this._refFunctions[id]!;
            } else {
                ref = this._refFunctions[id] = (instance: React.ReactInstance) => {
                    if (instance) {
                        this._refs[id] = instance;
                    } else {
                        delete this._refs[id];
                        delete this._refFunctions[id];
                    }
                };
            }

            const element = renderItem(item, i, ref);

            elements.push(element);
        }

        return elements;
    }
}
