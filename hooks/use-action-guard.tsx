import {ActionGuard} from 'client-server-shared/action-guard';
import {useTypedSelector} from 'reducer';
import {useLoggedInPlayer} from './use-logged-in-player';

let actionGuardsByUsername: {[username: string]: ActionGuard} = {};

export const useActionGuard = (user?: string) => {
    const player = useLoggedInPlayer();
    return useTypedSelector(
        state => {
            const username = user ?? player.username;
            if (!actionGuardsByUsername[username]) {
                actionGuardsByUsername[username] = new ActionGuard(state, username);
            }
            actionGuardsByUsername[username].state = state;
            return actionGuardsByUsername[username];
        },
        (prev, next) => {
            return prev.state.logLength === next.state.logLength;
        }
    );
};
