import type { HistoryNavigator } from 'barebind/extras/router/history';
import type { AppContext } from 'feedpon-store';
import {
  expandEntry,
  fetchHatenaBookmarkCounts,
  fetchStream,
  markStreamAsRead,
  shrinkEntry,
  toggleFullContents,
  toggleHatenaBookmarkEntry,
  toggleStreamLayout,
} from 'feedpon-store/actions/stream';
import { reloadSubscriptions } from 'feedpon-store/actions/subscription';
import {
  showOsd,
  smoothScrollBy,
  toggleKeyboardShortcuts,
  toggleSidebar,
} from 'feedpon-store/actions/ui';
import { type CommandHandler, getEntryUrl } from 'feedpon-store/state';

export class AppCommandHandler implements CommandHandler<AppContext> {
  private readonly _navigator: HistoryNavigator;

  constructor(navigator: HistoryNavigator) {
    this._navigator = navigator;
  }

  expandEntry(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ session }) => {
      if (session === null || session.focusIndex < 0) {
        return;
      }

      expandEntry(session.focusIndex)(context);
    });
  }

  focusSearchBox(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ sidebarOpened }) => {
      if (!sidebarOpened) {
        return;
      }

      const searchInput =
        document.querySelector<HTMLElement>('.input-search-box');

      if (searchInput !== null) {
        searchInput.focus();
      }
    });
  }

  goToBottom(_context: AppContext): void {
    window.scrollTo(
      0,
      document.documentElement.scrollHeight -
        document.documentElement.clientHeight,
    );
  }

  goToTop(_context: AppContext): void {
    window.scrollTo(0, 0);
  }

  markStreamAsRead(context: AppContext): void {
    markStreamAsRead()(context);
  }

  openArticle(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ keyboardSettings, session, stream }) => {
      if (stream === null || session === null) {
        return;
      }

      const focusEntry = stream.items[session.focusIndex];
      if (focusEntry === undefined) {
        return;
      }

      showOsd('Open Original Article')(context);

      chrome.tabs.getCurrent((tab) => {
        chrome.tabs.create({
          active: !keyboardSettings.openLinksInBackground,
          openerTabId: tab?.id,
          url: getEntryUrl(focusEntry),
        });
      });
    });
  }

  openWebsite(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ feed, keyboardSettings }) => {
      if (feed === null || feed.website === null) {
        return;
      }

      showOsd('Open Feed Website')(context);

      chrome.tabs.getCurrent((tab) => {
        chrome.tabs.create({
          active: !keyboardSettings.openLinksInBackground,
          openerTabId: tab?.id,
          url: feed.website,
        });
      });
    });
  }

  async reloadStream(context: AppContext): Promise<void> {
    showOsd('Reload Current Stream')(context);

    await fetchStream()(context);
    await fetchHatenaBookmarkCounts()(context);
  }

  reloadSubscriptions(context: AppContext): Promise<void> {
    showOsd('Reload Subscriptions')(context);

    return reloadSubscriptions()(context);
  }

  scrollDown(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ keyboardSettings }) => {
      const { scrollDistanceRatio, scrollDuration } = keyboardSettings;
      const dx = 0;
      const dy = document.documentElement.clientHeight * scrollDistanceRatio;

      if (scrollDuration > 0) {
        smoothScrollBy(window, dx, dy, scrollDuration)(context);
      } else {
        window.scrollBy(dx, dy);
      }
    });
  }

  scrollUp(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ keyboardSettings }) => {
      const { scrollDistanceRatio, scrollDuration } = keyboardSettings;
      const dx = 0;
      const dy = -document.documentElement.clientHeight * scrollDistanceRatio;

      if (scrollDuration > 0) {
        smoothScrollBy(window, dx, dy, scrollDuration)(context);
      } else {
        window.scrollBy(dx, dy);
      }
    });
  }

  selectNextCategory(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ session, subscriptionsTree }) => {
      if (session === null) {
        return;
      }

      const currentIndex = subscriptionsTree.subscriptionGroups.findIndex(
        ({ category, subscriptionItems }) =>
          category.id === session.id ||
          subscriptionItems.some(
            ({ subscription }) => subscription.id === session.id,
          ),
      );
      const nextIndex = currentIndex + 1;
      const nextCategory =
        subscriptionsTree.subscriptionGroups[nextIndex]?.category;

      if (nextCategory !== undefined) {
        this._navigator.navigate(
          '/streams/' + encodeURIComponent(nextCategory.id),
        );
      }
    });
  }

  selectNextEntry(context: AppContext): Promise<void> {
    const { state$ } = context;

    return state$.mutate(
      async ({ keyboardSettings, session, stream, streamLoading }) => {
        if (session === null || session.focusIndex < 0) {
          return;
        }

        const offset = getNextEntryOffset();

        if (Math.abs(offset) >= 1) {
          const { scrollDuration } = keyboardSettings;
          if (scrollDuration > 0) {
            smoothScrollBy(window, 0, offset, scrollDuration)(context);
          } else {
            window.scrollBy(0, offset);
          }
        } else if (
          stream !== null &&
          stream.continuation !== undefined &&
          !streamLoading
        ) {
          await fetchStream(stream.continuation)(context);
          await fetchHatenaBookmarkCounts()(context);
        }
      },
    );
  }

  selectNextSubscription(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ session, subscriptionsTree }) => {
      if (session === null) {
        return;
      }

      for (const {
        subscriptionItems,
      } of subscriptionsTree.subscriptionGroups) {
        const currentIndex = subscriptionItems.findIndex(
          ({ subscription }) => subscription.id === session.id,
        );
        const nextIndex = currentIndex + 1;
        const nextSubscription = subscriptionItems[nextIndex]?.subscription;

        if (nextSubscription !== undefined) {
          this._navigator.navigate(
            '/streams/' + encodeURIComponent(nextSubscription.id),
          );
          return;
        }
      }
    });
  }

  selectPreviousCategory(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ session, subscriptionsTree }) => {
      if (session === null) {
        return;
      }

      const currentIndex = subscriptionsTree.subscriptionGroups.findIndex(
        ({ category, subscriptionItems }) =>
          category.id === session.id ||
          subscriptionItems.some(
            ({ subscription }) => subscription.id === session.id,
          ),
      );
      const previousIndex = currentIndex - 1;
      const previousCategory =
        subscriptionsTree.subscriptionGroups[previousIndex]?.category;

      if (previousCategory !== undefined) {
        this._navigator.navigate(
          '/streams/' + encodeURIComponent(previousCategory.id),
        );
      }
    });
  }

  selectPreviousEntry(context: AppContext): Promise<void> {
    const { state$ } = context;

    return state$.mutate(async ({ session, keyboardSettings }) => {
      if (session === null || session.focusIndex < 0) {
        return;
      }

      const offset = getPreviousEntryOffset();

      if (Math.abs(offset) >= 1) {
        const { scrollDuration } = keyboardSettings;
        if (scrollDuration > 0) {
          smoothScrollBy(window, 0, offset, scrollDuration)(context);
        } else {
          window.scrollBy(0, offset);
        }
      }
    });
  }

  selectPreviousSubscription(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ session, subscriptionsTree }) => {
      if (session === null) {
        return;
      }

      for (const {
        subscriptionItems,
      } of subscriptionsTree.subscriptionGroups) {
        const currentIndex = subscriptionItems.findIndex(
          ({ subscription }) => subscription.id === session.id,
        );
        const previousIndex = currentIndex - 1;
        const previousSubscription =
          subscriptionItems[previousIndex]?.subscription;

        if (previousSubscription !== undefined) {
          this._navigator.navigate(
            '/streams/' + encodeURIComponent(previousSubscription.id),
          );
          return;
        }
      }
    });
  }

  shrinkEntry(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ session }) => {
      if (session === null) {
        return;
      }

      shrinkEntry()(context);
    });
  }

  toggleFullContents(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ stream, session }) => {
      if (stream === null || session === null || session.focusIndex < 0) {
        return;
      }

      const focusEntry = stream.items[session.focusIndex];
      if (focusEntry === undefined) {
        return;
      }

      showOsd(
        focusEntry.fullContentsShown
          ? 'Hide Full Contents'
          : 'Show Full Contents',
      )(context);

      toggleFullContents(focusEntry.id, !focusEntry.fullContentsShown)(context);
    });
  }

  toggleHatenaBookmarkEntry(context: AppContext): void {
    const { state$ } = context;

    state$.mutate(({ stream, session }) => {
      if (stream === null || session === null || session.focusIndex < 0) {
        return;
      }

      const focusEntry = stream.items[session.focusIndex];
      if (focusEntry === undefined) {
        return;
      }

      showOsd(
        focusEntry.hatenaBookmarkEntryShown
          ? 'Hide Hatena Bookmark Entry'
          : 'Show Hatena Bookmark Entry',
      )(context);

      toggleHatenaBookmarkEntry(
        focusEntry.id,
        !focusEntry.hatenaBookmarkEntryShown,
      )(context);
    });
  }

  toggleKeyboardShortcuts(context: AppContext): void {
    toggleKeyboardShortcuts()(context);
  }

  toggleSidebar(context: AppContext): void {
    toggleSidebar()(context);
  }

  toggleStreamLayout(context: AppContext): void {
    toggleStreamLayout()(context);
  }
}

