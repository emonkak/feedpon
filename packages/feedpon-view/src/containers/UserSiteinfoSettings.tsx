import React from 'react';

import UserSiteinfoForm from '../modules/UserSiteinfoForm';
import UserSiteinfoItem from '../modules/UserSiteinfoItem';
import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { State, SiteinfoItem } from 'feedpon-messaging';
import {
  addUserSiteinfoItem,
  deleteUserSiteinfoItem,
  updateUserSiteinfoItem,
} from 'feedpon-messaging/userSiteinfo';

interface UserSiteinfoProps {
  items: SiteinfoItem[];
  onAddUserSiteinfoItem: typeof addUserSiteinfoItem;
  onDeleteUserSiteinfoItem: typeof deleteUserSiteinfoItem;
  onUpdateUserSiteinfoItem: typeof updateUserSiteinfoItem;
}

function UserSiteinfoSettings({
  onDeleteUserSiteinfoItem,
  onUpdateUserSiteinfoItem,
  onAddUserSiteinfoItem,
  items,
}: UserSiteinfoProps) {
  return (
    <section className="section">
      <h2 className="display-2">User siteinfo</h2>
      <p>This siteinfo is for user only.</p>
      <div className="well">
        <UserSiteinfoForm
          legend="New siteinfo"
          onSubmit={onAddUserSiteinfoItem}
        >
          <button className="button button-outline-positive" type="submit">
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

export default connect(UserSiteinfoSettings, {
  mapStateToProps: (state: State) => ({
    items: state.userSiteinfo.items,
  }),
  mapDispatchToProps: bindActions({
    onAddUserSiteinfoItem: addUserSiteinfoItem,
    onDeleteUserSiteinfoItem: deleteUserSiteinfoItem,
    onUpdateUserSiteinfoItem: updateUserSiteinfoItem,
  }),
});
