import {Box} from 'components/box';
import PaymentPopover from 'components/popovers/payment-popover';
import {Milestone} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {AppContext, milestoneQuantitySelectors, minMilestoneQuantity} from 'context/app-context';
import React, {useContext, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useTypedSelector} from 'reducer';
import {SharedActionRow, SharedActionsContainer} from './shared-actions';

export function getTextForMilestoneWithQuantity(milestone: Milestone) {
    const text = getTextForMilestone(milestone);

    return [
        <em key={text}>{text}</em>,
        <Box display="inline-block" key={text + '-quantity'} marginLeft="4px">
            ({minMilestoneQuantity[milestone]})
        </Box>,
    ];
}

export function getTextForMilestone(milestone: Milestone) {
    switch (milestone) {
        case Milestone.BUILDER:
            return 'Builder';
        case Milestone.GARDENER:
            return 'Gardener';
        case Milestone.PLANNER:
            return 'Planner';
        case Milestone.TERRAFORMER:
            return 'Terraformer';
        case Milestone.MAYOR:
            return 'Mayor';
        default:
            throw new Error('Unrecognized milestone');
    }
}

function Milestones() {
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const player = context.getLoggedInPlayer(state);
    const dispatch = useDispatch();
    const [milestonePendingPayment, setMilestonePendingPayment] = useState<Milestone | null>(null);

    function handleFundMilestone(milestone: Milestone) {
        if (!context.canClaimMilestone(milestone, state)) {
            return;
        }

        if (player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0) {
            // Helion can pay with heat and money
            setMilestonePendingPayment(milestone);
        } else {
            // Everyone else can only pay with money
            context.claimMilestone(milestone, {[Resource.MEGACREDIT]: 8}, state);
            context.processQueue(dispatch);
        }
    }

    function handleConfirmPayment(payment: PropertyCounter<Resource>) {
        if (!milestonePendingPayment) {
            throw new Error('No action pending payment');
        }
        context.claimMilestone(milestonePendingPayment, payment, state);
        context.processQueue(dispatch);
        setMilestonePendingPayment(null);
    }

    return (
        <SharedActionsContainer>
            {Object.values(Milestone).map(milestone => {
                const claimedMilestone = state.common.claimedMilestones.find(
                    m => m.milestone === milestone
                );
                const text = getTextForMilestoneWithQuantity(milestone);
                return (
                    <React.Fragment key={milestone}>
                        <div>
                            <SharedActionRow
                                id={milestone}
                                selectable={context.canClaimMilestone(milestone, state)}
                                onClick={() => handleFundMilestone(milestone)}
                            >
                                <span>{claimedMilestone ? <s>{text}</s> : text}</span>
                                <span>8€</span>
                            </SharedActionRow>
                            <Box marginLeft="10px">
                                {state.players.map(player => {
                                    const amount = milestoneQuantitySelectors[milestone](
                                        player,
                                        state
                                    );
                                    if (!amount) return null;
                                    return (
                                        <Box key={player.index} textAlign="left" marginBottom="6px">
                                            <em>{player.corporation?.name}:</em>
                                            <Box display="inline-block" marginLeft="6px">
                                                {amount}
                                            </Box>
                                        </Box>
                                    );
                                })}
                                {claimedMilestone && (
                                    <Box>
                                        <em>
                                            Claimed by{' '}
                                            {
                                                state.players[claimedMilestone.claimedByPlayerIndex]
                                                    .corporation?.name
                                            }
                                        </em>
                                    </Box>
                                )}
                            </Box>
                        </div>

                        {milestonePendingPayment && (
                            <PaymentPopover
                                isOpen={!!milestonePendingPayment}
                                target={milestonePendingPayment}
                                cost={8}
                                toggle={() => setMilestonePendingPayment(null)}
                                onConfirmPayment={(...args) => handleConfirmPayment(...args)}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </SharedActionsContainer>
    );
}

export default Milestones;
