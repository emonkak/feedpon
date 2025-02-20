import type { Usable } from '@emonkak/ebit';
import shallowEqual from 'feedpon-utils/shallowEqual.ts';
import type { Store } from './index.ts';

const storeTag = Symbol('Store');

export interface GetStoreOptions<
  TState,
  TEvent,
  TStateProps extends {},
  TStoreProps extends {},
  TDispatchProps extends {},
> {
  mapStateToProps?: (state: TState) => TStateProps;
  mapStoreToProps?: (store: Store<TState, TEvent>) => TStoreProps;
  mapDispatchToProps?: (dispatch: (event: TEvent) => void) => TDispatchProps;
}

export function getStoreHook<
  TState,
  TEvent,
  TStateProps extends {},
  TStoreProps extends {},
  TDispatchProps extends {},
>({
  mapDispatchToProps = () => ({}) as TDispatchProps,
  mapStateToProps = () => ({}) as TStateProps,
  mapStoreToProps = () => ({}) as TStoreProps,
}: GetStoreOptions<
  TState,
  TEvent,
  TStateProps,
  TStoreProps,
  TDispatchProps
>): Usable<TStateProps & TStoreProps & TDispatchProps> {
  return (context) => {
    const store = context.getContextValue(storeTag) as Store<
      TState,
      TEvent
    > | null;

    if (store === null) {
      throw new Error(
        'Could not find store value; please ensure the store is registered by conext.use(setStore(store)).',
      );
    }

    const state = store.getState();
    const [stateProps, setStateProps] = context.useState(() =>
      mapStateToProps(state),
    );
    const storeProps = context.useMemo(() => mapStoreToProps(store), []);
    const dispatchProps = context.useMemo(
      () => mapDispatchToProps(store.dispatch),
      [],
    );

    context.useEffect(() => {
      const update = (newState: TState): void => {
        setStateProps((oldStateProps) => {
          const newStateProps = mapStateToProps(newState);
          return shallowEqual(oldStateProps, newStateProps)
            ? oldStateProps
            : newStateProps;
        });
      };

      const newState = store.getState();

      if (state !== newState) {
        update(newState);
      }

      return store.subscribe(update);
    }, []);

    return { ...stateProps, ...storeProps, ...dispatchProps };
  };
}

export function setStoreHook<TState, TEvent>(
  store: Store<TState, TEvent>,
): Usable<void> {
  return (context) => {
    context.setContextValue(storeTag, store);
  };
}
