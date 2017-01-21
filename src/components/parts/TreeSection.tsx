import * as React from 'react';

function renderLeftIcon(props: any) {
    const { leftIcon, onLeftIconClick } = props;

    if (leftIcon) {
        return (
            <a className="tree-node-icon" href="#" onClick={onLeftIconClick}>{leftIcon}</a>
        );
    } else {
        return null;
    }
}

function renderRightIcon(props: any) {
    const { rightIcon, onRightIconClick } = props;

    if (rightIcon) {
        return (
            <a className="tree-node-icon" href="#" onClick={onRightIconClick}>{rightIcon}</a>
        );
    } else {
        return null;
    }
}

export default function TreeSection(props: any) {
    const { title } = props;

    return (
        <li>
            <div className="tree-section">
                {renderLeftIcon(props)}
                <span className="tree-node-text">{title}</span>
                {renderRightIcon(props)}
            </div>
        </li>
    );
}
