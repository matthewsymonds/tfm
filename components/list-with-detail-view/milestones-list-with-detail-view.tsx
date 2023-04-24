import {Box, Flex} from 'components/box';
import {Button} from 'components/button';
import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import {ResourceIcon} from 'components/icons/resource';
import {ListWithDetailView} from 'components/list-with-detail-view/list-with-detail-view';
import {usePaymentPopover} from 'components/popovers/payment-popover';
import {colors} from 'components/ui';
import {
    getMilestoneConfig,
    getMilestones,
    MilestoneConfig,
} from 'constants/milestones';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React, {useCallback} from 'react';
import {useTypedSelector} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';

export function MilestonesListViewWithDetail() {
    const milestones = useTypedSelector(state => getMilestones(state));
    const claimedMilestones = useTypedSelector(state =>
        state.common.claimedMilestones.map(cm => ({
            ...cm,
            claimedByPlayer: state.players[cm.claimedByPlayerIndex],
        }))
    );
    const milestoneConfigs = milestones.map(getMilestoneConfig);
    const renderMilestoneListItem = useCallback(
        (milestoneConfig: MilestoneConfig) => {
            const claimedByPlayer = claimedMilestones.find(
                cm =>
                    cm.milestone.toLowerCase() ===
                    milestoneConfig.name.toLowerCase()
            )?.claimedByPlayer;
            return (
                <React.Fragment>
                    {milestoneConfig.name}
                    {claimedByPlayer && (
                        <PlayerIcon
                            border={colors.TEXT_LIGHT_1}
                            playerIndex={claimedByPlayer.index}
                            size={10}
                            style={{marginLeft: 4}}
                        />
                    )}
                </React.Fragment>
            );
        },
        [claimedMilestones]
    );

    const renderMilestoneDetailItem = useCallback(
        (milestoneConfig: MilestoneConfig) => {
            return <MilestoneDetailView milestoneConfig={milestoneConfig} />;
        },
        [milestoneConfigs]
    );

    return (
        <ListWithDetailView
            items={milestoneConfigs}
            renderListItem={renderMilestoneListItem}
            renderDetailItem={renderMilestoneDetailItem}
        />
    );
}

function MilestoneDetailView({
    milestoneConfig,
}: {
    milestoneConfig: MilestoneConfig;
}) {
    const claimedByPlayerOrNull = useTypedSelector(state => {
        const claimedByPlayerIndex =
            state.common.claimedMilestones.find(
                cm => cm.milestone === milestoneConfig.name
            )?.claimedByPlayerIndex ?? null;
        return claimedByPlayerIndex
            ? state.players[claimedByPlayerIndex]
            : null;
    });
    const players = useTypedSelector(state => state.players);
    const state = useTypedSelector(state => state);

    return (
        <React.Fragment>
            <Flex
                justifyContent="space-between"
                width="100%"
                alignItems="center"
                position="relative"
            >
                <h3
                    className="display text-lg"
                    style={{
                        color: colors.TEXT_LIGHT_1,
                        marginBottom: 0,
                    }}
                >
                    {milestoneConfig.name}
                </h3>
                {claimedByPlayerOrNull === null ? (
                    <Box position="absolute" right="0">
                        <ClaimMilestoneButton
                            milestone={milestoneConfig.name}
                        />
                    </Box>
                ) : (
                    <PlayerCorpAndIcon
                        player={claimedByPlayerOrNull}
                        color={colors.TEXT_LIGHT_1}
                        style={{
                            fontWeight: 500,
                            fontSize: '0.9em',
                        }}
                    />
                )}
            </Flex>

            <Flex
                style={{
                    fontSize: '10px',
                    color: colors.TEXT_LIGHT_2,
                    fontStyle: 'italic',
                    marginTop: 2,
                }}
            >
                {milestoneConfig.requirementText}
            </Flex>
            <Flex flexDirection="column" width="100%" marginTop="8px">
                {players
                    .map(player => {
                        const quantity = convertAmountToNumber(
                            milestoneConfig.amount,
                            state,
                            player
                        );
                        return {
                            player,
                            quantity,
                        };
                    })
                    .sort(
                        ({quantity: quantity1}, {quantity: quantity2}) =>
                            quantity2 - quantity1
                    )
                    .map(({player, quantity}) => {
                        return (
                            <Flex
                                key={player.index}
                                alignItems="center"
                                justifyContent="space-between"
                                margin="4px 0"
                                width="100%"
                            >
                                <PlayerCorpAndIcon
                                    includeUsername={true}
                                    player={player}
                                    color={colors.TEXT_LIGHT_1}
                                    style={{
                                        fontWeight: 500,
                                        fontSize: '0.8em',
                                    }}
                                />
                                <span
                                    style={{
                                        color: colors.TEXT_LIGHT_1,
                                        fontSize: '0.8em',
                                    }}
                                >
                                    {quantity}
                                </span>
                            </Flex>
                        );
                    })}
            </Flex>
        </React.Fragment>
    );
}

function ClaimMilestoneButton({milestone}: {milestone: string}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();
    const canPlay = actionGuard.canClaimMilestone(milestone)[0];
    const {collectPaymentAndPerformAction, triggerRef} =
        usePaymentPopover<HTMLButtonElement>({
            onConfirmPayment: payment => {
                if (canPlay) {
                    apiClient.claimMilestoneAsync({milestone, payment});
                }
            },
            opts: {
                type: 'action',
                cost: 8,
                action: {},
            },
        });

    return (
        <Button
            ref={triggerRef}
            disabled={!canPlay}
            onClick={collectPaymentAndPerformAction}
        >
            <span>Claim</span>
            <ResourceIcon
                margin="0 0 0 4px"
                name={Resource.MEGACREDIT}
                amount={8}
                size={16}
            />
        </Button>
    );
}
