import type { Difference } from 'barebind/extras/reactive';
import type { Stream } from '../states/stream.ts';
import type { Feed } from '../states/subscription.ts';

export interface PersistentStore {
  addFeed(feed: Feed): Promise<void>;
  addPatches(patches: Patch[]): Promise<void>;
  addStream(stream: Stream): Promise<void>;
  deleteFeed(id: string): Promise<void>;
  deleteStream(id: string): Promise<void>;
  findFeed(id: string): Promise<Feed | null>;
  findPatches(): Promise<Patch[]>;
  findStream(id: string): Promise<Stream | null>;
}

export interface Patch extends Difference {
  type?: string;
  version: number;
}
