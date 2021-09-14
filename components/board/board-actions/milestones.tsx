import ActionListWithPopovers from 'components/action-list-with-popovers';
import {AwardsMilestonesLayout} from 'components/board/board-actions/awards';
import {Flex} from 'components/box';
import {CardButton} from 'components/card/CardButton';
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
import {useWindowWidth} from 'hooks/use-window-width';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {isPlayingVenus} from 'selectors/is-playing-venus';
import {milestoneQuantitySelectors} from 'selectors/milestone-selectors';
import styled from 'styled-components';

const MilestoneHeader = styled.div`
    margin: 4px 2px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 13px;
    color: ${colors.GOLD};
`;

export default function MilestonesList({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();
    const windowWidth = useWindowWidth();
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
            apiClient.claimMilestoneAsync({milestone, payment});
        }
    };

    let milestones = Object.values(Milestone);
    const venus = useTypedSelector(isPlayingVenus);
    if (!venus) {
        milestones = milestones.filter(milestone => milestone !== Milestone.HOVERLORD);
    }

    return (
        <AwardsMilestonesLayout>
            <MilestoneHeader className="display">Milestones</MilestoneHeader>
            <ActionListWithPopovers<Milestone>
                actions={milestones}
                emphasizeOnHover={canPlay}
                isVertical={windowWidth > 895}
                ActionComponent={({action}) => (
                    <MilestoneBadge
                        milestone={action}
                        canClaim={canPlay(action)}
                        isClaimed={isClaimed(action)}
                    />
                )}
                ActionPopoverComponent={({action, closePopover}) => (
                    <MilestonePopover
                        milestone={action}
                        isClaimed={isClaimed(action)}
                        claimMilestone={(milestone, payment) => {
                            closePopover();
                            claimMilestone(milestone, payment);
                        }}
                        claimedByPlayer={
                            claimedMilestones.find(cm => cm.milestone === action)
                                ?.claimedByPlayer ?? null
                        }
                        loggedInPlayer={loggedInPlayer}
                    />
                )}
            />
        </AwardsMilestonesLayout>
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
    canClaim,
    isClaimed,
}: {
    milestone: Milestone;
    canClaim: boolean;
    isClaimed: boolean;
}) {
    const claimedByPlayerIndex =
        useTypedSelector(state =>
            state.common.claimedMilestones.find(cm => cm.milestone === milestone)
        )?.claimedByPlayerIndex ?? null;

    return (
        <MilestoneBadgeContainer className="display" canClaim={canClaim} isClaimed={isClaimed}>
            {claimedByPlayerIndex !== null && (
                <div style={{marginRight: 4}}>
                    <PlayerIcon playerIndex={claimedByPlayerIndex} size={10} />
                </div>
            )}
            <span>{getTextForMilestone(milestone)}</span>
        </MilestoneBadgeContainer>
    );
}

const ErrorText = styled.span`
    color: ${colors.TEXT_ERROR};
`;

function MilestonePopover({
    milestone,
    isClaimed,
    loggedInPlayer,
    claimedByPlayer,
    claimMilestone,
}: {
    milestone: Milestone;
    isClaimed: boolean;
    loggedInPlayer: PlayerState;
    claimedByPlayer: PlayerState | null;
    claimMilestone: (action: Milestone, payment?: PropertyCounter<Resource>) => void;
}) {
    const actionGuard = useActionGuard();
    const [canPlay, reason] = actionGuard.canClaimMilestone(milestone);
    const showPaymentPopover =
        loggedInPlayer.corporation.name === 'Helion' && loggedInPlayer.resources[Resource.HEAT] > 0;

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
                {canPlay && (
                    <Flex justifyContent="center" marginBottom="8px">
                        <PaymentPopover
                            cost={8}
                            onConfirmPayment={payment => claimMilestone(milestone, payment)}
                            shouldHide={!showPaymentPopover}
                        >
                            <CardButton
                                onClick={() => {
                                    !showPaymentPopover && claimMilestone(milestone);
                                }}
                            >
                                Claim {getTextForMilestone(milestone)}
                            </CardButton>
                        </PaymentPopover>
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
        case Milestone.HOVERLORD:
            return 'Hoverlord';
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
        case Milestone.HOVERLORD:
            return 'Requires 7 floaters';
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
