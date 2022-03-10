import {ActionGuard} from 'client-server-shared/action-guard';
import {useTypedSelector} from 'reducer';
import {useLoggedInPlayer} from './use-logged-in-player';

export const actionGuardsByUsername: {[username: string]: ActionGuard} = {};

export const useActionGuard = (user?: string) => {
    const player = useLoggedInPlayer();
    return useTypedSelector(
        state => {
            const username = user ?? player.username;
            if (!actionGuardsByUsername[username]) {
                actionGuardsByUsername[username] = new ActionGuard(
                    state,
                    username
                );
            }
            actionGuardsByUsername[username].state = state;
            return actionGuardsByUsername[username];
        },
        (prev, next) => {
            return prev.state.logLength === next.state.logLength;
        }
    );
};

export type ActionGuards = {
    [username: string]: ActionGuard;
};

export const useActionGuards = (): ActionGuards => {
    const players = useTypedSelector(state => state.players);
    return players.reduce((acc, player) => {
        acc[player.username] = useActionGuard(player.username);
        return acc;
    }, {});
};
