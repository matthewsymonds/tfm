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
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {milestoneQuantitySelectors} from 'selectors/milestone-selectors';
import styled from 'styled-components';

const MilestoneHeader = styled.div`
    margin: 4px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 13px;
    font-weight: 600;
    color: white;
    opacity: 0.3;
`;

export default function MilestonesNew({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();

    const claimMilestone = (milestone: Milestone, payment?: PropertyCounter<Resource>) => {
        const [canPlay] = actionGuard.canClaimMilestone(milestone);
        if (canPlay) {
            apiClient.claimMilestoneAsync({milestone, payment: payment ?? {}});
        }
    };

    return (
        <Flex flexDirection="column" alignItems="flex-end">
            <MilestoneHeader className="display">Milestones</MilestoneHeader>
            <ActionListWithPopovers<Milestone>
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
        </Flex>
    );
}

const MilestoneBadgeContainer = styled.div`
    padding: 4px;
    color: white;
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
                <span>{getTextForMilestone(milestone)}</span>
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
    const actionGuard = useActionGuard();
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
    const players = useTypedSelector(state => state.players);

    return (
        <Flex flexDirection="column" width="100%">
            <Flex alignItems="center" marginBottom="8px" style={{fontSize: 14}}>
                <span>{getRequirementTextForMilestone(milestone)}</span>
            </Flex>
            {players.map(player => {
                const quantity = useTypedSelector(state =>
                    milestoneQuantitySelectors[milestone](player, state)
                );
                <Flex alignItems="center" justifyContent="center">
                    <PlayerCorpAndIcon player={player} />
                    <span style={{marginLeft: 20}}>{quantity}</span>
                </Flex>;
            })}
        </Flex>
    );
}
