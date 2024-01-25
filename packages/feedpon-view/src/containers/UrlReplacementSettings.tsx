import React, { useState } from 'react';

import ConfirmModal from '../components/ConfirmModal';
import UrlReplacementForm from '../modules/UrlReplacementForm';
import UrlReplacementItem from '../modules/UrlReplacementItem';
import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type { State, UrlReplacement } from 'feedpon-messaging';
import {
  addUrlReplacement,
  deleteUrlReplacement,
  resetUrlReplacements,
  updateUrlReplacement,
} from 'feedpon-messaging/urlReplacements';
import useEvent from '../hooks/useEvent';

interface UrlReplacementSettingsProps {
  items: UrlReplacement[];
  onAddUrlReplacement: typeof addUrlReplacement;
  onDeleteUrlReplacement: typeof deleteUrlReplacement;
  onResetUrlReplacements: typeof resetUrlReplacements;
  onUpdateUrlReplacement: typeof updateUrlReplacement;
}

function UrlReplacementSettings({
  items,
  onAddUrlReplacement,
  onResetUrlReplacements,
  onDeleteUrlReplacement,
  onUpdateUrlReplacement,
}: UrlReplacementSettingsProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleCancelResetting = useEvent(() => {
    setIsResetting(false);
  });

  const handleStartResetting = useEvent(() => {
    setIsResetting(true);
  });

  return (
    <section className="section">
      <h1 className="display-1">URL Replacement</h1>
      <p>
        These rules replace matched entry URLs. If there are multiple matchs in
        rules, them are applied to all. Thereby you can get the correct number
        of bookmarks.
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
          <tbody>
            {items.map((item, index) => (
              <UrlReplacementItem
                key={index}
                index={index}
                item={item}
                onDelete={onDeleteUrlReplacement}
                onUpdate={onUpdateUrlReplacement}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="form">
        <button
          className="button button-outline-negative"
          onClick={handleStartResetting}
        >
          Reset all URL replacement rules
        </button>
      </div>
      <ConfirmModal
        confirmButtonClassName="button button-negative"
        confirmButtonLabel="Reset"
        isOpened={isResetting}
        message="Are you sure you want to reset all tracking URLs?"
        onClose={handleCancelResetting}
        onConfirm={onResetUrlReplacements}
        title={`Reset all tracking URLs`}
      />
    </section>
  );
}

export default connect(UrlReplacementSettings, {
  mapStateToProps: (state: State) => ({
    items: state.urlReplacements.items,
  }),
  mapDispatchToProps: bindActions({
    onAddUrlReplacement: addUrlReplacement,
    onDeleteUrlReplacement: deleteUrlReplacement,
    onResetUrlReplacements: resetUrlReplacements,
    onUpdateUrlReplacement: updateUrlReplacement,
  }),
});
