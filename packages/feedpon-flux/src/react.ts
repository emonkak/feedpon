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

  const [stateProps, setStateProps] = useState(() =>
    mapStateToProps(store.getState()),
  );
  const dispatchProps = useMemo(() => mapDispatchToProps(store.dispatch), []);

  useEffect(() => {
    return store.subscribe((newState) => {
      setStateProps((oldStateProps) => {
        const newStateProps = mapStateToProps(newState);
        return shallowEqual(oldStateProps, newStateProps)
          ? oldStateProps
          : newStateProps;
      });
    });
  }, []);

  return { ...stateProps, ...dispatchProps };
}
