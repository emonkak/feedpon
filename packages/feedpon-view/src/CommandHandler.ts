import type { HistoryNavigator } from 'barebind/addons/router/history';
import type { AppAction } from 'feedpon-store';
import { type CommandHandler, getEntryUrl } from 'feedpon-store';
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
  scrollBy,
  showOsd,
  toggleKeyboardShortcuts,
  toggleSidebar,
} from 'feedpon-store/actions/ui';

export class AppCommandHandler implements CommandHandler {
  private readonly _historyNavigator: HistoryNavigator;

  constructor(historyNavigator: HistoryNavigator) {
    this._historyNavigator = historyNavigator;
  }

  expandEntry(): AppAction<void> {
    return (state$, _context, dispatch) => {
      const { session } = state$.value;

      if (session === null || session.focusIndex < 0) {
        return;
      }

      dispatch(expandEntry(session.focusIndex));
    };
  }

  focusSearchBox(): AppAction<void> {
    return (state$) => {
      const { sidebarOpened } = state$.value;

      if (!sidebarOpened) {
        return;
      }

      const searchInput =
        document.querySelector<HTMLElement>('.input-search-box');

      if (searchInput !== null) {
        searchInput.focus();
      }
    };
  }

  goToBottom(): AppAction<void> {
    return () => {
      window.scrollTo(
        0,
        document.documentElement.scrollHeight -
          document.documentElement.clientHeight,
      );
    };
  }

  goToTop(): AppAction<void> {
    return () => {
      window.scrollTo(0, 0);
    };
  }

  markStreamAsRead(): AppAction<Promise<void>> {
    return async (_state$, _context, dispatch) => {
      await dispatch(markStreamAsRead());
    };
  }

  openArticle(): AppAction<void> {
    return (state$, _context, dispatch) => {
      const { keyboardSettings, session, stream } = state$.value;

      if (stream === null || session === null) {
        return;
      }

      const focusEntry = stream.items[session.focusIndex];
      if (focusEntry === undefined) {
        return;
      }

      dispatch(showOsd('Open Original Article'));

      chrome.tabs.getCurrent((tab) => {
        chrome.tabs.create({
          active: !keyboardSettings.openLinksInBackground,
          openerTabId: tab?.id,
          url: getEntryUrl(focusEntry),
        });
      });
    };
  }

  openWebsite(): AppAction<void> {
    return (state$, _context, dispatch) => {
      const { feed, keyboardSettings } = state$.value;

      if (feed === null || feed.website === null) {
        return;
      }

      dispatch(showOsd('Open Feed Website'));

      chrome.tabs.getCurrent((tab) => {
        chrome.tabs.create({
          active: !keyboardSettings.openLinksInBackground,
          openerTabId: tab?.id,
          url: feed.website,
        });
      });
    };
  }

  reloadStream(): AppAction<Promise<void>> {
    return async (_state$, _context, dispatch) => {
      dispatch(showOsd('Reload Current Stream'));

      await dispatch(fetchStream());
      await dispatch(fetchHatenaBookmarkCounts());
    };
  }

  reloadSubscriptions(): AppAction<Promise<void>> {
    return async (_state$, _context, dispatch) => {
      dispatch(showOsd('Reload Subscriptions'));

      await dispatch(reloadSubscriptions());
    };
  }

  scrollDown(): AppAction<void> {
    return (state$, _context, dispatch) => {
      const { keyboardSettings } = state$.value;
      const { scrollDistanceRatio } = keyboardSettings;

      const dx = 0;
      const dy = document.documentElement.clientHeight * scrollDistanceRatio;

      dispatch(scrollBy(window, dx, dy));
    };
  }

  scrollUp(): AppAction<void> {
    return (state$, _context, dispatch) => {
      const { keyboardSettings } = state$.value;
      const { scrollDistanceRatio } = keyboardSettings;

      const dx = 0;
      const dy = -document.documentElement.clientHeight * scrollDistanceRatio;

      dispatch(scrollBy(window, dx, dy));
    };
  }

