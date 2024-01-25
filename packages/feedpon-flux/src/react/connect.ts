import React, {
  useSyncExternalStore,
  useMemo,
  useContext,
  createElement,
} from 'react';

import StoreContext from './StoreContext';
import { Store } from '../index';

interface Connection<TState, TEvent, TStateProps, TDispatchProps, TOwnProps> {
  mapDispatchToProps?: (
    dispatch: (event: TEvent) => void,
    ownProps: TOwnProps,
  ) => TDispatchProps;
  mapStateToProps?: (state: TState, ownProps: TOwnProps) => TStateProps;
}

type ValueOrFunction<T> = T | (() => T);

export default function connect<
  TState,
  TEvent,
  TStateProps,
  TDispatchProps,
  TProps extends TStateProps & TDispatchProps & {},
>(
  Component: React.ComponentType<TProps>,
  connection: ValueOrFunction<
    Connection<
      TState,
      TEvent,
      TStateProps,
      TDispatchProps,
      Omit<TProps, keyof (TStateProps & TDispatchProps)>
    >
  >,
): React.ComponentType<Omit<TProps, keyof (TStateProps & TDispatchProps)>> {
  return function ConnecttedComponent(
    ownProps: Omit<TProps, keyof (TStateProps & TDispatchProps)>,
  ) {
    const store = useContext(StoreContext) as Store<TState, TEvent> | null;

    if (store === null) {
      throw new Error(
        'Could not find StoreContext value; please ensure the component is wrapped in a <StoreCotnext.Provider>',
      );
    }

    const state = useSyncExternalStore(store.subscribe, store.getState);

    const { mapDispatchToProps = () => ({}), mapStateToProps = () => ({}) } =
      useMemo(
        typeof connection === 'function' ? connection : () => connection,
        [],
      );

    const dispatchProps = useMemo(
      () => mapDispatchToProps(store.dispatch, ownProps),
      [store.dispatch],
    );

    const stateProps = useMemo(() => mapStateToProps(state, ownProps), [state]);

    const props = {
      ...stateProps,
      ...dispatchProps,
      ...ownProps,
    } as TProps & { children?: React.ReactNode };

    return createElement(Component, props, props.children);
  };
}
