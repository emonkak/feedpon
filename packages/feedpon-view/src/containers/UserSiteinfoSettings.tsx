import React from 'react';

import { bindActions } from 'feedpon-flux';
import { useStore } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';
import {
  addUserSiteinfoItem,
  deleteUserSiteinfoItem,
  updateUserSiteinfoItem,
} from 'feedpon-messaging/userSiteinfo';
import UserSiteinfoForm from '../modules/UserSiteinfoForm';
import UserSiteinfoItem from '../modules/UserSiteinfoItem';

export interface UserSiteinfoProps {}

export function UserSiteinfoSettings({}: UserSiteinfoProps) {
  const {
    onDeleteUserSiteinfoItem,
    onUpdateUserSiteinfoItem,
    onAddUserSiteinfoItem,
    items,
  } = useStore({
    mapStateToProps: (state: State) => ({
      items: state.userSiteinfo.items,
    }),
    mapDispatchToProps: bindActions({
      onAddUserSiteinfoItem: addUserSiteinfoItem,
      onDeleteUserSiteinfoItem: deleteUserSiteinfoItem,
      onUpdateUserSiteinfoItem: updateUserSiteinfoItem,
    }),
  });

  return (
    <section className="section">
      <h2 className="display-2">User siteinfo</h2>
      <p>This siteinfo is for user only.</p>
      <div className="well">
        <UserSiteinfoForm
          legend="New siteinfo"
          onSubmit={onAddUserSiteinfoItem}
        >
          <button type="submit" className="button button-outline-positive">
            Add
          </button>
        </UserSiteinfoForm>
      </div>
      <div className="u-responsive">
        <table className="table">
          <thead>
            <tr>
              <th className="u-text-nowrap" style={{ width: '35%' }}>
                Name
              </th>
              <th className="u-text-nowrap" style={{ width: '20%' }}>
                URL pattern
              </th>
              <th className="u-text-nowrap" style={{ width: '15%' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <UserSiteinfoItem
                key={item.id}
                item={item}
                onDelete={onDeleteUserSiteinfoItem}
                onUpdate={onUpdateUserSiteinfoItem}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
