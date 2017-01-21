import * as React from 'react';
import * as classnames from 'classnames';

export default class TreeNode extends React.PureComponent<any, any> {
    static propTypes = {
        className: React.PropTypes.string,
        icon: React.PropTypes.element,
        onIconClick: React.PropTypes.func,
        onTextClick: React.PropTypes.func,
        primaryText: React.PropTypes.string.isRequired,
        secondaryText: React.PropTypes.string,
    };

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
                <a className="tree-node-text" href="#" onClick={onTextClick}>
                    <span className="tree-node-text-primary">{primaryText}</span>
                    {this.renderSecondaryText()}
                </a>
            </div>
        );
    }
}
