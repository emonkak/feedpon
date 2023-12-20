import React, { useState } from 'react';

import Dropdown from '../components/Dropdown';
import type {
  EntryOrderKind,
  StreamFetchOptions,
  StreamViewKind,
} from 'feedpon-messaging';
import { MenuForm, MenuItem } from '../components/Menu';
import useEvent from '../hooks/useEvent';

interface StreamFetchOptionsDropdownProps {
  fetchOptions: StreamFetchOptions;
  isLoading: boolean;
  onChangeEntryOrder: (order: EntryOrderKind) => void;
  onChangeNumberOfEntries: (numEntries: number) => void;
  onChangeStreamView: (streamView: StreamViewKind) => void;
  onToggleOnlyUnread: () => void;
  streamView: StreamViewKind;
}

type Action =
  | { type: 'CHANGE_ENTRY_ORDER'; entryOrder: EntryOrderKind }
  | { type: 'CHANGE_ONLY_UNREAD'; enabled: boolean }
  | { type: 'CHANGE_NUMBER_OF_ENTRIES' }
  | { type: 'CHANGE_STREAM_VIEW'; streamView: StreamViewKind };

export default function StreamFetchOptionsDropdown({
  fetchOptions,
  isLoading,
  onChangeEntryOrder,
  onChangeNumberOfEntries,
  onChangeStreamView,
  onToggleOnlyUnread,
  streamView,
}: StreamFetchOptionsDropdownProps) {
  const [numEntries, setNumEntries] = useState(fetchOptions.numEntries);

  const handleSelectAction = useEvent((action: Action) => {
    switch (action.type) {
      case 'CHANGE_ENTRY_ORDER': {
        onChangeEntryOrder(action.entryOrder);
        break;
      }
      case 'CHANGE_ONLY_UNREAD':
        onToggleOnlyUnread();
        break;
      case 'CHANGE_NUMBER_OF_ENTRIES': {
        onChangeNumberOfEntries(numEntries);
        break;
      }
      case 'CHANGE_STREAM_VIEW': {
        onChangeStreamView(action.streamView);
        break;
      }
    }
  });

  const handleChangeNumberOfEntries = useEvent(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const numEntries = parseInt(event.currentTarget.value, 10);

      setNumEntries(numEntries);
    },
  );

  const checkmarkIcon = <i className="icon icon-16 icon-checkmark" />;

  return (
    <Dropdown
      onSelect={handleSelectAction}
      toggleButton={
        <button className="navbar-action">
          <i className="icon icon-24 icon-menu-2" />
        </button>
      }
    >
      <div className="menu-heading">View</div>
      <MenuItem<Action>
        value={{
          type: 'CHANGE_STREAM_VIEW',
          streamView: 'expanded',
        }}
        icon={streamView === 'expanded' ? checkmarkIcon : null}
        primaryText="Expanded view"
      />
      <MenuItem<Action>
        value={{
          type: 'CHANGE_STREAM_VIEW',
          streamView: 'collapsible',
        }}
        icon={streamView === 'collapsible' ? checkmarkIcon : null}
        primaryText="Collapsible view"
      />
      <div className="menu-divider" />
      <div className="menu-heading">Order</div>
      <MenuItem<Action>
        value={{
          type: 'CHANGE_ENTRY_ORDER',
          entryOrder: 'newest',
        }}
        isDisabled={isLoading}
        icon={fetchOptions.entryOrder === 'newest' ? checkmarkIcon : null}
        primaryText="Newest first"
      />
      <MenuItem<Action>
        value={{
          type: 'CHANGE_ENTRY_ORDER',
          entryOrder: 'oldest',
        }}
        isDisabled={isLoading}
        icon={fetchOptions.entryOrder === 'oldest' ? checkmarkIcon : null}
        primaryText="Oldest first"
      />
      <div className="menu-divider" />
      <div className="menu-heading">
        {fetchOptions.numEntries} entries fetching
      </div>
      <MenuForm<Action> value={{ type: 'CHANGE_NUMBER_OF_ENTRIES' }}>
        <div className="input-group">
          <input
            type="number"
            className="form-control u-text-right"
            style={{ width: '6rem' }}
            value={numEntries + ''}
            min={1}
            onChange={handleChangeNumberOfEntries}
          />
          <button type="submit" className="button button-positive">
            OK
          </button>
        </div>
      </MenuForm>
      <div className="menu-divider" />
      <MenuItem<Action>
        value={{
          type: 'CHANGE_ONLY_UNREAD',
          enabled: !fetchOptions.onlyUnread,
        }}
        isDisabled={isLoading}
        icon={fetchOptions.onlyUnread ? checkmarkIcon : null}
        primaryText="Only unread"
      />
    </Dropdown>
  );
}
