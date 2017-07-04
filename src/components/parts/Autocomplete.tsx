import React, { Children, PureComponent, cloneElement } from 'react';
import classnames from 'classnames';

import Closable from 'components/parts/Closable';
import createChainedFunction from 'utils/createChainedFunction';
import debounceEventHandler from 'utils/debounceEventHandler';
import { Menu } from 'components/parts/Menu';

interface AutoCompleteProps {
    completeDebounceTime?: number;
    getCandidates: (query: string) => any[];
    inputControl: React.ReactElement<any>;
    isOpened?: boolean;
    onClose?: () => void;
    onSelect?: (value?: any) => void;
    onSubmit?: (query: string) => void;
    renderCandidate: (candidate: any, query: string) => React.ReactElement<any>;
    renderExtraItems?: (query: string) => React.ReactNode;
}

interface AutocompleteState {
    isOpened: boolean;
    query: string;
}

export default class Autocomplete extends PureComponent<AutoCompleteProps, AutocompleteState> {
    static defaultProps = {
        completeDebounceTime: 100,
        isOpened: false,
        renderExtraItems: () => null
    };

    private menu: Menu | null = null;

    private inputControl: HTMLInputElement | null = null;

    constructor(props: AutoCompleteProps, context: any) {
        super(props, context);

        this.state = {
            isOpened: props.isOpened!,
            query: ''
        };

        this.handleChange = debounceEventHandler(this.handleChange.bind(this), props.completeDebounceTime!);
        this.handleClose = this.handleClose.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleInputControl = this.handleInputControl.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleMenuRef = this.handleMenuRef.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event: React.FormEvent<any>) {
        if (this.inputControl) {
            const query = this.inputControl.value;

            this.setState((state) => ({
                isOpened: true,
                query
            }));
        }
    }

    handleClose() {
        this.setState((state) => ({
            isOpened: false,
            query: state.query
        }));
    }

    handleFocus() {
        this.setState((state) => ({
            isOpened: true,
            query: state.query
        }));
    }

    handleInputControl(ref: HTMLInputElement | null) {
        this.inputControl = ref;
    }

    handleKeyDown(event: React.KeyboardEvent<any>) {
        if (!this.menu) {
            return;
        }

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                event.stopPropagation();
                this.menu.focusPrevious();
                break;

            case 'ArrowDown':
                event.preventDefault();
                event.stopPropagation();
                this.menu.focusNext();
                break;

            case 'Escape':
                event.preventDefault();
                event.stopPropagation();
                if (this.inputControl) {
                    this.inputControl.blur();
                }
                this.setState((state) => ({
                    isOpened: false,
                    query: state.query
                }));
                break;
        }
    }

    handleMenuRef(ref: Menu | null) {
        this.menu = ref;
    }

    handleSelect(value: any) {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(value);
        }

        this.setState((state) => ({
            isOpened: false,
            query: state.query
        }));
    }

    handleSubmit(event: React.FormEvent<any>) {
        event.preventDefault();

        const { onSubmit } = this.props;

        if (onSubmit && this.inputControl) {
            onSubmit(this.inputControl.value);
        }
    }

    renderInputControl() {
        const { inputControl } = this.props;

        return cloneElement(inputControl, {
            ref: createChainedFunction(
                inputControl.props.ref,
                this.handleInputControl
            ),
            onChange: createChainedFunction(
                inputControl.props.onChange,
                this.handleChange
            ),
            onKeyDown: createChainedFunction(
                inputControl.props.onKeyDown,
                this.handleKeyDown
            ),
            onFocus: createChainedFunction(
                inputControl.props.onFocus,
                this.handleFocus
            )
        });
    }

    render() {
        const { getCandidates, renderCandidate, renderExtraItems } = this.props;
        const { isOpened, query } = this.state;

        const candidates = getCandidates(query);
        const extraItems = renderExtraItems!(query);

        return (
            <Closable
                onClose={this.handleClose}
                isDisabled={!isOpened}>
                <div className={classnames('autocomplete', {
                    'is-opened': isOpened && candidates.length > 0
                })}>
                    <form
                        className="autocomplete-form"
                        onSubmit={this.handleSubmit}>
                        {this.renderInputControl()}
                    </form>
                    <div className="autocomplete-menu">
                        <Menu
                            ref={this.handleMenuRef}
                            onKeyDown={this.handleKeyDown}
                            onSelect={this.handleSelect}
                            onClose={this.handleClose}>
                            {candidates.map((candidate) => renderCandidate(candidate, query))}
                            {candidates.length > 0 && Children.count(extraItems) > 0 ? <div className="menu-divider" /> : null}
                            {extraItems}
                        </Menu>
                    </div>
                </div>
            </Closable>
        );
    }
}
