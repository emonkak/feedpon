import React, { PureComponent } from 'react';
import classnames from 'classnames';
import debounce from 'lodash.debounce';

import Closable from './Closable';
import { Menu } from './Menu';

interface AutoCompleteFormProps {
  completeDebounceTime?: number;
  items: any[];
  renderInput: (props: {
    onChange: React.FormEventHandler<any>;
    onKeyDown: React.KeyboardEventHandler<any>;
    onFocus: React.FocusEventHandler<any>;
    ref: (element: HTMLInputElement | null) => void;
  }) => React.ReactElement<any>;
  isOpened?: boolean;
  onClose?: () => void;
  onSelect?: (value?: any) => void;
  onSubmit?: (query: string) => void;
  renderCandidates: (items: any[], query: string) => React.ReactNode;
}

interface AutocompleteFormState {
  isOpened: boolean;
  query: string;
}

export default class AutocompleteForm extends PureComponent<
  AutoCompleteFormProps,
  AutocompleteFormState
> {
  static defaultProps = {
    completeDebounceTime: 100,
    isOpened: false,
  };

  private _menuRef: Menu | null = null;

  private _inputRef: HTMLInputElement | null = null;

  constructor(props: AutoCompleteFormProps) {
    super(props);

    this.state = {
      isOpened: props.isOpened!,
      query: '',
    };

    this._handleChange = debounce(
      this._handleChange,
      props.completeDebounceTime!,
    );
  }

  override render() {
    const { items, renderCandidates, renderInput } = this.props;
    const { isOpened, query } = this.state;

    const candidates = renderCandidates(items, query);

    return (
      <Closable onClose={this._handleClose} isDisabled={!isOpened}>
        <div
          className={classnames('autocomplete', {
            'is-opened': isOpened,
          })}
        >
          <form className="autocomplete-form" onSubmit={this._handleSubmit}>
            {renderInput({
              onChange: this._handleChange,
              onKeyDown: this._handleKeyDown,
              onFocus: this._handleFocus,
              ref: this._handleInputRef,
            })}
          </form>
          <div className="autocomplete-menu">
            <Menu
              ref={this._handleMenuRef}
              onKeyDown={this._handleKeyDown}
              onSelect={this._handleSelect}
            >
              {candidates}
            </Menu>
          </div>
        </div>
      </Closable>
    );
  }

  private _handleClose = () => {
    const { onClose } = this.props;

    if (onClose) {
      onClose();
    }

    this.setState({
      isOpened: false,
    });
  };

  private _handleMenuRef = (ref: Menu | null) => {
    this._menuRef = ref;
  };

  private _handleSelect = (value: any) => {
    const { onSelect } = this.props;

    if (onSelect) {
      onSelect(value);
    }

    this.setState({
      isOpened: false,
    });
  };

  private _handleSubmit = (event: React.FormEvent<any>) => {
    event.preventDefault();

    if (!this._inputRef) {
      return;
    }

    const { onSubmit } = this.props;

    if (onSubmit) {
      onSubmit(this._inputRef.value);
    }
  };

  private _handleChange = (_event: React.FormEvent<any>) => {
    if (!this._inputRef) {
      return;
    }

    const query = this._inputRef.value;

    this.setState({
      isOpened: true,
      query,
    });
  };

  private _handleKeyDown = (event: React.KeyboardEvent<any>) => {
    if (!this._menuRef) {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        this._menuRef.focusPrevious();
        break;

      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        this._menuRef.focusNext();
        break;

      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        if (this._inputRef) {
          this._inputRef.blur();
        }
        this.setState({
          isOpened: false,
        });
        break;
    }
  };

  private _handleFocus = (_event: React.FocusEvent<any>) => {
    this.setState({
      isOpened: true,
    });
  };

  private _handleInputRef = (ref: HTMLInputElement | null) => {
    this._inputRef = ref;
  };
}
