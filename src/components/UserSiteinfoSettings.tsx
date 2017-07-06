import React, { PureComponent } from 'react';

import UserSiteinfoForm from 'components/parts/UserSiteinfoForm';
import UserSiteinfoItem from 'components/parts/UserSiteinfoItem';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { State, SiteinfoItem } from 'messaging/types';
import { addSiteinfoItem, removeSiteinfoItem, updateSiteinfoItem } from 'messaging/userSiteinfo/actions';

interface UserSiteinfoProps {
    items: SiteinfoItem[];
    onAddSiteinfoItem: typeof addSiteinfoItem;
    onRemoveSiteinfoItem: typeof removeSiteinfoItem;
    onUpdateSiteinfoItem: typeof updateSiteinfoItem;
}

class UserSiteinfoSettings extends PureComponent<UserSiteinfoProps, {}> {
    renderUserItem(item: SiteinfoItem) {
        const { onRemoveSiteinfoItem, onUpdateSiteinfoItem } = this.props;

        return (
            <UserSiteinfoItem
                key={item.id}
                item={item}
                onRemove={onRemoveSiteinfoItem}
                onUpdate={onUpdateSiteinfoItem} />
        );
    }

    render() {
        const { onAddSiteinfoItem, items } = this.props;

        return (
            <section className="section">
                <h2 className="display-2">User siteinfo</h2>
                <p>This siteinfo is for user only.</p>
                <div className="well">
                    <UserSiteinfoForm legend="New item" onSubmit={onAddSiteinfoItem}>
                        <button className="button button-outline-positive" type="submit">Add</button>
                    </UserSiteinfoForm>
                </div>
                <div className="u-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="u-text-nowrap" style={{ width: '35%' }}>Name</th>
                                <th className="u-text-nowrap" style={{ width: '20%' }}>URL pattern</th>
                                <th className="u-text-nowrap" style={{ width: '15%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(this.renderUserItem, this)}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
}

export default connect({
    mapStateToProps: (state: State) => ({
        items: state.userSiteinfo.items
    }),
    mapDispatchToProps: bindActions({
        onAddSiteinfoItem: addSiteinfoItem,
        onRemoveSiteinfoItem: removeSiteinfoItem,
        onUpdateSiteinfoItem: updateSiteinfoItem
    })
})(UserSiteinfoSettings);
