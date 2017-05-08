import React, { cloneElement, Children, PureComponent } from 'react';

import createChainedFunction from 'utils/createChainedFunction';

interface NavProps {
    children?: React.ReactNode;
    initialValue?: any;
    onSelect?: (value: any) => void;
    renderContent: (value: any) => React.ReactChild;
}

interface NavState {
    value: any;
}

export default class Nav extends PureComponent<NavProps, NavState> {
    constructor(props: NavProps, context: any) {
        super(props, context);

        this.state = { value: props.initialValue };

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(value: any) {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(value);
        }

        this.setState({ value });
    }

    renderChild(child: React.ReactElement<any>, index: number) {
        const { value } = this.state;

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
        const { children, renderContent } = this.props;
        const { value } = this.state;

        return (
            <div>
                <header className="u-text-center">
                    <nav className="nav">
                        {Children.map(children, this.renderChild.bind(this))}
                    </nav>
                </header>
                {renderContent(value)}
            </div>
        );
    }
}
