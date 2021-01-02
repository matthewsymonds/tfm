import {Box} from 'components/box';
import PaymentPopover from 'components/popovers/payment-popover';
import {Milestone} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import {useTypedSelector} from 'reducer';
import {milestoneQuantitySelectors, minMilestoneQuantity} from 'selectors/milestone-selectors';
import {SharedActionRow, SharedActionsContainer} from './shared-actions';

export function getTextForMilestoneWithQuantity(milestone: Milestone) {
    const text = getTextForMilestone(milestone);

    return (
        <React.Fragment>
            <em>{text}</em>
            <Box display="inline-block" marginLeft="4px">
                ({minMilestoneQuantity[milestone]})
            </Box>
        </React.Fragment>
    );
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
    const player = useLoggedInPlayer();
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();

    function renderMilestoneButton(milestone: Milestone) {
        const isDisabled = !actionGuard.canClaimMilestone(milestone)[0];
        const isMilestoneClaimed = useTypedSelector(
            state => state.common.claimedMilestones.findIndex(m => m.milestone === milestone) >= 0
        );
        const text = getTextForMilestone(milestone);
        const handleConfirmPayment = (
            payment: PropertyCounter<Resource> = {[Resource.MEGACREDIT]: 8}
        ) => {
            if (isDisabled) {
                return;
            }
            apiClient.claimMilestoneAsync({milestone, payment});
        };

        if (player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0) {
            return (
                <PaymentPopover cost={8} onConfirmPayment={handleConfirmPayment}>
                    <SharedActionRow isDisabled={isDisabled}>
                        <em>{isMilestoneClaimed ? <s>{text}</s> : text}</em>
                        <span>8€</span>
                    </SharedActionRow>
                </PaymentPopover>
            );
        }

        return (
            <SharedActionRow isDisabled={isDisabled} onClick={() => handleConfirmPayment()}>
                <em>{isMilestoneClaimed ? <s>{text}</s> : text}</em>
                <span>8€</span>
            </SharedActionRow>
        );
    }

    return (
        <SharedActionsContainer>
            {Object.values(Milestone).map(milestone => {
                const milestoneClaimer = useTypedSelector(state => {
                    const claimedMilestone = state.common.claimedMilestones.find(
                        m => m.milestone === milestone
                    );
                    return (
                        state.players[claimedMilestone?.claimedByPlayerIndex ?? -1]?.corporation
                            .name ?? ''
                    );
                });

                const quantities = useTypedSelector(state =>
                    state.players.map(player =>
                        milestoneQuantitySelectors[milestone](player, state)
                    )
                );

                return (
                    <React.Fragment key={milestone}>
                        <div>
                            {renderMilestoneButton(milestone)}
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
                                {milestoneClaimer && (
                                    <Box>
                                        <em>Claimed by {milestoneClaimer}</em>
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

export default Milestones;
