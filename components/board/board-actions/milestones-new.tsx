import ActionListWithPopovers from 'components/action-list-with-popovers';
import {Flex} from 'components/box';
import {GenericCardCost} from 'components/card/CardCost';
import {GenericCardTitleBar} from 'components/card/CardTitle';
import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
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
    margin: 4px 2px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 13px;
    color: ${colors.GOLD};
`;

export default function MilestonesNew({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();
    const canPlay = milestone => actionGuard.canClaimMilestone(milestone)[0];
    const isClaimed = milestone => actionGuard.isMilestoneClaimed(milestone);
    const claimedMilestones = useTypedSelector(state =>
        state.common.claimedMilestones.map(cm => ({
            ...cm,
            claimedByPlayer: state.players[cm.claimedByPlayerIndex],
        }))
    );

    const claimMilestone = (milestone: Milestone, payment?: PropertyCounter<Resource>) => {
        if (canPlay(milestone)) {
            apiClient.claimMilestoneAsync({milestone, payment: payment ?? {}});
        }
    };

    return (
        <Flex flexDirection="column" alignItems="flex-end" margin="0 8px">
            <MilestoneHeader className="display">Milestones</MilestoneHeader>
            <ActionListWithPopovers<Milestone>
                actions={Object.values(Milestone)}
                emphasizeOnHover={canPlay}
                ActionComponent={({action}) => (
                    <MilestoneBadge
                        milestone={action}
                        claimMilestone={claimMilestone}
                        loggedInPlayer={loggedInPlayer}
                        canClaim={canPlay(action)}
                        isClaimed={isClaimed(action)}
                    />
                )}
                ActionPopoverComponent={({action}) => (
                    <MilestonePopover
                        milestone={action}
                        isClaimed={isClaimed(action)}
                        claimedByPlayer={
                            claimedMilestones.find(cm => cm.milestone === action)
                                ?.claimedByPlayer ?? null
                        }
                    />
                )}
            />
        </Flex>
    );
}

const MilestoneBadgeContainer = styled.div<{canClaim: boolean; isClaimed: boolean}>`
    display: flex;
    align-items: center;
    padding: 4px;
    color: white;
    opacity: ${props => (props.canClaim || props.isClaimed ? 1 : 0.5)};
    font-style: ${props => (props.isClaimed ? 'italic' : 'normal')};
`;

function MilestoneBadge({
    milestone,
    claimMilestone,
    loggedInPlayer,
    canClaim,
    isClaimed,
}: {
    milestone: Milestone;
    claimMilestone: (action: Milestone | null, payment?: PropertyCounter<Resource>) => void;
    loggedInPlayer: PlayerState;
    canClaim: boolean;
    isClaimed: boolean;
}) {
    const claimedByPlayerIndex =
        useTypedSelector(state =>
            state.common.claimedMilestones.find(cm => cm.milestone === milestone)
        )?.claimedByPlayerIndex ?? null;

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
                canClaim={canClaim}
                isClaimed={isClaimed}
                onClick={() => {
                    !showPaymentPopover && claimMilestone(milestone);
                }}
            >
                {claimedByPlayerIndex !== null && (
                    <div style={{marginRight: 4}}>
                        <PlayerIcon playerIndex={claimedByPlayerIndex} size={10} />
                    </div>
                )}
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
    isClaimed,
    claimedByPlayer,
}: {
    milestone: Milestone;
    isClaimed: boolean;
    claimedByPlayer: PlayerState | null;
}) {
    const actionGuard = useActionGuard();
    const [canPlay, reason] = actionGuard.canClaimMilestone(milestone);

    return (
        <TexturedCard width={200}>
            <Flex flexDirection="column">
                <GenericCardTitleBar bgColor={'#d67500'}>
                    {getTextForMilestone(milestone)}
                </GenericCardTitleBar>
                {isClaimed ? <GenericCardCost cost="-" /> : <GenericCardCost cost={8} />}
                <Flex alignItems="center" margin="4px" marginBottom="8px" fontSize="13px">
                    <MilestoneRankings milestone={milestone} />
                </Flex>
                {claimedByPlayer && (
                    <Flex
                        alignItems="center"
                        justifyContent="center"
                        margin="4px"
                        marginBottom="8px"
                        fontSize="15px"
                    >
                        <span style={{marginRight: 2}}>Claimed by</span>
                        <PlayerCorpAndIcon player={claimedByPlayer} />
                    </Flex>
                )}
                {!canPlay && reason && !isClaimed && (
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
                return (
                    <Flex
                        key={player.index}
                        alignItems="center"
                        justifyContent="space-between"
                        margin="4px 8px"
                    >
                        <PlayerCorpAndIcon player={player} />
                        <span style={{marginLeft: 20, fontWeight: 600}}>{quantity}</span>
                    </Flex>
                );
            })}
        </Flex>
    );
}
