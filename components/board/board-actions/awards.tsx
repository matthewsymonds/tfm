import ActionListWithPopovers from 'components/action-list-with-popovers';
import {Box, Flex} from 'components/box';
import {CardButton} from 'components/card/CardButton';
import {GenericCardCost} from 'components/card/CardCost';
import {GenericCardTitleBar} from 'components/card/CardTitle';
import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import PaymentPopover from 'components/popovers/payment-popover';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {getAward, getAwards} from 'constants/awards';
import {NumericPropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {PopoverType, usePopoverType} from 'context/global-popover-context';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useWindowWidth} from 'hooks/use-window-width';
import React from 'react';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import styled from 'styled-components';

export const AwardsMilestonesLayout = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    overflow: hidden;
    position: relative;
    @media (max-width: 895px) {
        align-items: center;
        max-width: 100%;
        margin: 4px;
    }
`;

const AwardHeader = styled.div`
    margin: 4px 2px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 13px;
    color: ${colors.GOLD};
`;

export const useAwardConfigsByAward = () => {
    return useTypedSelector(
        state =>
            getAwards(state).reduce((acc, award) => {
                const isFunded = state.common.fundedAwards.map(fa => fa.award).includes(award);
                let fundedByPlayer;
                if (isFunded) {
                    const {fundedByPlayerIndex} = state.common.fundedAwards.find(
                        fa => fa.award.toLowerCase() === award.toLowerCase()
                    )!;
                    fundedByPlayer = state.players[fundedByPlayerIndex];
                }
                acc[award] = {
                    isFunded,
                    cost: getCostForAward(award, state),
                    fundedByPlayer,
                };
                return acc;
            }, {}),
        (prev, next) => {
            // Brief equality check.
            for (const award in prev) {
                if (prev[award].fundedByPlayer !== next[award].fundedByPlayer) {
                    return false;
                }
            }
            return true;
        }
    );
};

export default function AwardsList({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();
    const windowWidth = useWindowWidth();
    const {hidePopover} = usePopoverType(PopoverType.ACTION_LIST_ITEM);

    const awards = useTypedSelector(state => getAwards(state));

    const awardConfigsByAward = useAwardConfigsByAward();

    const canPlay = (award: string) => actionGuard.canFundAward(award)[0];
    const isFunded = (award: string) => actionGuard.isAwardFunded(award);
    const isFree = loggedInPlayer.fundAward;

    const fundAward = (award: string, payment: NumericPropertyCounter<Resource>) => {
        if (canPlay(award)) {
            if (isFree) {
                apiClient.fundAwardAsync({award, payment: {}});
            } else {
                apiClient.fundAwardAsync({award, payment});
            }
        }
    };

    return (
        <AwardsMilestonesLayout>
            <AwardHeader className="display">Awards</AwardHeader>
            <Box position="relative" className="width-full overflow-auto">
                <ActionListWithPopovers<string>
                    actions={awards}
                    emphasizeOnHover={canPlay}
                    popoverPlacement={windowWidth > 895 ? 'left-center' : 'top-center'}
                    isVertical={windowWidth > 895}
                    ActionComponent={({action}) => (
                        <AwardBadge
                            award={action}
                            canFund={canPlay(action)}
                            isFunded={isFunded(action)}
                        />
                    )}
                    ActionPopoverComponent={({action}) => (
                        <AwardPopover
                            award={action}
                            fundAward={(award, payment) => {
                                hidePopover(null);
                                fundAward(award, payment);
                            }}
                            loggedInPlayer={loggedInPlayer}
                            cost={isFree ? 0 : awardConfigsByAward[action].cost}
                            fundedByPlayer={awardConfigsByAward[action].fundedByPlayer}
                        />
                    )}
                />
            </Box>
        </AwardsMilestonesLayout>
    );
}

const AwardBadgeContainer = styled.div<{canFund: boolean; isFunded: boolean}>`
    display: flex;
    align-items: center;
    padding: 4px;
    color: white;
    opacity: ${props => (props.canFund || props.isFunded ? 1 : 0.5)};
    font-style: ${props => (props.isFunded ? 'italic' : 'normal')};
    @media (max-width: 895px) {
        margin-right: ${props => (props.isFunded ? '2px' : '0')};
    }
