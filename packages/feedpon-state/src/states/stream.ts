import { Atom } from 'barebind/extensions/signal';

import type { FeedlyContext } from '../api/feedly.ts';
import type * as Feedly from '../api/feedlyTypes.d.ts';
import type { WedataClient } from '../api/wedata.ts';
import type * as Wedata from '../api/wedataTypes.d.ts';
import type { State, Store } from '../store.ts';

export interface StreamSeed {
  currentSession: StreamSession | null;
  defaultSettings: StreamSettings;
  lastSiteinfoUpdated: number;
  muteFilters: MuteFilter[];
  pastSessions: StreamSession[];
  siteinfos: Siteinfo[];
  urlTransforms: URLTransform[];
  version: number;
}

export type Stream = Feedly.components['schemas']['Stream'];

interface StreamSession {
  currentPosition: number;
  id: string;
  loading: boolean;
  persistent: boolean;
  readPosition: number;
  settings: StreamSettings | null;
  stream: Stream | null;
}

interface StreamSettings {
  layout: EntryLayout;
  loadCount: number;
  order: EntryOrder;
  unreadOnly: boolean;
}

export type EntryLayout = 'full' | 'summary';

export type EntryOrder = 'newest' | 'oldest' | 'engagement';

export interface MuteFilter {
  keyword: string;
  targets: MuteTarget[];
}

export type MuteTarget = 'title' | 'content' | 'tag';

export interface URLTransform {
  flags: string;
  pattern: string;
  replacement: string;
}

export type Siteinfo = Wedata.components['schemas']['Item'] & {
  database_resource_url: 'http://wedata.net/databases/AutoPagerize';
  data: {
    url: string;
    nextLink: string;
    pageElement: string;
    exampleUrl?: string;
    insertBefore?: string;
  };
};

export interface StreamContext extends FeedlyContext {
  streamStore: Store<StreamState>;
  wedataClient: WedataClient;
}

const defaultSeed: StreamSeed = {
  currentSession: null,
  defaultSettings: {
    layout: 'full',
    loadCount: 50,
    order: 'newest',
    unreadOnly: true,
  },
  lastSiteinfoUpdated: -1,
  muteFilters: [],
  pastSessions: [],
  siteinfos: [],
  urlTransforms: [],
  version: 1,
};

export class StreamState implements State<StreamSeed> {
  readonly currentSession$: Atom<StreamSession | null>;

  readonly defaultSettings$: Atom<StreamSettings>;

  readonly lastSiteinfoUpdated$: Atom<number>;

  readonly muteFilters$: Atom<MuteFilter[]>;

  readonly pastSessions$: Atom<StreamSession[]>;

  readonly siteinfos$: Atom<Siteinfo[]>;

  readonly urlTransforms$: Atom<URLTransform[]>;

  readonly version$: Atom<number>;

  constructor(seed: StreamSeed = defaultSeed) {
    this.currentSession$ = new Atom(seed.currentSession);
    this.defaultSettings$ = new Atom(seed.defaultSettings);
    this.lastSiteinfoUpdated$ = new Atom(seed.lastSiteinfoUpdated);
    this.muteFilters$ = new Atom(seed.muteFilters);
    this.pastSessions$ = new Atom(seed.pastSessions);
    this.siteinfos$ = new Atom(seed.siteinfos);
    this.urlTransforms$ = new Atom(seed.urlTransforms);
    this.version$ = new Atom(seed.version);
  }

  toSnapshot(): StreamSeed {
    return {
      currentSession: this.currentSession$.value,
      defaultSettings: this.defaultSettings$.value,
      lastSiteinfoUpdated: this.lastSiteinfoUpdated$.value,
      muteFilters: this.muteFilters$.value,
      pastSessions: this.pastSessions$.value,
      siteinfos: this.siteinfos$.value,
      urlTransforms: this.urlTransforms$.value,
      version: this.version$.value,
    };
  }
}
