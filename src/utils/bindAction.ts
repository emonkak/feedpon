type Action0<TResult> = () => TResult;
type Action1<T1, TResult> = (a1: T1) => TResult;
type Action2<T1, T2, TResult> = (a1: T1, a2: T2) => TResult;
type Action3<T1, T2, T3, TResult> = (a1: T1, a2: T2, a3: T3) => TResult;
type Action4<T1, T2, T3, T4, TResult> = (a1: T1, a2: T2, a3: T3, a4: T4) => TResult;
type Action5<T1, T2, T3, T4, T5, TResult> = (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => TResult;

type Dispatch = (event: any) => void;

export default function bindAction<TResult>(action: Action0<TResult>, dispatch: Dispatch): Action0<void>;
export default function bindAction<T1, TResult>(action: Action1<T1, TResult>, dispatch: Dispatch): Action1<T1, void>;
export default function bindAction<T1, T2, TResult>(action: Action2<T1, T2, TResult>, dispatch: Dispatch): Action2<T1, T2, void>;
export default function bindAction<T1, T2, T3, TResult>(action: Action3<T1, T2, T3, TResult>, dispatch: Dispatch): Action3<T1, T2, T3, void>;
export default function bindAction<T1, T2, T3, T4, TResult>(action: Action4<T1, T2, T3, T4, TResult>, dispatch: Dispatch): Action4<T1, T2, T3, T4, void>;
export default function bindAction<T1, T2, T3, T4, T5, TResult>(action: Action5<T1, T2, T3, T4, T5, TResult>, dispatch: Dispatch): Action5<T1, T2, T3, T4, T5, void>;
export default function bindAction(action: (...args: any[]) => any, dispatch: Dispatch): (...args: any[]) => any {
    return (...args: any[]) => {
        dispatch(action(...args));
    };
}
