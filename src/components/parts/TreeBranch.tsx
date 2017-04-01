import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

import TreeNode from 'components/parts/TreeNode';

interface Props {
    children?: React.ReactNode;
    className?: string;
    isExpanded?: boolean;
    isSelected?: boolean;
    onExpand?: (isExpanded: boolean) => void;
    onSelect?: () => void;
    primaryText: string;
    secondaryText?: string;
    value: string | number;
};

interface State {
    isExpanded: boolean;
};

export default class TreeBranch extends PureComponent<Props, State> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        className: PropTypes.string,
        isExpanded: PropTypes.bool,
        isSelected: PropTypes.bool,
        onExpand: PropTypes.func,
        onSelect: PropTypes.func,
        primaryText: PropTypes.string.isRequired,
        secondaryText: PropTypes.string,
        value: PropTypes.any.isRequired,
    };

    static defaultProps = {
        isExpanded: false,
    }

    constructor(props: Props, context: any) {
        super(props, context);

        this.state = {
            isExpanded: !!props.isExpanded,
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.props.isExpanded !== nextProps.isExpanded) {
            this.setState(state => ({
                ...state,
                isExpanded: nextProps.isExpanded || state.isExpanded,
            }));
        }
    }

    handleExpand(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onExpand } = this.props;
        const { isExpanded } = this.state;

        if (onExpand) {
            onExpand(!isExpanded);
        }

        this.setState({
            isExpanded: !isExpanded,
        });
    }

    handleSelect(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isSelected, onSelect } = this.props;

        if (!isSelected && onSelect) {
            onSelect();
        }
    }

    renderIcon() {
        const { isExpanded } = this.state;

        if (isExpanded) {
            return (
                <i className="icon icon-16 icon-angle-down" />
            );
        } else {
            return (
                <i className="icon icon-16 icon-angle-right" />
            );
        }
    }

    render() {
        const { children, className, isSelected, primaryText, secondaryText } = this.props;
        const { isExpanded } = this.state;

        return (
            <li>
                <TreeNode className={classnames({ 'is-selected': isSelected, 'is-expanded': isExpanded }, className)}
                          icon={this.renderIcon()}
                          primaryText={primaryText}
                          secondaryText={secondaryText}
                          onIconClick={this.handleExpand.bind(this)}
                          onTextClick={this.handleSelect.bind(this)} />
                <ul className="tree">{children}</ul>
            </li>
        );
    }
}
