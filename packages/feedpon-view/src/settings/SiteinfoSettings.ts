import {
  createComponent,
  type ElementRef,
  type RenderContext,
  Repeat,
} from 'barebind';
import { DeferredValue } from 'barebind/extras/hooks';

import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/barebind.ts';
import type { SiteinfoItem, State } from 'feedpon-messaging';
import { updateSiteinfo } from 'feedpon-messaging/sharedSiteinfo';
import {
  addUserSiteinfoItem,
  deleteUserSiteinfoItem,
  updateUserSiteinfoItem,
} from 'feedpon-messaging/userSiteinfo';
import tryMatch from 'feedpon-utils/tryMatch.ts';
import { RelativeTime } from '../primitives/RelativeTime.ts';
import {
  type BlankSpaces,
  VirtualScrollList,
} from '../primitives/VirtualScrollList.ts';
import { SharedSiteinfoItem } from './SharedSiteinfoItem.ts';
import { UserSiteinfoForm } from './UserSiteinfoForm.ts';
import { UserSiteinfoRow } from './UserSiteinfoRow.ts';

interface SiteinfoSettingsProps {}

export const SiteinfoSettings = createComponent(function SiteinfoSettings(
  {}: SiteinfoSettingsProps,
  $: RenderContext,
): unknown {
  return $.html`
    <section>
      <h1 className="display-1">Siteinfo</h1>
      <p>Siteinfo is used for extracting the full content.</p>
      <${UserSiteinfoSection({})}>
      <${SharedSiteinfoSection({})}>
    </section>
  `;
});

export interface SharedSiteinfoSectionProps {}

export const SharedSiteinfoSection = createComponent(
  function SharedSiteinfoSection(
    {}: SharedSiteinfoSectionProps,
    $: RenderContext,
  ): unknown {
    const { isLoading, items, lastUpdatedAt, onUpdateSiteinfo } = $.use(
      getStoreHook({
        mapStateToProps: (state: State) => ({
          isLoading: state.sharedSiteinfo.isLoading,
          items: state.sharedSiteinfo.items,
          lastUpdatedAt: state.sharedSiteinfo.lastUpdatedAt,
        }),
        mapDispatchToProps: bindActions({
          onUpdateSiteinfo: updateSiteinfo,
        }),
      }),
    );

    const [testUrl, setTestUrl] = $.useState('');
    const defferedTestUrl = $.use(DeferredValue(testUrl));

    const matchedItems = $.useMemo(
      () =>
        defferedTestUrl !== ''
          ? items.filter((item) => tryMatch(item.urlPattern, defferedTestUrl))
          : items,
      [defferedTestUrl],
    );

    const handleChangeTestUrl = $.useCallback((event: Event) => {
      setTestUrl((event.currentTarget as HTMLInputElement).value);
    }, []);

    const lastUpdate =
      lastUpdatedAt > 0
        ? $.html`
      <p>
        <strong>${matchedItems.length}</strong> items are available. Last update was <strong><${RelativeTime({ time: lastUpdatedAt })}></strong>.
      </p>
    `
        : $.html`<p>Not update yet.</p>`;

    return $.html`
    <section class="section">
      <h2 class="display-2">Shared siteinfo</h2>
      <p>
        This siteinfo is shared by  <a target="_blank" href="http://wedata.net/" rel="noreferrer">Wedata</a>. It uses <a target="_blank" href="http://wedata.net/databases/LDRFullFeed/items" rel="noreferrer">LDRFullFeed</a> and  <a target="_blank" href="http://wedata.net/databases/AutoPagerize/items" rel="noreferrer">AutoPagerize</a> databases for updating.
      </p>
      <p>
        <input
          class="form-control"
          placeholder="Search by url..."
          type="search"
          @input=${handleChangeTestUrl}
        >
      </p>
      <${lastUpdate}>
      <p>
        <button
          class="button button-positive"
          disabled=${isLoading}
          type="button"
          @click=${onUpdateSiteinfo}
        >
          Update
        </button>
      </p>
      <${VirtualScrollList({
        assumedItemSize: 24 * 7,
        items: matchedItems,
        renderItem: renderSiteinfoItem,
        renderList: renderSiteinfoList,
      })}>
    </section>
  `;
  },
);

export interface UserSiteinfoSectionProps {}

export const UserSiteinfoSection = createComponent(function UserSiteinfoSection(
  {}: UserSiteinfoSectionProps,
  $: RenderContext,
): unknown {
  const { onDelete, onUpdate, onAdd, items } = $.use(
    getStoreHook({
      mapStateToProps: (state: State) => ({
        isLoading: state.sharedSiteinfo.isLoading,
        lastUpdatedAt: state.sharedSiteinfo.lastUpdatedAt,
        items: state.userSiteinfo.items,
      }),
      mapDispatchToProps: bindActions({
        onAdd: addUserSiteinfoItem,
        onDelete: deleteUserSiteinfoItem,
        onUpdate: updateUserSiteinfoItem,
      }),
    }),
  );

  const rows = Repeat({
    source: items,
    keySelector: (item) => item.id,
    valueSelector: (item) =>
      UserSiteinfoRow({
        item,
        onDelete,
        onUpdate,
      }),
  });

  return $.html`
    <section class="section">
      <h2 class="display-2">User siteinfo</h2>
      <p>This siteinfo is for user only.</p>
      <div class="well">
        <${UserSiteinfoForm({
          onSubmit: onAdd,
        })}>
      </div>
      <div class="u-responsive">
        <table class="table">
          <thead>
            <tr>
              <th class="u-text-nowrap" style="width: 35%">
                Name
              </th>
              <th class="u-text-nowrap" style="width: 20%">
                URL pattern
              </th>
              <th class="u-text-nowrap" style="width: 15%">
                Actions
              </th>
            </tr>
          </thead>
          <tbody><${rows}></tbody>
        </table>
      </div>
    </section>
  `;
});

function renderSiteinfoList(
  children: unknown,
  blankSpaces: BlankSpaces,
  elementRef: ElementRef,
  $: RenderContext,
): unknown {
  return $.html`
    <div :ref=${elementRef} class="u-responsive">
      <ul class="list-group">
        <div style=${`height: ${blankSpaces.above}px`}></div>
        <${children}>
        <div style=${`height: ${blankSpaces.below}px`}></div>
      </ul>
    </div>
  `;
}

function renderSiteinfoItem(item: SiteinfoItem): unknown {
  return SharedSiteinfoItem({ item });
}
