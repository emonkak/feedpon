import { EventStore, Snapshot } from './types';

export default async function restoreSnapshot<TState, TEvent>(
    eventStore: EventStore<TState, TEvent>,
    reducer: (state: TState, event: TEvent) => TState,
    initialState: TState
): Promise<Snapshot<TState>> {
    const latestSnapshot = await eventStore.restoreLatestSnapshot();
    const currentSnapshot = latestSnapshot ?
        {
            state: Object.assign({}, initialState, latestSnapshot.state),
            version: latestSnapshot.version
        } :
        {
            state: initialState,
            version: 0
        };

    const unappliedEvents = await eventStore.restoreUnappliedEvents(currentSnapshot.version);

    return unappliedEvents.reduce((snapshot, event) => {
        return {
            version: event.id,
            state: reducer(snapshot.state, event.payload)
        };
    }, currentSnapshot);
}
