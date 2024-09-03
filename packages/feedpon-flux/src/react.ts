import shallowEqual from 'feedpon-utils/shallowEqual';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Store } from './index';

export const StoreContext = createContext<Store<unknown, unknown> | null>(null);

export interface UseStoreOptions<
  TState,
  TEvent,
  TStateProps extends {},
  TDispatchProps extends {},
> {
  mapDispatchToProps?: (dispatch: (event: TEvent) => void) => TDispatchProps;
  mapStateToProps?: (state: TState) => TStateProps;
}

export function useStore<
  TState,
  TEvent,
  TStateProps extends {},
  TDispatchProps extends {},
>({
  mapDispatchToProps = () => ({}) as TDispatchProps,
  mapStateToProps = () => ({}) as TStateProps,
}: UseStoreOptions<TState, TEvent, TStateProps, TDispatchProps>): TStateProps &
  TDispatchProps {
  const store = useContext(StoreContext) as Store<TState, TEvent> | null;

  if (store === null) {
    throw new Error(
      'Could not find StoreContext value; please ensure the component is wrapped in a <StoreCotnext.Provider>.',
    );
  }

  const state = store.getState();
  const [stateProps, setStateProps] = useState(() => mapStateToProps(state));
  const dispatchProps = useMemo(() => mapDispatchToProps(store.dispatch), []);

  useEffect(() => {
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

  return { ...stateProps, ...dispatchProps };
}
