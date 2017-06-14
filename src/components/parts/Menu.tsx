import React, { Children, PureComponent, cloneElement, isValidElement } from 'react';
import { findDOMNode } from 'react-dom';

import MenuForm from 'components/parts/MenuForm';
import MenuItem from 'components/parts/MenuItem';
import createChainedFunction from 'utils/createChainedFunction';

interface MenuProps {
    children?: React.ReactNode;
    onClose?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onSelect?: (value?: any) => void;
}

export class Menu extends PureComponent<MenuProps, {}> {
    focusPrevious() {
        const { activeIndex, elements } = this.getFocusableElements();

        if (elements.length > 0) {
            const previousIndex = activeIndex > 0 ? activeIndex - 1 : elements.length - 1;
            const previousElement = elements[previousIndex];

            if (previousElement instanceof HTMLElement) {
                previousElement.focus();
            }
        }
    }

    focusNext() {
        const { activeIndex, elements } = this.getFocusableElements();

        if (elements.length > 0) {
            const nextIndex = activeIndex < elements.length - 1 ? activeIndex + 1 : 0;
            const nextElement = elements[nextIndex];

            if (nextElement instanceof HTMLElement) {
                nextElement.focus();
            }
        }
    }

    getFocusableElements() {
        const container = findDOMNode(this);
        const elements = Array.from(container.querySelectorAll('.menu-item:not(.is-disabled)'));

        const { activeElement } = document;
        const activeIndex = elements.findIndex((el) => el.contains(activeElement));

        return { activeIndex, elements };
    }

    renderChild(child: React.ReactChild) {
        if (isValidElement<any>(child)) {
            if (child.type === MenuItem) {
                const { onSelect } = this.props;

                return cloneElement(child, {
                    ...child.props,
                    onSelect: createChainedFunction(
                        child.props.onSelect,
                        onSelect
                    )
                });
            }

            if (child.type === MenuForm) {
                const { onClose } = this.props;

                return cloneElement(child, {
                    ...child.props,
                    onSubmit: createChainedFunction(
                        child.props.onSubmit,
                        onClose
                    )
                });
            }
        }

        return child;
    }

    render() {
        const { children, onKeyDown } = this.props;

        return (
            <div
                className="menu"
                onKeyDown={onKeyDown}>
                {Children.map(children, this.renderChild.bind(this))}
            </div>
        );
    }
}
