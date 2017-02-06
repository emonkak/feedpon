import * as React from 'react';

export default class TreeHeader extends React.PureComponent<any, any> {
    renderIcon(icon: React.ReactElement<any>, onClick: React.EventHandler<any>) {
        if (icon) {
            return (
                <a className="tree-node-icon" href="#" onClick={onClick}>{icon}</a>
            );
        } else {
            return null;
        }
    }

    render() {
        const { leftIcon, onLeftIconClick, onRightIconClick, rightIcon, title } = this.props;

        return (
            <li>
                <div className="tree-header">
                    {this.renderIcon(leftIcon, onLeftIconClick)}
                    <span className="tree-node-text">{title}</span>
                    {this.renderIcon(rightIcon, onRightIconClick)}
                </div>
            </li>
        );
    }
}