function getNextEntryOffset(): number {
  const elements = document.getElementsByClassName('entry');
  const scrollOffset = getScrollOffset();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i] as HTMLElement;
    const { top, bottom } = element.getBoundingClientRect();
    let offset = top - scrollOffset;
    if (offset >= 1) {
      return offset;
    }
    offset = bottom - scrollOffset;
    if (offset >= 1) {
      return offset;
    }
  }

  const belowSpacer = document.querySelector<HTMLElement>(
    '.entry-list > :last-child',
  );
  if (belowSpacer && belowSpacer.offsetHeight > 0) {
    return 0;
  }

  return (
    document.documentElement.scrollHeight - window.innerHeight - window.scrollY
  );
}

function getPreviousEntryOffset(): number {
  const elements = document.getElementsByClassName('entry');
  const scrollOffset = getScrollOffset();

  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i] as HTMLElement;
    const top = element.getBoundingClientRect().top;
    const offset = top - scrollOffset;
    if (offset <= -1) {
      return offset;
    }
  }

  const aboveSpaces = document.querySelector<HTMLElement>(
    '.entry-list > :first-child',
  );

  if (aboveSpaces && aboveSpaces.offsetHeight > 0) {
    return 0;
  }

  return -window.scrollY;
}

function getScrollOffset(): number {
  const navbar = document.getElementsByClassName('navbar')[0];
  return navbar ? (navbar as HTMLElement).offsetHeight : 0;
}
