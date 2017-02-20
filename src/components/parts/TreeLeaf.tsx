import * as React from 'react';
import * as classnames from 'classnames';

import TreeNode from 'components/parts/TreeNode';

export default class TreeLeaf extends React.PureComponent<any, any> {
    static propTypes = {
        className: React.PropTypes.string,
        icon: React.PropTypes.element,
        onSelect: React.PropTypes.func,
        primaryText: React.PropTypes.string.isRequired,
        secondaryText: React.PropTypes.string,
        selected: React.PropTypes.bool,
    };

    static defaultProps = {
        selected: false,
    }

    constructor(props: any) {
        super(props);

        this.state = {
            selected: props.selected,
            expanded: props.expanded,
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.selected !== nextProps.selected) {
            this.setState(state => ({ ...state, selected: nextProps.selected }));
        }
    }

    handleSelect(event: any) {
        event.preventDefault();

        const { selected } = this.state;
        if (selected) {
            return;
        }

        const { onSelect } = this.props;
        if (onSelect) {
            onSelect(event);
        }

        this.setState(state => ({ ...state, selected: true }));
    }

    render() {
        const { className, icon, primaryText, secondaryText } = this.props;
        const { selected } = this.state;

        return (
            <li>
                <TreeNode className={classnames({ 'is-selected': selected }, className)}
                          icon={icon}
                          primaryText={primaryText}
                          secondaryText={secondaryText}
                          onIconClick={this.handleSelect.bind(this)}
                          onTextClick={this.handleSelect.bind(this)} />
            </li>
        );
    }
}