`;

function AwardBadge({
    award,
    canFund,
    isFunded,
}: {
    award: string;
    canFund: boolean;
    isFunded: boolean;
}) {
    const fundedByPlayerIndex =
        useTypedSelector(state =>
            state.common.fundedAwards.find(fa => fa.award.toLowerCase() === award.toLowerCase())
        )?.fundedByPlayerIndex ?? null;

    const awardConfig = getAward(award);

    return (
        <AwardBadgeContainer className="display" canFund={canFund} isFunded={isFunded}>
            {fundedByPlayerIndex !== null && (
                <div style={{marginRight: 4}}>
                    <PlayerIcon playerIndex={fundedByPlayerIndex} size={10} />
                </div>
            )}
            <span>{awardConfig.name}</span>
        </AwardBadgeContainer>
    );
}

const ErrorText = styled.span`
    color: ${colors.TEXT_ERROR};
`;

export function AwardPopover({
    award,
    loggedInPlayer,
    cost,
    fundedByPlayer,
    fundAward,
}: {
    award: string;
    loggedInPlayer: PlayerState;
    cost: number;
    fundedByPlayer?: PlayerState;
    fundAward: (action: string, payment: NumericPropertyCounter<Resource>) => void;
}) {
    const awardConfig = getAward(award);
    const actionGuard = useActionGuard();
    const isFunded = (award: string) => actionGuard.isAwardFunded(award);
    const [canPlay, reason] = actionGuard.canFundAward(award);
    const showPaymentPopover =
        loggedInPlayer.corporation.name === 'Helion' &&
        loggedInPlayer.resources[Resource.HEAT] > 0 &&
        !loggedInPlayer.fundAward;

    return (
        <TexturedCard width={200}>
            <Flex flexDirection="column">
                <GenericCardTitleBar bgColor={'#d67500'}>{awardConfig.name}</GenericCardTitleBar>
                {isFunded ? (
                    <GenericCardCost cost="-" />
                ) : (
                    <GenericCardCost cost={cost} originalCost={cost === 8 ? undefined : cost - 6} />
                )}
                <Flex alignItems="center" margin="4px" marginBottom="8px" fontSize="13px">
                    <AwardRankings award={award} />
                </Flex>
                {fundedByPlayer && (
                    <Flex
                        alignItems="center"
                        justifyContent="center"
                        margin="4px"
                        marginBottom="8px"
                        fontSize="15px"
                    >
                        <span style={{marginRight: 2}}>Funded by</span>
                        <PlayerCorpAndIcon player={fundedByPlayer} />
                    </Flex>
                )}
                {!canPlay && reason && !fundedByPlayer && (
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
                            cost={cost}
                            onConfirmPayment={payment => fundAward(award, payment)}
                            shouldHide={!showPaymentPopover}
                        >
                            <CardButton
                                onClick={() => {
                                    if (!showPaymentPopover) {
                                        fundAward(award, {[Resource.MEGACREDIT]: cost});
                                    }
                                }}
                            >
                                Fund {awardConfig.name}
                            </CardButton>
                        </PaymentPopover>
                    </Flex>
                )}
            </Flex>
        </TexturedCard>
    );
}

function AwardRankings({award}: {award: string}) {
    const players = useTypedSelector(state => state.players);
    const awardConfig = getAward(award);
    return (
        <Flex flexDirection="column" width="100%">
            <Flex alignItems="center" marginBottom="8px" style={{fontSize: 14}}>
                <span>{awardConfig.description}</span>
            </Flex>
            {players.map(player => {
                const quantity = useTypedSelector(state =>
                    convertAmountToNumber(awardConfig.amount, state, player)
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
