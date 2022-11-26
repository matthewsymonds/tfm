import {Box, Flex} from 'components/box';
import {Button} from 'components/button';
import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import {ResourceIcon} from 'components/icons/resource';
import {ListWithDetailView} from 'components/list-with-detail-view/list-with-detail-view';
import {usePaymentPopover} from 'components/popovers/payment-popover';
import {colors} from 'components/ui';
import {AwardConfig, getAwardConfig, getAwards} from 'constants/awards';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React, {useCallback} from 'react';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';

export function AwardsListViewWithDetail() {
    const awardStateByName = useStatefulAwards();
    const renderAwardListItem = useCallback(
        (awardState: AwardState) => {
            const {fundedByPlayer} = awardStateByName[awardState.name];
            return (
                <React.Fragment>
                    {awardState.name}
                    {fundedByPlayer && (
                        <PlayerIcon
                            border={colors.TEXT_LIGHT_1}
                            playerIndex={fundedByPlayer.index}
                            size={10}
                            style={{marginLeft: 4}}
                        />
                    )}
                </React.Fragment>
            );
        },
        [awardStateByName]
    );
    const renderAwardDetailItem = useCallback(
        (awardState: AwardState) => {
            return <AwardDetailView awardState={awardState} />;
        },
        [awardStateByName]
    );

    return (
        <ListWithDetailView
            items={Object.values(awardStateByName)}
            renderListItem={renderAwardListItem}
            renderDetailItem={renderAwardDetailItem}
        />
    );
}

function AwardDetailView({awardState}: {awardState: AwardState}) {
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
                    className="display"
                    style={{
                        color: colors.TEXT_LIGHT_1,
                        marginBottom: 0,
                    }}
                >
                    {awardState.name}
                </h3>
                {awardState.fundedByPlayer === null ? (
                    <Box position="absolute" right="0">
                        <FundAwardButton award={awardState.name} />
                    </Box>
                ) : (
                    <PlayerCorpAndIcon
                        style={{
                            fontSize: '0.9em',
                            fontWeight: 500,
                        }}
                        player={awardState.fundedByPlayer}
                        color={colors.TEXT_LIGHT_1}
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
                {awardState.description}
            </Flex>
            <Flex flexDirection="column" width="100%" marginTop="8px">
                {players
                    .map(player => {
                        const quantity = convertAmountToNumber(
                            awardState.amount,
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

function FundAwardButton({award}: {award: string}) {
    const actionGuard = useActionGuard();
    const apiClient = useApiClient();
    const canPlay = actionGuard.canFundAward(award)[0];
    const awardConfigsByAward = useStatefulAwards();
    const loggedInPlayer = useLoggedInPlayer();

    const isFree = loggedInPlayer.fundAward;
    const cost = isFree ? 0 : awardConfigsByAward[award].cost;
    const {collectPaymentAndPerformAction, triggerRef} =
        usePaymentPopover<HTMLButtonElement>({
            onConfirmPayment: payment => {
                if (canPlay) {
                    if (isFree) {
                        apiClient.fundAwardAsync({award, payment: {}});
                    } else {
                        apiClient.fundAwardAsync({award, payment});
                    }
                }
            },
            opts: {
                type: 'action',
                cost,
                action: {},
            },
        });

    return (
        <Button
            buttonRef={triggerRef}
            disabled={!canPlay}
            onClick={collectPaymentAndPerformAction}
        >
            <span>Fund</span>
            <ResourceIcon
                margin="0 0 0 4px"
                name={Resource.MEGACREDIT}
                amount={cost}
                size={16}
            />
        </Button>
    );
}

type AwardState = AwardConfig & {
    isFunded: boolean;
    cost: number;
    fundedByPlayer: PlayerState | null;
};

export const useStatefulAwards = () => {
    return useTypedSelector(
        state =>
            getAwards(state).reduce<{
                [award: string]: AwardState;
            }>((acc, award) => {
                const isFunded = state.common.fundedAwards
                    .map(fa => fa.award.toLowerCase())
                    .includes(award.toLowerCase());
                let fundedByPlayer;
                if (isFunded) {
                    const {fundedByPlayerIndex} =
                        state.common.fundedAwards.find(
                            fa => fa.award.toLowerCase() === award.toLowerCase()
                        )!;
                    fundedByPlayer = state.players[fundedByPlayerIndex];
                } else {
                    fundedByPlayer = null;
                }
                acc[award] = {
                    ...getAwardConfig(award),
                    isFunded,
                    cost: getCostForAward(award, state),
                    fundedByPlayer,
                };
                return acc;
            }, {}),
        (prev, next) => {
            // Brief equality check.
            for (const award in prev) {
                if (!next[award]) return false;
                if (prev[award].fundedByPlayer !== next[award].fundedByPlayer) {
                    return false;
                }
            }
            return true;
        }
    );
};

function getCostForAward(award: string, state: GameState) {
    const fundedIndex = state.common.fundedAwards.findIndex(
        config => config.award.toLowerCase() === award.toLowerCase()
    );
    if (fundedIndex !== -1) {
        return [8, 14, 20][fundedIndex];
    } else {
        return [8, 14, 20, 20][state.common.fundedAwards.length];
    }
}
