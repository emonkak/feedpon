import { html } from 'barebind';

export interface SubscriptionNavProps {
  onReload: () => void;
  reloading: boolean;
}

export function SubscriptionNav({ reloading, onReload }: SubscriptionNavProps) {
  return html`
    <div class="SubscriptionNav" role="toolbar">
      <div class="SubscriptionNav-Item">
        <button
          aria-label="Reload subscriptions"
          class="Button solid default"
          disabled=${reloading}
          title="Reload subscriptions"
          type="button"
          @click=${onReload}
        >
          <div aria-hidden="true" class="Button-icon EmojiIcon">
            <span class="EmojiIcon-glyph">🔄</span>
          </div>
        </button>
      </div>
      <div class="SubscriptionNav-Spacer"></div>
      <div class="SubscriptionNav-Item">
        <button
          aria-label="Search subscriptions"
          class="Button solid default"
          title="Search subscriptions"
          type="button"
        >
          <div aria-hidden="true" class="Button-icon EmojiIcon">
            <span class="EmojiIcon-glyph">🔍︎</span>
          </div>
        </button>
      </div>
      <div class="SubscriptionNav-Item">
        <button
          aria-label="Toggle sidebar"
          class="Button solid default"
          title="Toggle sidebar"
          type="button"
        >
          <div aria-hidden="true" class="Button-icon EmojiIcon">
            <span class="EmojiIcon-glyph">⬅️</span>
          </div>
        </button>
      </div>
    </div>
  `;
}
