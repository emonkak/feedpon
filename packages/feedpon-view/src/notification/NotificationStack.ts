import { createComponent, html } from 'barebind';
import { AppStore } from 'feedpon-store';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'store';
import { NotificationView } from './NotificationView.ts';

export interface NotificationStackProps {}

export const NotificationStack = createComponent<NotificationStackProps>(
  function NotificationStack() {
    const { state$ } = this.use(AppStore);
    const notifications = this.use(state$.get('notifications'));
    const { dismissNotification } = this.use(
      BindActionCreators(AppStore, uiActions),
    );

    return html`
      <div class="notification-list">
        <${notifications.map((notification) =>
          NotificationView({
            notification,
            dismissNotification,
          }).withKey(notification.id),
        )}>
      </div>
    `;
  },
);
