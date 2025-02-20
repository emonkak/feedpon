import { bindActions } from 'feedpon-flux';
import type { SiteinfoItem, State } from 'feedpon-messaging';
import { updateSiteinfo } from 'feedpon-messaging/sharedSiteinfo';
import {
  addUserSiteinfoItem,
  deleteUserSiteinfoItem,
  updateUserSiteinfoItem,
} from 'feedpon-messaging/userSiteinfo';
import tryMatch from 'feedpon-utils/tryMatch.ts';

import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  type ElementRef,
  component,
  keyedList,
  memo,
  ref,
} from '@emonkak/ebit/directives.js';
import { getStoreHook } from 'feedpon-flux/ebit.ts';
import { RelativeTime } from '../primitives/RelativeTime.ts';
import {
  type BlankSpaces,
  VirtualScrollList,
} from '../primitives/VirtualScrollList.ts';
import { SharedSiteinfoItem } from './SharedSiteinfoItem.ts';
import { UserSiteinfoForm } from './UserSiteinfoForm.ts';
import { UserSiteinfoRow } from './UserSiteinfoRow.ts';

interface SiteinfoSettingsProps {}

export function SiteinfoSettings(
  {}: SiteinfoSettingsProps,
  context: RenderContext,
): TemplateResult {
  return context.html`
    <section>
      <h1 className="display-1">Siteinfo</h1>
      <p>Siteinfo is used for extracting the full content.</p>
      <${component(UserSiteinfoSection, {})}>
      <${component(SharedSiteinfoSection, {})}>
    </section>
  `;
}
export interface SharedSiteinfoSectionProps {}

export function SharedSiteinfoSection(
  {}: SharedSiteinfoSectionProps,
  context: RenderContext,
): TemplateResult {
  const { isLoading, items, lastUpdatedAt, onUpdateSiteinfo } = context.use(
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

  const [testUrl, setTestUrl] = context.useState('');
  const defferedTestUrl = context.useDeferredValue(testUrl);

  const matchedItems = context.useMemo(
    () =>
      defferedTestUrl !== ''
        ? items.filter((item) => tryMatch(item.urlPattern, defferedTestUrl))
        : items,
    [defferedTestUrl],
  );

  const handleChangeTestUrl = context.useCallback((event: Event) => {
    setTestUrl((event.currentTarget as HTMLInputElement).value);
  }, []);

  const lastUpdate =
    lastUpdatedAt > 0
      ? context.html`
      <p>
        <strong>${matchedItems.length}</strong> items are available. Last update was <strong><${component(RelativeTime, { time: lastUpdatedAt })}></strong>.
      </p>
    `
      : context.html`<p>Not update yet.</p>`;

  return context.html`
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
      <${component(VirtualScrollList<SiteinfoItem>, {
        assumedItemSize: 24 * 7,
        items: matchedItems,
        renderItem: renderSiteinfoItem,
        renderList: renderSiteinfoList,
      })}>
    </section>
  `;
}

export interface UserSiteinfoSectionProps {}

export function UserSiteinfoSection(
  {}: UserSiteinfoSectionProps,
  context: RenderContext,
): TemplateResult {
  const { onDelete, onUpdate, onAdd, items } = context.use(
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

  const rows = keyedList(
    items,
    (item) => item.id,
    (item) =>
      component(UserSiteinfoRow, {
        item,
        onDelete,
        onUpdate,
      }),
  );

  return context.html`
    <section class="section">
      <h2 class="display-2">User siteinfo</h2>
      <p>This siteinfo is for user only.</p>
      <div class="well">
        <${component(UserSiteinfoForm, {
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
}

function renderSiteinfoList(
  children: unknown,
  blankSpaces: BlankSpaces,
  elementRef: ElementRef,
  context: RenderContext,
): TemplateResult {
  return context.html`
    <div class="u-responsive" ref=${ref(elementRef)}>
      <ul class="list-group">
        <div style=${`height: ${blankSpaces.above}px`}></div>
        <${children}>
        <div style=${`height: ${blankSpaces.below}px`}></div>
      </ul>
    </div>
  `;
}

function renderSiteinfoItem(item: SiteinfoItem): unknown {
  return memo(() => component(SharedSiteinfoItem, { item }), [item]);
}
