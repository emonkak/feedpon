import { type Atom, atom } from '@emonkak/ebit/directives.js';

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
    this.currentSession$ = atom(seed.currentSession);
    this.defaultSettings$ = atom(seed.defaultSettings);
    this.lastSiteinfoUpdated$ = atom(seed.lastSiteinfoUpdated);
    this.muteFilters$ = atom(seed.muteFilters);
    this.pastSessions$ = atom(seed.pastSessions);
    this.siteinfos$ = atom(seed.siteinfos);
    this.urlTransforms$ = atom(seed.urlTransforms);
    this.version$ = atom(seed.version);
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
