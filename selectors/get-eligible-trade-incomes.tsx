import {SerializedColony} from 'constants/colonies';
import {PlayerState} from 'reducer';

export function getEligibleTradeIncomes(colony: SerializedColony, player: PlayerState): number[] {
    const colonyTileTrackRange = player.colonyTileTrackRange ?? 0;
    const eligibleTradeIncomes: number[] = [];
    for (let i = colony.step; i < colony.step + colonyTileTrackRange + 1; i++) {
        eligibleTradeIncomes.push(i);
    }
    return eligibleTradeIncomes;
}
