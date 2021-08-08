export default function bindActions<T extends { [key: string]: Function }>(actions: T): (dispatch: (event: any) => void) => T {
    return (dispatch) => {
        const bindedActions: { [key: string]: Function } = {};

        for (const key of Object.keys(actions)) {
            const action = actions[key];

            bindedActions[key] = function bindedAction(this: any, ...args: any[]) {
                const event = action.apply(this, args);
                dispatch(event);
                return event;
            };
        }

        return bindedActions as T;
    };
}