  selectNextCategory(): AppAction<void> {
    return (state$) => {
      const { session, subscriptionsTree } = state$.value;

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
        this._historyNavigator.navigate(
          '/streams/' + encodeURIComponent(nextCategory.id),
        );
      }
    };
  }

  selectNextEntry(): AppAction<Promise<void>> {
    return async (state$, _context, dispatch) => {
      const { session, stream, streamLoading } = state$.value;

      if (session === null || session.focusIndex < 0) {
        return;
      }

      const offset = getNextEntryOffset();

      if (Math.abs(offset) >= 1) {
        dispatch(scrollBy(window, 0, offset));
      } else if (
        stream !== null &&
        stream.continuation !== undefined &&
        !streamLoading
      ) {
        await dispatch(fetchStream(stream.continuation));
        await dispatch(fetchHatenaBookmarkCounts());
      }
    };
  }

  selectNextSubscription(): AppAction<void> {
    return (state$) => {
      const { session, subscriptionsTree } = state$.value;

      if (session === null) {
        return;
      }

      const visibleSubscriptions = subscriptionsTree.subscriptionGroups.flatMap(
        ({ subscriptionItems }) =>
          subscriptionItems.map(({ subscription }) => subscription),
      );
      const currentIndex = visibleSubscriptions.findIndex(
        (subscription) => subscription.id === session.id,
      );
      const nextIndex = currentIndex + 1;
      const nextSubscription = visibleSubscriptions[nextIndex];

      if (nextSubscription !== undefined) {
        this._historyNavigator.navigate(
          '/streams/' + encodeURIComponent(nextSubscription.id),
        );
      }
    };
  }

  selectPreviousCategory(): AppAction<void> {
    return (state$) => {
      const { session, subscriptionsTree } = state$.value;

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
        this._historyNavigator.navigate(
          '/streams/' + encodeURIComponent(previousCategory.id),
        );
      }
    };
  }

  selectPreviousEntry(): AppAction<void> {
    return (state$, _context, dispatch) => {
      const { session } = state$.value;

      if (session === null || session.focusIndex < 0) {
        return;
      }

      const offset = getPreviousEntryOffset();

      if (Math.abs(offset) >= 1) {
        dispatch(scrollBy(window, 0, offset));
      }
    };
  }

  selectPreviousSubscription(): AppAction<void> {
    return (state$) => {
      const { session, subscriptionsTree } = state$.value;

      if (session === null) {
        return;
      }

      const visibleSubscriptions = subscriptionsTree.subscriptionGroups.flatMap(
        ({ subscriptionItems }) =>
          subscriptionItems.map(({ subscription }) => subscription),
      );
      const currentIndex = visibleSubscriptions.findIndex(
        (subscription) => subscription.id === session.id,
      );
      const previousIndex = currentIndex - 1;
      const previousSubscription = visibleSubscriptions[previousIndex];

      if (previousSubscription !== undefined) {
        this._historyNavigator.navigate(
          '/streams/' + encodeURIComponent(previousSubscription.id),
        );
      }
    };
  }

  shrinkEntry(): AppAction<void> {
    return (state$, _context, dispatch) => {
      const { session } = state$.value;

      if (session === null) {
        return;
      }

      dispatch(shrinkEntry());
    };
  }

  toggleFullContents(): AppAction<void> {
    return (state$, _context, dispatch) => {
      const { stream, session } = state$.value;

      if (stream === null || session === null || session.focusIndex < 0) {
        return;
      }

      const focusEntry = stream.items[session.focusIndex];
      if (focusEntry === undefined) {
        return;
      }

      dispatch(
        showOsd(
          focusEntry.fullContentsShown
            ? 'Hide Full Contents'
            : 'Show Full Contents',
        ),
      );

      dispatch(
        toggleFullContents(focusEntry.id, !focusEntry.fullContentsShown),
      );
    };
  }

  toggleHatenaBookmarkEntry(): AppAction<void> {
    return (state$, _context, dispatch) => {
      const { stream, session } = state$.value;

      if (stream === null || session === null || session.focusIndex < 0) {
        return;
      }

      const focusEntry = stream.items[session.focusIndex];
      if (focusEntry === undefined) {
        return;
      }

      dispatch(
        showOsd(
          focusEntry.hatenaBookmarkEntryShown
            ? 'Hide Hatena Bookmark Entry'
            : 'Show Hatena Bookmark Entry',
        ),
      );

      dispatch(
        toggleHatenaBookmarkEntry(
          focusEntry.id,
          !focusEntry.hatenaBookmarkEntryShown,
        ),
      );
    };
  }

  toggleKeyboardShortcuts(): AppAction<void> {
    return (_state$, _context, dispatch) => {
      dispatch(toggleKeyboardShortcuts());
    };
  }

  toggleSidebar(): AppAction<void> {
    return (_state$, _context, dispatch) => {
      dispatch(toggleSidebar());
    };
  }

  toggleStreamLayout(): AppAction<void> {
    return (_state$, _context, dispatch) => {
      dispatch(toggleStreamLayout());
    };
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
