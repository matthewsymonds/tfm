import {CanPlayAndReason} from 'client-server-shared/action-guard';
import {GameState, PlayerState} from 'reducer';

export function canTradeWithSomeColonyIgnoringPayment(
    player: PlayerState,
    state: GameState
) {
    const colonies = state.common.colonies ?? [];
    return colonies.some(
        colony => canTradeIgnoringPayment(player, colony.name, state)[0]
    );
}

export function canTradeIgnoringPayment(
    player: PlayerState,
    name: string,
    state: GameState
): CanPlayAndReason {
    const colony = state.common.colonies?.find(colony => colony.name === name);
    if (!colony) {
        return [false, `Colony ${name} is not in this game`];
    }

    if (colony.step < 0) {
        // e.g. animals/microbes/floaters
        return [false, 'Colony is not online'];
    }

    const lastTrade = colony.lastTrade ?? {player: '', round: -1};
    if (lastTrade.round === state.common.generation) {
        return [false, 'Colony has already been traded with this generation'];
    }

    if (
        (state.common.colonies ?? []).filter(
            colony =>
                colony.lastTrade?.round === state.common.generation &&
                colony.lastTrade?.player === player.username
        ).length >= player.fleets
    ) {
        return [false, 'Used all trade fleets this generation'];
    }

    const deployedFleets = (state.common.colonies ?? []).filter(colony => {
        const {lastTrade} = colony;
        if (!lastTrade) return false;
        if (lastTrade.round < state.common.generation) return false;
        return lastTrade.player === player.username;
    }).length;

    if (deployedFleets === player.fleets) {
        return [false, 'Already used all fleets this generation'];
    }
    return [true, 'Good to go'];
}
