import React from 'react';

import Dropdown from 'components/widgets/Dropdown';
import { EntryOrderKind, StreamFetchOptions, StreamViewKind } from 'messaging/types';
import { MenuItem } from 'components/widgets/Menu';

interface StreamFetchOptionsDropdownProps {
    fetchOptions: StreamFetchOptions;
    isLoading: boolean;
    onChangeEntryOrderKind: (order: EntryOrderKind) => void;
    onChangeStreamView: (streamView: StreamViewKind) => void;
    onClose?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onSelect?: (value?: any) => void;
    onToggleOnlyUnread: () => void;
    streamView: StreamViewKind;
}

const StreamFetchOptionsDropdown: React.SFC<StreamFetchOptionsDropdownProps> = ({
    fetchOptions,
    isLoading,
    onChangeEntryOrderKind,
    onChangeStreamView,
    onToggleOnlyUnread,
    streamView
}) => {
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
            <MenuItem
                isDisabled={isLoading}
                icon={fetchOptions.onlyUnread ? checkmarkIcon : null}
                primaryText="Only unread"
                onSelect={onToggleOnlyUnread} />
        </Dropdown>
    );
}

export default StreamFetchOptionsDropdown;
