import {getColony, SerializedColony} from 'constants/colonies';
import {PlayerState} from 'reducer';

export function getEligibleTradeIncomes(colony: SerializedColony, player: PlayerState): number[] {
    const colonyTileTrackRange = player.colonyTileTrackRange ?? 0;
    const fullColony = getColony(colony);
    const eligibleTradeIncomes: number[] = [];
    const maxTradeIncome = Math.min(
        colony.step + colonyTileTrackRange + 1,
        fullColony.tradeIncome.length
    );
    for (let i = colony.step; i < maxTradeIncome; i++) {
        eligibleTradeIncomes.push(i);
    }
    return eligibleTradeIncomes;
}
