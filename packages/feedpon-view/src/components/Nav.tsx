import React, {
  Children,
  PureComponent,
  cloneElement,
  isValidElement,
} from 'react';
import classnames from 'classnames';

interface NavProps {
  children?: React.ReactNode;
  onSelect?: (value: any) => void;
}

interface NavDelegateProps {
  delegate?: (value: any) => void;
}

interface NavItemProps extends NavDelegateProps {
  children?: React.ReactNode;
  isSelected?: boolean;
  onSelect?: (value: any) => void;
  title?: string;
  value: any;
}

export class Nav extends PureComponent<NavProps> {
  override render() {
    const { children } = this.props;

    return (
      <nav className="nav">{Children.map(children, this._renderChild)}</nav>
    );
  }

  private _renderChild = (child: React.ReactNode) => {
    if (isValidElement<NavDelegateProps>(child) && child.type === NavItem) {
      return cloneElement<NavDelegateProps>(child, {
        delegate: this.props.onSelect,
      });
    }

    return child;
  };
}

export class NavItem extends PureComponent<NavItemProps> {
  static defaultProps = {
    isSelected: false,
  };

  override render() {
    const { children, isSelected, title } = this.props;

    if (isSelected) {
      return (
        <span
          className={classnames('nav-item', {
            'is-selected': isSelected,
          })}
          title={title}
        >
          {children}
        </span>
      );
    } else {
      return (
        <a
          className={classnames('nav-item', {
            'is-selected': isSelected,
          })}
          href="#"
          title={title}
          onClick={this._handleSelect}
        >
          {children}
        </a>
      );
    }
  }

  private _handleSelect = (event: React.MouseEvent<any>) => {
    event.preventDefault();

    const { delegate, onSelect, value } = this.props;

    if (onSelect) {
      onSelect(value);
    }

    if (delegate) {
      delegate(value);
    }
  };
}
