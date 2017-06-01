import React, { cloneElement, Children, PureComponent } from 'react';

import createChainedFunction from 'utils/createChainedFunction';

interface NavProps {
    children?: React.ReactNode;
    value?: string;
    onSelect?: (value: any) => void;
    renderContent: (value: any) => React.ReactNode;
}

interface NavState {
    value: string | null;
}

export default class Nav extends PureComponent<NavProps, NavState> {
    constructor(props: NavProps, context: any) {
        super(props, context);

        this.state = { value: props.value || null };

        this.handleSelect = this.handleSelect.bind(this);
    }

    componentWillReceiveProps(nextProps: NavProps) {
        if (this.props.value !== nextProps.value) {
            this.setState({ value: nextProps.value || null });
        }
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
                <header className="nav-header">
                    <nav className="nav">
                        {Children.toArray(children).map(this.renderChild, this)}
                    </nav>
                </header>
                {renderContent(value)}
            </div>
        );
    }
}
