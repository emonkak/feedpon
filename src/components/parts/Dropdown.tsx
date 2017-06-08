import CSSTransitionGroup from 'react-addons-css-transition-group';
import React, { PureComponent, cloneElement } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';

import Closable from 'components/parts/Closable';
import createChainedFunction from 'utils/createChainedFunction';
import getScrollableParent from 'utils/dom/getScrollableParent';
import { Menu } from 'components/parts/Menu';

interface DropdownProps {
    className?: string;
    component?: keyof React.ReactDOM;
    getScrollableParent?: (element: Element) => Element | Window;
    menu: React.ReactElement<any>;
    onClose?: () => void;
    onSelect?: (value?: any) => void;
    pullRight?: boolean;
    pullUp?: boolean;
    toggleButton: React.ReactElement<any>;
}

interface DropdownState {
    isOpened: boolean;
    pullRight: boolean;
    pullUp: boolean;
}

export default class Dropdown extends PureComponent<DropdownProps, DropdownState> {
    static defaultProps = {
        component: 'div',
        getScrollableParent
    };

    private containerElement: Element;

    private scrollable: Element | Window;

    private menu: Menu;

    constructor(props: DropdownProps, context: any) {
        super(props, context);

        this.state = {
            isOpened: false,
            pullRight: false,
            pullUp: false
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    componentDidMount() {
        this.containerElement = findDOMNode(this);
        this.scrollable = this.props.getScrollableParent!(this.containerElement);
    }

    handleClose() {
        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }

        this.closeDropdown();
    }

    handleKeyDown(event: React.KeyboardEvent<any>) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.menu.focusPrevious();
                break;

            case 'ArrowDown':
                event.preventDefault();
                this.menu.focusNext();
                break;

            case 'Escape':
                this.handleClose();
                break;
        }
    }

    handleSelect(value?: any) {
        const { onClose, onSelect } = this.props;

        if (onClose) {
            onClose();
        }

        if (onSelect) {
            onSelect(value);
        }

        this.closeDropdown();
    }

    handleToggle(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { isOpened } = this.state;

        isOpened ? this.closeDropdown() : this.openDropdown();
    }

    openDropdown() {
        const { pullRight, pullUp } = this.props;

        const viewportDimension = this.getViewportDimension();
        const containerRect = this.containerElement.getBoundingClientRect();

        const topSpace = containerRect.top;
        const bottomSpace = viewportDimension.height - containerRect.bottom;
        const leftSpace = containerRect.left;
        const rightSpace = viewportDimension.width - containerRect.right;

        this.setState({
            isOpened: true,
            pullRight: pullRight != null ? pullRight : leftSpace > rightSpace,
            pullUp: pullUp != null ? pullUp : topSpace > bottomSpace
        });
    }

    closeDropdown() {
        this.setState((state) => ({
            isOpened: false,
            pullRight: state.pullRight,
            pullUp: state.pullUp
        }));
    }

    getViewportDimension() {
        let height = 0;
        let width = 0;

        if (this.scrollable instanceof Element) {
            height = this.scrollable.clientHeight;
            width = this.scrollable.clientWidth;
        } else if (this.scrollable instanceof Window) {
            height = this.scrollable.innerHeight;
            width = this.scrollable.innerWidth;
        }

        return { height, width };
    }

    renderToggleButton() {
        const { toggleButton } = this.props;

        return cloneElement(toggleButton, {
            ...toggleButton.props,
            onClick: createChainedFunction(
                toggleButton.props.onClick,
                this.handleToggle
            ),
            onKeyDown: createChainedFunction(
                toggleButton.props.onKeyDown,
                this.handleKeyDown
            )
        });
    }

    renderMenu() {
        const { menu } = this.props;

        const ref = (ref: Menu) => this.menu = ref;

        return cloneElement(menu, {
            ...menu.props,
            ref: createChainedFunction((menu as any).ref, ref),
            onKeyDown: createChainedFunction(
                menu.props.onKeyDown,
                this.handleKeyDown
            ),
            onSelect: createChainedFunction(
                menu.props.onSelect,
                this.handleSelect
            ),
            onClose: createChainedFunction(
                menu.props.onClose,
                this.handleClose
            )
        });
    }

    render() {
        const { className, component } = this.props;
        const { isOpened, pullRight, pullUp } = this.state;

        const Component = component!;

        return (
            <Component className={classnames('dropdown', className)}>
                {this.renderToggleButton()}
                <CSSTransitionGroup
                    component="div"
                    className={classnames('dropdown-menu', {
                        'is-pull-right': pullRight,
                        'is-pull-up': pullUp
                    })}
                    transitionEnterTimeout={200}
                    transitionLeaveTimeout={200}
                    transitionName="menu">
                    {isOpened ? <Closable onClose={this.handleClose}>{this.renderMenu()}</Closable> : null}
                </CSSTransitionGroup>
            </Component>
        );
    }
}
