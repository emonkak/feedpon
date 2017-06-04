import React, { cloneElement, Children, PureComponent } from 'react';

import createChainedFunction from 'utils/createChainedFunction';

interface NavProps {
    children?: React.ReactNode;
    value?: any;
    onSelect?: (value: any) => void;
}

export default class Nav extends PureComponent<NavProps, {}> {
    constructor(props: NavProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(value: any) {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(value);
        }
    }

    renderChild(child: React.ReactElement<any>, index: number) {
        const { value } = this.props;

        return cloneElement(child, {
            ...child.props,
            onSelect: createChainedFunction(
                child.props.onSelect,
                this.handleSelect
            ),
            isSelected: value === child.props.value
        });
    }

    render() {
        const { children } = this.props;

        return (
            <div>
                <nav className="nav">
                    {Children.toArray(children).map(this.renderChild, this)}
                </nav>
            </div>
        );
    }
}
