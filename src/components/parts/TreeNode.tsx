import React, { PureComponent } from 'react';
import classnames from 'classnames';

interface TreeNodeProps {
    className?: string,
    icon?: React.ReactElement<any>,
    onIconClick?: (event: React.SyntheticEvent<any>) => void;
    onTextClick?: (event: React.SyntheticEvent<any>) => void;
    primaryText: string;
    secondaryText?: string;
}

export default class TreeNode extends PureComponent<TreeNodeProps, {}> {
    renderIcon() {
        const { icon, onIconClick } = this.props;

        if (icon == null) {
            return null;
        }

        return (
            <a className="tree-node-icon" href="#" onClick={onIconClick}>{icon}</a>
        );
    }

    renderSecondaryText() {
        const { secondaryText } = this.props;

        if (secondaryText == null) {
            return null;
        }

        return (
            <span className="tree-node-text-secondary">{secondaryText}</span>
        );
    }

    render() {
        const { className, onTextClick, primaryText } = this.props;

        return (
            <div className={classnames('tree-node', className)}>
                {this.renderIcon()}
                <a className="tree-node-label" href="#" onClick={onTextClick}>
                    <span className="tree-node-text-primary">{primaryText}</span>
                    {this.renderSecondaryText()}
                </a>
            </div>
        );
    }
}
