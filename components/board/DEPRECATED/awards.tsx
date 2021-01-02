import {Box} from 'components/box';
import PaymentPopover from 'components/popovers/payment-popover';
import {Award} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import {GameState, useTypedSelector} from 'reducer';
import {awardToQuantity} from 'selectors/score';
import {SharedActionRow, SharedActionsContainer} from './shared-actions';

export function getTextForAward(award: Award) {
    switch (award) {
        case Award.BANKER:
            return 'Banker';
        case Award.LANDLORD:
            return 'Landlord';
        case Award.MINER:
            return 'Miner';
        case Award.SCIENTIST:
            return 'Scientist';
        case Award.THERMALIST:
            return 'Thermalist';
        default:
            throw new Error('Unrecognized award');
    }
}

function getCostForAward(award: Award, state: GameState) {
    const fundedIndex = state.common.fundedAwards.findIndex(claim => claim.award === award);
    if (fundedIndex !== -1) {
        return [8, 14, 20][fundedIndex];
    } else {
        return [8, 14, 20][state.common.fundedAwards.length];
    }
}

function Awards() {
    const player = useLoggedInPlayer();
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();

    function renderAwardButton(award: Award) {
        const isDisabled = !actionGuard.canFundAward(award)[0];
        const isAwardFunded = useTypedSelector(
            state => state.common.fundedAwards.findIndex(a => a.award === award) >= 0
        );
        const text = getTextForAward(award);
        const cost = useTypedSelector(state => getCostForAward(award, state));
        const handleConfirmPayment = (
            payment: PropertyCounter<Resource> = {[Resource.MEGACREDIT]: cost}
        ) => {
            if (isDisabled) {
                return;
            }
            apiClient.fundAwardAsync({award, payment});
        };

        if (player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0) {
            return (
                <PaymentPopover cost={cost} onConfirmPayment={handleConfirmPayment}>
                    <SharedActionRow isDisabled={isDisabled}>
                        <em>{isAwardFunded ? <s>{text}</s> : text}</em>
                        <span>{cost}€</span>
                    </SharedActionRow>
                </PaymentPopover>
            );
        } else {
            return (
                <SharedActionRow isDisabled={isDisabled} onClick={() => handleConfirmPayment()}>
                    <em>{isAwardFunded ? <s>{text}</s> : text}</em>
                    <span>{cost}€</span>
                </SharedActionRow>
            );
        }
    }

    return (
        <SharedActionsContainer>
            {Object.values(Award).map(award => {
                const fundedAwardCorporationName = useTypedSelector(state => {
                    const fundedAward = state.common.fundedAwards.find(a => a.award === award);
                    if (!fundedAward) return '';

                    return state.players[fundedAward.fundedByPlayerIndex].corporation.name;
                });

                const quantities = useTypedSelector(state =>
                    state.players.map(player => awardToQuantity[award](player, state))
                );

                return (
                    <React.Fragment key={award}>
                        <div>
                            {renderAwardButton(award)}
                            <Box marginLeft="10px">
                                {quantities.map(quantity => {
                                    if (!quantity) return null;
                                    return (
                                        <Box key={player.index} textAlign="left" marginBottom="6px">
                                            <em>{player.corporation.name}:</em>
                                            <Box display="inline-block" marginLeft="6px">
                                                {quantity}
                                            </Box>
                                        </Box>
                                    );
                                })}
                                {fundedAwardCorporationName && (
                                    <Box>
                                        <em>Funded by {fundedAwardCorporationName}</em>
                                    </Box>
                                )}
                            </Box>
                        </div>
                    </React.Fragment>
                );
            })}
        </SharedActionsContainer>
    );
}

export default Awards;
