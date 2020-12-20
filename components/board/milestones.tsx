import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Box} from 'components/box';
import PaymentPopover from 'components/popovers/payment-popover';
import {Milestone} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {AppContext} from 'context/app-context';
import React, {useContext} from 'react';
import {useDispatch} from 'react-redux';
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
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const player = context.getLoggedInPlayer(state);
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);
    const actionGuard = new ActionGuard(state, player.username);

    function renderMilestoneButton(milestone: Milestone) {
        const isDisabled = !actionGuard.canClaimMilestone(milestone)[0];
        const isMilestoneClaimed =
            state.common.claimedMilestones.findIndex(m => m.milestone === milestone) > -1;
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
                const claimedMilestone = state.common.claimedMilestones.find(
                    m => m.milestone === milestone
                );

                return (
                    <React.Fragment key={milestone}>
                        <div>
                            {renderMilestoneButton(milestone)}
                            <Box marginLeft="10px">
                                {state.players.map(player => {
                                    const amount = milestoneQuantitySelectors[milestone](
                                        player,
                                        state
                                    );
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
                                {claimedMilestone && (
                                    <Box>
                                        <em>
                                            Claimed by{' '}
                                            {
                                                state.players[claimedMilestone.claimedByPlayerIndex]
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

export default Milestones;
