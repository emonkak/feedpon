import React, { useState } from 'react';

import { bindActions } from 'feedpon-flux';
import { useStore } from 'feedpon-flux/react';
import type { State } from 'feedpon-messaging';
import {
  addUrlReplacement,
  deleteUrlReplacement,
  resetUrlReplacements,
  updateUrlReplacement,
} from 'feedpon-messaging/urlReplacements';

import { ConfirmModal } from '../common/components/ConfirmModal';
import { useEvent } from '../common/hooks/useEvent';
import { UrlReplacementForm } from './UrlReplacementForm';
import { UrlReplacementItem } from './UrlReplacementItem';

export interface UrlReplacementSettingsProps {}

export function UrlReplacementSettings({}: UrlReplacementSettingsProps) {
  const {
    items,
    onAddUrlReplacement,
    onResetUrlReplacements,
    onDeleteUrlReplacement,
    onUpdateUrlReplacement,
  } = useStore({
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
          type="button"
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
        title={'Reset all tracking URLs'}
      />
    </section>
  );
}
