import {GameState} from '../reducer';
import {Card} from '../constants/card-types';

const stateHelpers = {
    canCardBePlayed(
        state: GameState,
        card: Card
    ): {result: false; reasons: string} | {result: true} {
        // todo -- account for steel/titanium/discounts
        if (state.players[state.common.currentPlayerIndex].resources.Megacredit < card.cost) {
            return {
                result: false,
                reasons: 'Cannot afford to play this card',
            };
        }

        const canCardBePlayed = card.canBePlayed ? card.canBePlayed(state) : true;
        return canCardBePlayed
            ? {result: true}
            : {result: false, reasons: card.requirementFailedMessage};
    }
};

export default stateHelpers;
