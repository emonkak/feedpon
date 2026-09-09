import type { Profile } from '@feedpon/feedly-client';
import { html } from 'barebind';

export interface ProfileProps {
  profile: Profile;
}

export function Profile({ profile }: ProfileProps) {
  const icon =
    profile.picture !== undefined
      ? html`<img class="Profile-icon" width="32" height="32" src=${profile.picture}>`
      : html`<div class="Profile-icon EmojiIcon" data-size="32"><div class="EmojiIcon-glyph">👤</div></div>`;

  return html`
    <div class="Profile">
      <${icon}>
      <div class="Profile-name use-ellipsis">${profile.fullName}</div>
      <div class="Profile-source use-ellipsis">${profile.source}</div>
    <div>
  `;
}
