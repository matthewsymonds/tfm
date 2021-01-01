import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import ActionListWithPopovers from 'components/action-list-with-popovers';
import {Flex} from 'components/box';
import {GenericCardCost} from 'components/card/CardCost';
import {GenericCardTitleBar} from 'components/card/CardTitle';
import {PlayerCorpAndIcon} from 'components/icons/player';
import PaymentPopover from 'components/popovers/payment-popover';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {Milestone} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import React from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import {milestoneQuantitySelectors} from 'selectors/milestone-selectors';
import styled from 'styled-components';

export default function MilestonesNew({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
    const dispatch = useDispatch();
    const apiClient = new ApiClient(dispatch);
    const state = useTypedSelector(state => state);
    const actionGuard = new ActionGuard(state, loggedInPlayer.username);

    const claimMilestone = (milestone: Milestone, payment?: PropertyCounter<Resource>) => {
        const [canPlay] = actionGuard.canClaimMilestone(milestone);
        if (canPlay) {
            apiClient.claimMilestoneAsync({milestone, payment: payment ?? {}});
        }
    };

    return (
        <ActionListWithPopovers<Milestone>
            id="milestones"
            actions={Object.values(Milestone)}
            ActionComponent={({action}) => (
                <MilestoneBadge
                    milestone={action}
                    claimMilestone={claimMilestone}
                    loggedInPlayer={loggedInPlayer}
                />
            )}
            ActionPopoverComponent={({action}) => (
                <MilestonePopover milestone={action} loggedInPlayer={loggedInPlayer} />
            )}
        />
    );
}

const MilestoneBadgeContainer = styled.div`
    padding: 4px;
    color: white;
`;

const HoverMask = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    > * {
        transition: opacity 350ms;
        opacity: 1;
    }

    &:hover > * {
        opacity: 0;
    }

    &:after {
        content: '';
        opacity: 0;
        position: absolute;
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 350ms;
    }

    &:hover:after {
        content: 'Claim';
        opacity: 1;
    }
`;

function MilestoneBadge({
    milestone,
    claimMilestone,
    loggedInPlayer,
}: {
    milestone: Milestone;
    claimMilestone: (action: Milestone | null, payment?: PropertyCounter<Resource>) => void;
    loggedInPlayer: PlayerState;
}) {
    const showPaymentPopover =
        loggedInPlayer.corporation.name === 'Helion' && loggedInPlayer.resources[Resource.HEAT] > 0;

    return (
        <PaymentPopover
            cost={8}
            onConfirmPayment={payment => claimMilestone(milestone, payment)}
            shouldHide={!showPaymentPopover}
        >
            <MilestoneBadgeContainer
                className="display"
                onClick={() => {
                    !showPaymentPopover && claimMilestone(milestone);
                }}
            >
                <HoverMask>
                    <span>{getTextForMilestone(milestone)}</span>
                </HoverMask>
            </MilestoneBadgeContainer>
        </PaymentPopover>
    );
}

const ErrorText = styled.span`
    color: ${colors.TEXT_ERROR};
`;

function MilestonePopover({
    milestone,
    loggedInPlayer,
}: {
    milestone: Milestone;
    loggedInPlayer: PlayerState;
}) {
    const state = useTypedSelector(state => state);
    const actionGuard = new ActionGuard(state, loggedInPlayer.username);
    const [canPlay, reason] = actionGuard.canClaimMilestone(milestone);

    return (
        <TexturedCard width={200}>
            <Flex flexDirection="column">
                <GenericCardTitleBar bgColor={'#d67500'}>
                    {getTextForMilestone(milestone)}
                </GenericCardTitleBar>
                <GenericCardCost cost={8} />
                <Flex alignItems="center" margin="4px" marginBottom="8px" fontSize="13px">
                    <MilestoneRankings milestone={milestone} />
                </Flex>
                {!canPlay && reason && (
                    <Flex
                        margin="8px"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        position="relative"
                        fontSize="13px"
                    >
                        <ErrorText>{reason}</ErrorText>
                    </Flex>
                )}
            </Flex>
        </TexturedCard>
    );
}

function getTextForMilestone(milestone: Milestone) {
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

function getRequirementTextForMilestone(milestone: Milestone) {
    switch (milestone) {
        case Milestone.BUILDER:
            return 'Requires 8 building tags';
        case Milestone.GARDENER:
            return 'Requires 3 greeneries';
        case Milestone.PLANNER:
            return 'Requires 16 cards in hand';
        case Milestone.TERRAFORMER:
            return 'Requires 35 terraform rating';
        case Milestone.MAYOR:
            return 'Requires 3 cities';
        default:
            throw new Error('Unrecognized milestone');
    }
}

function MilestoneRankings({milestone}: {milestone: Milestone}) {
    const state = useTypedSelector(state => state);

    return (
        <Flex flexDirection="column" width="100%">
            <Flex alignItems="center" marginBottom="8px" style={{fontSize: 14}}>
                <span>{getRequirementTextForMilestone(milestone)}</span>
            </Flex>
            {state.players.map(player => (
                <Flex alignItems="center" justifyContent="center">
                    <PlayerCorpAndIcon player={player} />
                    <span style={{marginLeft: 20}}>
                        {milestoneQuantitySelectors[milestone](player, state)}
                    </span>
                </Flex>
            ))}
        </Flex>
    );
}
