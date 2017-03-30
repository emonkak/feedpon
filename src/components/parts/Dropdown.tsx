import React, { PropTypes, PureComponent, cloneElement } from 'react';
import classnames from 'classnames';

import Closable from 'components/parts/Closable';
import Menu from 'components/parts/Menu';
import createChainedFunction from 'supports/createChainedFunction';

interface Props {
    className?: string;
    isOpened?: boolean;
    onClose?: () => void;
    onSelect?: (value: string | number) => void;
    pullRight?: boolean;
    toggleButton: React.ReactElement<any>;
}

interface State {
    isOpened: boolean;
}

export default class Dropdown extends PureComponent<Props, State> {
    static propTypes = {
        className: PropTypes.string,
        isOpened: PropTypes.bool.isRequired,
        onClose: PropTypes.func,
        onSelect: PropTypes.func,
        pullRight: PropTypes.bool,
        toggleButton: PropTypes.element.isRequired
    };

    static defaultProps = {
        isOpened: false
    };

    constructor(props: Props, context: any) {
        super(props, context);

        this.state = {
            isOpened: !!props.isOpened
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.isOpened !== nextProps.isOpened) {
            this.update(nextProps.isOpened);
        }
    }

    handleClose() {
        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }

        this.update(false);
    }

    handleToggle(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isOpened } = this.state;

        this.update(!isOpened);
    }

    update(isOpened: boolean) {
        if (isOpened) {
            document.body.classList.add('dropdown-is-opened');
            document.documentElement.classList.add('dropdown-is-opened');
        } else {
            document.body.classList.remove('dropdown-is-opened');
            document.documentElement.classList.remove('dropdown-is-opened');
        }

        this.setState({ isOpened });
    }

    renderToggleButton() {
        const { toggleButton } = this.props;

        const props = {
            ...toggleButton.props,
            onClick: createChainedFunction(
                toggleButton.props.onClick,
                this.handleToggle.bind(this)
            ),
        };

        return cloneElement(toggleButton, props);
    }

    render() {
        const { children, className, onSelect, pullRight } = this.props;
        const { isOpened } = this.state;

        return (
            <div className={classnames('dropdown', className, {
                'is-opened': isOpened,
                'is-pull-right': pullRight
            })}>
                {this.renderToggleButton()}
                <Closable
                    onClose={this.handleClose.bind(this)}
                    isDisabled={!isOpened}>
                    <Menu onSelect={createChainedFunction(onSelect, this.handleClose.bind(this))}>
                        {children}
                    </Menu>
                </Closable>
            </div>
        );
    }
}
