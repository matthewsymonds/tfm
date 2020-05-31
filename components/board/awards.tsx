import React, {useState, useContext} from 'react';
import {useDispatch} from 'react-redux';
import {Award} from 'constants/board';
import {AppContext} from 'context/app-context';
import {GameState, useTypedSelector} from 'reducer';
import {SharedActionRow, SharedActionsContainer} from './shared-actions';
import {Resource} from 'constants/resource';
import PaymentPopover from 'components/popovers/payment-popover';
import {PropertyCounter} from 'constants/property-counter';

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

function getPriceForAward(award: Award, state: GameState) {
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
    const [awardPendingPayment, setAwardPendingPayment] = useState<Award | null>(null);
    const dispatch = useDispatch();

    function handleFundAward(award: Award) {
        if (!context.canFundAward(award, state)) {
            return;
        }

        const cost = getPriceForAward(award, state);
        if (player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0) {
            // Helion can pay with heat and money
            setAwardPendingPayment(award);
        } else {
            // Everyone else can only pay with money
            context.fundAward(award, {[Resource.MEGACREDIT]: cost}, state);
            context.processQueue(dispatch);
        }
    }

    function handleConfirmPayment(payment: PropertyCounter<Resource>) {
        if (!awardPendingPayment) {
            throw new Error('No action pending payment');
        }
        context.fundAward(awardPendingPayment, payment, state);
        context.processQueue(dispatch);
        setAwardPendingPayment(null);
    }

    return (
        <SharedActionsContainer>
            {Object.values(Award).map(award => {
                const hasBeenFunded = !!state.common.fundedAwards.find(a => a.award === award);
                const text = getTextForAward(award);
                const price = getPriceForAward(award, state);
                return (
                    <React.Fragment key={award}>
                        <SharedActionRow
                            id={award}
                            selectable={context.canFundAward(award, state)}
                            onClick={() => handleFundAward(award)}
                        >
                            <span>{hasBeenFunded ? <s>{text}</s> : text}</span>
                            <span>{price}</span>
                        </SharedActionRow>
                        {awardPendingPayment && (
                            <PaymentPopover
                                isOpen={!!awardPendingPayment}
                                target={awardPendingPayment}
                                cost={getPriceForAward(award, state)}
                                toggle={() => setAwardPendingPayment(null)}
                                onConfirmPayment={(...args) => handleConfirmPayment(...args)}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </SharedActionsContainer>
    );
}

export default Awards;
