import React, { PureComponent } from 'react';

import Dropdown from 'components/widgets/Dropdown';
import { EntryOrderKind, StreamFetchOptions, StreamViewKind } from 'messaging/types';
import { MenuForm, MenuItem } from 'components/widgets/Menu';

interface StreamFetchOptionsDropdownProps {
    fetchOptions: StreamFetchOptions;
    isLoading: boolean;
    onChangeEntryOrderKind: (order: EntryOrderKind) => void;
    onChangeNumberOfEntries: (numEntries: number) => void;
    onChangeStreamView: (streamView: StreamViewKind) => void;
    onClose?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onSelect?: (value?: any) => void;
    onToggleOnlyUnread: () => void;
    streamView: StreamViewKind;
}

interface StreamFetchOptionsDropdownState {
    numEntries: number;
}

export default class StreamFetchOptionsDropdown extends PureComponent<StreamFetchOptionsDropdownProps, StreamFetchOptionsDropdownState> {
    constructor(props: StreamFetchOptionsDropdownProps, context: any) {
        super(props, context);

        this.state = {
            numEntries: props.fetchOptions.numEntries
        };

        this.handleChangeNumberOfEntries = this.handleChangeNumberOfEntries.bind(this);
        this.handleSubmitNumberOfEntries = this.handleSubmitNumberOfEntries.bind(this);
    }

    handleSubmitNumberOfEntries(event: React.FormEvent<HTMLFormElement>) {
        const { onChangeNumberOfEntries } = this.props;
        const { numEntries } = this.state;

        onChangeNumberOfEntries(numEntries);
    }

    handleChangeNumberOfEntries(event: React.ChangeEvent<HTMLInputElement>) {
        const numEntries = parseInt(event.currentTarget.value, 10);

        this.setState({
            numEntries
        });
    }

    render() {
        const {
            fetchOptions,
            isLoading,
            onChangeEntryOrderKind,
            onChangeStreamView,
            onToggleOnlyUnread,
            streamView
        } = this.props;
        const { numEntries } = this.state;

        const checkmarkIcon = <i className="icon icon-16 icon-checkmark" />;

        return (
            <Dropdown
                toggleButton={
                    <button className="navbar-action">
                        <i className="icon icon-24 icon-menu-2" />
                    </button>
                }>
                <div className="menu-heading">View</div>
                <MenuItem
                    icon={streamView === 'expanded' ? checkmarkIcon : null}
                    onSelect={onChangeStreamView}
                    primaryText="Expanded view"
                    value="expanded" />
                <MenuItem
                    icon={streamView === 'collapsible' ? checkmarkIcon : null}
                    primaryText="Collapsible view"
                    onSelect={onChangeStreamView}
                    value="collapsible" />
                <div className="menu-divider" />
                <div className="menu-heading">Order</div>
                <MenuItem
                    isDisabled={isLoading}
                    icon={fetchOptions.entryOrder === 'newest' ? checkmarkIcon : null}
                    onSelect={onChangeEntryOrderKind}
                    primaryText="Newest first"
                    value="newest" />
                <MenuItem
                    isDisabled={isLoading}
                    icon={fetchOptions.entryOrder === 'oldest' ? checkmarkIcon : null}
                    onSelect={onChangeEntryOrderKind}
                    primaryText="Oldest first"
                    value="oldest" />
                <div className="menu-divider" />
                <div className="menu-heading">{fetchOptions.numEntries} entries fetching</div>
                <MenuForm onSubmit={this.handleSubmitNumberOfEntries}>
                    <div className="input-group">
                        <input
                            type="number"
                            className="form-control u-text-right"
                            style={{ width: '6rem' }}
                            value={numEntries + ''}
                            min={1}
                            onChange={this.handleChangeNumberOfEntries} />
                        <button type="submit" className="button button-positive">OK</button>
                    </div>
                </MenuForm>
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={isLoading}
                    icon={fetchOptions.onlyUnread ? checkmarkIcon : null}
                    primaryText="Only unread"
                    onSelect={onToggleOnlyUnread} />
            </Dropdown>
        );
    }
}
