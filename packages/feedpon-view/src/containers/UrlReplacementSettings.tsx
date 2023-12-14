import React, { PureComponent } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import UrlReplacementForm from '../modules/UrlReplacementForm';
import UrlReplacementItem from '../modules/UrlReplacementItem';
import bindActions from 'feedpon-utils/flux/bindActions';
import connect from 'feedpon-utils/flux/react/connect';
import type { State, UrlReplacement } from 'feedpon-messaging';
import {
  addUrlReplacement,
  deleteUrlReplacement,
  resetUrlReplacements,
  updateUrlReplacement,
} from 'feedpon-messaging/urlReplacements';

interface UrlReplacementSettingsProps {
  items: UrlReplacement[];
  onAddUrlReplacement: typeof addUrlReplacement;
  onDeleteUrlReplacement: typeof deleteUrlReplacement;
  onResetUrlReplacements: typeof resetUrlReplacements;
  onUpdateUrlReplacement: typeof updateUrlReplacement;
}

interface UrlReplacementSettingsState {
  isResetting: boolean;
}

class UrlReplacementSettings extends PureComponent<
  UrlReplacementSettingsProps,
  UrlReplacementSettingsState
> {
  constructor(props: UrlReplacementSettingsProps) {
    super(props);

    this.state = {
      isResetting: false,
    };
  }

  override render() {
    const { items, onAddUrlReplacement, onResetUrlReplacements } = this.props;
    const { isResetting } = this.state;

    return (
      <section className="section">
        <h1 className="display-1">URL Replacement</h1>
        <p>
          These rules replace matched entry URLs. If there are multiple matchs
          in rules, them are applied to all. Thereby you can get the correct
          number of bookmarks.
        </p>
        <UrlReplacementForm
          legend="New URL replacement rule"
          onSubmit={onAddUrlReplacement}
        >
          <button type="submit" className="button button-outline-positive">
            Add
          </button>
        </UrlReplacementForm>
        <h2 className="display-2">Available rules</h2>
        <div className="u-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Pattern</th>
                <th>Replacement</th>
                <th>Flags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{items.map(this._renderItem, this)}</tbody>
          </table>
        </div>
        <div className="form">
          <button
            className="button button-outline-negative"
            onClick={this._handleStartResetting}
          >
            Reset all URL replacement rules
          </button>
        </div>
        <ConfirmModal
          confirmButtonClassName="button button-negative"
          confirmButtonLabel="Reset"
          isOpened={isResetting}
          message="Are you sure you want to reset all tracking URLs?"
          onClose={this._handleCancelResetting}
          onConfirm={onResetUrlReplacements}
          title={`Reset all tracking URLs`}
        />
      </section>
    );
  }

  private _renderItem(item: UrlReplacement, index: number) {
    const { onDeleteUrlReplacement, onUpdateUrlReplacement } = this.props;

    return (
      <UrlReplacementItem
        key={index}
        index={index}
        item={item}
        onDelete={onDeleteUrlReplacement}
        onUpdate={onUpdateUrlReplacement}
      />
    );
  }

  private _handleCancelResetting = () => {
    this.setState({
      isResetting: false,
    });
  };

  private _handleStartResetting = () => {
    this.setState({
      isResetting: true,
    });
  };
}

export default connect({
  mapStateToProps: (state: State) => ({
    items: state.urlReplacements.items,
  }),
  mapDispatchToProps: bindActions({
    onAddUrlReplacement: addUrlReplacement,
    onDeleteUrlReplacement: deleteUrlReplacement,
    onResetUrlReplacements: resetUrlReplacements,
    onUpdateUrlReplacement: updateUrlReplacement,
  }),
})(UrlReplacementSettings);
