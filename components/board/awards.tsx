import {ApiClient} from 'api-client';
import {Box} from 'components/box';
import PaymentPopover from 'components/popovers/payment-popover';
import {Award} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {AppContext} from 'context/app-context';
import React, {useContext} from 'react';
import {useDispatch} from 'react-redux';
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
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const player = context.getLoggedInPlayer(state);
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);

    function renderAwardButton(award: Award) {
        const isDisabled = !context.canFundAward(award, state);
        const isAwardFunded = state.common.fundedAwards.findIndex(a => a.award === award) > -1;
        const text = getTextForAward(award);
        const cost = getCostForAward(award, state);
        const handleConfirmPayment = (
            payment: PropertyCounter<Resource> = {[Resource.MEGACREDIT]: cost}
        ) => {
            apiClient.fundAwardAsync({award, payment});
        };

        if (player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0) {
            return (
                <PaymentPopover cost={cost} onConfirmPayment={handleConfirmPayment}>
                    <SharedActionRow disabled={isDisabled}>
                        <em>{isAwardFunded ? <s>{text}</s> : text}</em>
                        <span>{cost}€</span>
                    </SharedActionRow>
                </PaymentPopover>
            );
        } else {
            return (
                <SharedActionRow disabled={isDisabled} onClick={() => handleConfirmPayment()}>
                    <em>{isAwardFunded ? <s>{text}</s> : text}</em>
                    <span>{cost}€</span>
                </SharedActionRow>
            );
        }
    }

    return (
        <SharedActionsContainer>
            {Object.values(Award).map(award => {
                const fundedAward = state.common.fundedAwards.find(a => a.award === award);
                return (
                    <React.Fragment key={award}>
                        <div>
                            {renderAwardButton(award)}
                            <Box marginLeft="10px">
                                {state.players.map(player => {
                                    const amount = awardToQuantity[award](player, state);
                                    if (!amount) return null;
                                    return (
                                        <Box key={player.index} textAlign="left" marginBottom="6px">
                                            <em>{player.corporation.name}:</em>
                                            <Box display="inline-block" marginLeft="6px">
                                                {amount}
                                            </Box>
                                        </Box>
                                    );
                                })}
                                {fundedAward && (
                                    <Box>
                                        <em>
                                            Funded by{' '}
                                            {
                                                state.players[fundedAward.fundedByPlayerIndex]
                                                    .corporation.name
                                            }
                                        </em>
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
