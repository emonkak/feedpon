import { BindActionCreators } from '@feedpon/foundation';
import { AppStore } from '@feedpon/model';
import * as uiActions from '@feedpon/model/actions/ui';
import { createComponent, html } from 'barebind';
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
