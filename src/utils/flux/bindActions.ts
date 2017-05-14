export default function bindActions<T extends { [key: string]: Function }>(actions: T, dispatch: (event: any) => void): T {
    const bindedActions: Partial<T> = {};

    for (const key of Object.keys(actions)) {
        const action = actions[key];
        const bindedAction = (...args: any[]) => {
            const event = action(...args);
            dispatch(event);
            return event;
        };
        bindedActions[key] = bindedAction;
    }

    return bindedActions as T;
}
