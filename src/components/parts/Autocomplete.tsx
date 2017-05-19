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
    renderHeadItems?: (query: string) => React.ReactNode;
    renderTailItems?: (query: string) => React.ReactNode;
}

interface AutocompleteState {
    isOpened: boolean;
    query: string;
}

export default class Autocomplete extends PureComponent<AutoCompleteProps, AutocompleteState> {
    static defaultProps = {
        completeDebounceTime: 100,
        isOpened: false,
        renderHeadItems: () => null,
        renderTailItems: () => null
    };

    private menu: Menu;

    private queryInput: HTMLInputElement;

    constructor(props: AutoCompleteProps, context: any) {
        super(props, context);

        this.state = {
            isOpened: props.isOpened!,
            query: ''
        };

        this.handleChange = debounceEventHandler(this.handleChange.bind(this), props.completeDebounceTime!);
        this.handleClose = this.handleClose.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event: React.FormEvent<any>) {
        const query = this.queryInput.value;

        this.setState((state) => ({
            isOpened: true,
            query
        }));
    }

    handleClose() {
        this.setState((state) => ({
            isOpened: false,
            query: state.query
        }));
    }

    handleOpen() {
        this.setState((state) => ({
            isOpened: true,
            query: state.query
        }));
    }

    handleKeyDown(event: React.KeyboardEvent<any>) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.menu.focusPrevious();
                break;

            case 'ArrowDown':
                event.preventDefault();
                this.menu.focusNext();
                break;

            case 'Escape':
                this.queryInput.focus();
                break;
        }
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

        if (onSubmit) {
            onSubmit(this.queryInput.value);
        }
    }

    renderInputControl() {
        const { inputControl } = this.props;

        return cloneElement(inputControl, {
            ref: createChainedFunction(
                inputControl.props.ref,
                (ref: HTMLInputElement) => this.queryInput = ref
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
                this.handleOpen
            )
        });
    }

    render() {
        const { getCandidates, renderCandidate, renderHeadItems, renderTailItems } = this.props;
        const { isOpened, query } = this.state;

        const candidates = getCandidates(query);
        const headItems = renderHeadItems!(query);
        const tailItems = renderTailItems!(query);

        return (
            <Closable
                onClose={this.handleClose}
                isDisabled={!isOpened}>
                <div className={classnames('autocomplete', {
                    'is-opened': isOpened
                })}>
                    <form className="autocomplete-form"
                          onSubmit={this.handleSubmit}>
                        {this.renderInputControl()}
                    </form>
                    <Menu ref={(ref) => this.menu = ref}
                          className="autocomplete-menu"
                          onKeyDown={this.handleKeyDown}
                          onSelect={this.handleSelect}
                          onClose={this.handleClose}>
                        {headItems}
                        {candidates.length && Children.count(headItems) ? <div className="menu-divider" /> : null}
                        {candidates.map((candidate) => renderCandidate(candidate, query))}
                        {candidates.length && Children.count(tailItems) ? <div className="menu-divider" /> : null}
                        {tailItems}
                    </Menu>
                </div>
            </Closable>
        );
    }
}
