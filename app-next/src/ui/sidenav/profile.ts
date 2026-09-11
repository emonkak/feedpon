import type { Profile } from '@feedpon/feedly-client';
import { html } from 'barebind';

export interface ProfileProps {
  profile: Profile;
}

export function Profile({ profile }: ProfileProps) {
  const icon =
    profile.picture !== undefined
      ? html`<img class="Profile-Visual-icon" width="32" height="32" src=${profile.picture}>`
      : html`<div class="Profile-Visual-icon EmojiIcon" data-size="32"><div class="EmojiIcon-glyph">👤</div></div>`;

  return html`
    <div class="Profile">
      <div aria-hidden="true" class="Profile-Visual">
        <${icon}>
      </div>
      <div class="Profile-Content">
        <div class="Profile-Content-name use-ellipsis">${profile.fullName}</div>
        <div class="Profile-Content-source use-ellipsis">${profile.source}</div>
      </div>
    </div>
  `;
}
