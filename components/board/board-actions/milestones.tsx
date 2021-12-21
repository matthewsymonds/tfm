import ActionListWithPopovers from 'components/action-list-with-popovers';
import {AwardsMilestonesLayout} from 'components/board/board-actions/awards';
import {Box, Flex} from 'components/box';
import {CardButton} from 'components/card/CardButton';
import {GenericCardCost} from 'components/card/CardCost';
import {GenericCardTitleBar} from 'components/card/CardTitle';
import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import PaymentPopover from 'components/popovers/payment-popover';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {getMilestone, getMilestones} from 'constants/milestones';
import {NumericPropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {PopoverType, usePopoverType} from 'context/global-popover-context';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useWindowWidth} from 'hooks/use-window-width';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
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
    const {hidePopover} = usePopoverType(PopoverType.ACTION_LIST_ITEM);
    const claimedMilestones = useTypedSelector(state =>
        state.common.claimedMilestones.map(cm => ({
            ...cm,
            claimedByPlayer: state.players[cm.claimedByPlayerIndex],
        }))
    );

    const claimMilestone = (milestone: string, payment: NumericPropertyCounter<Resource>) => {
        if (canPlay(milestone)) {
            apiClient.claimMilestoneAsync({milestone, payment});
        }
    };

    const milestones = useTypedSelector(state => getMilestones(state));

    return (
        <AwardsMilestonesLayout>
            <MilestoneHeader className="display">Milestones</MilestoneHeader>
            <Box position="relative" className="width-full overflow-auto">
                <ActionListWithPopovers<string>
                    actions={milestones}
                    emphasizeOnHover={canPlay}
                    popoverPlacement={windowWidth > 895 ? 'left-center' : 'top-center'}
                    isVertical={windowWidth > 895}
                    ActionComponent={({action}) => (
                        <MilestoneBadge
                            milestone={action}
                            canClaim={canPlay(action)}
                            isClaimed={isClaimed(action)}
                        />
                    )}
                    ActionPopoverComponent={({action}) => (
                        <MilestonePopover
                            milestone={action}
                            claimMilestone={(milestone, payment) => {
                                hidePopover(null);
                                claimMilestone(milestone, payment);
                            }}
                            claimedByPlayer={
                                claimedMilestones.find(
                                    cm => cm.milestone.toLowerCase() === action.toLowerCase()
                                )?.claimedByPlayer ?? null
                            }
                            loggedInPlayer={loggedInPlayer}
                        />
                    )}
                />
            </Box>
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
    @media (max-width: 895px) {
        margin-right: ${props => (props.isClaimed ? '2px' : '0')};
    }
`;

function MilestoneBadge({
    milestone,
    canClaim,
    isClaimed,
}: {
    milestone: string;
    canClaim: boolean;
    isClaimed: boolean;
}) {
    const claimedByPlayerIndex =
        useTypedSelector(state =>
            state.common.claimedMilestones.find(
                cm => cm.milestone.toLowerCase() === milestone.toLowerCase()
            )
        )?.claimedByPlayerIndex ?? null;

    return (
        <MilestoneBadgeContainer className="display" canClaim={canClaim} isClaimed={isClaimed}>
            {claimedByPlayerIndex !== null && (
                <div style={{marginRight: 4}}>
                    <PlayerIcon playerIndex={claimedByPlayerIndex} size={10} />
                </div>
            )}
            <span>{milestone}</span>
        </MilestoneBadgeContainer>
    );
}

const ErrorText = styled.span`
    color: ${colors.TEXT_ERROR};
`;

export function MilestonePopover({
    milestone,
    loggedInPlayer,
    claimedByPlayer,
    claimMilestone,
}: {
    milestone: string;
    loggedInPlayer: PlayerState;
    claimedByPlayer: PlayerState | null;
    claimMilestone: (action: string, payment: NumericPropertyCounter<Resource>) => void;
}) {
    const isClaimed = milestone => actionGuard.isMilestoneClaimed(milestone);
    const actionGuard = useActionGuard();
    const [canPlay, reason] = actionGuard.canClaimMilestone(milestone);
    const showPaymentPopover =
        loggedInPlayer.corporation.name === 'Helion' && loggedInPlayer.resources[Resource.HEAT] > 0;

    return (
        <TexturedCard width={200}>
            <Flex flexDirection="column">
                <GenericCardTitleBar bgColor={'#d67500'}>{milestone}</GenericCardTitleBar>
                {isClaimed(milestone) ? <GenericCardCost cost="-" /> : <GenericCardCost cost={8} />}
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
                        <PlayerCorpAndIcon player={claimedByPlayer} style={{fontSize: '0.8em'}} />
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
                                    !showPaymentPopover &&
                                        claimMilestone(milestone, {[Resource.MEGACREDIT]: 8});
                                }}
                            >
                                Claim {milestone}
                            </CardButton>
                        </PaymentPopover>
                    </Flex>
                )}
            </Flex>
        </TexturedCard>
    );
}

function MilestoneRankings({milestone}: {milestone: string}) {
    const players = useTypedSelector(state => state.players);
    const milestoneConfig = getMilestone(milestone);

    return (
        <Flex flexDirection="column" width="100%">
            <Flex alignItems="center" marginBottom="8px" style={{fontSize: 14}}>
                <span>{milestoneConfig.requirementText}</span>
            </Flex>
            {players.map(player => {
                const quantity = useTypedSelector(state => {
                    return convertAmountToNumber(milestoneConfig.amount, state, player);
                });
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
