import ActionListWithPopovers from 'components/action-list-with-popovers';
import {Flex} from 'components/box';
import {CardButton} from 'components/card/CardButton';
import {GenericCardCost} from 'components/card/CardCost';
import {GenericCardTitleBar} from 'components/card/CardTitle';
import {PlayerCorpAndIcon, PlayerIcon} from 'components/icons/player';
import PaymentPopover from 'components/popovers/payment-popover';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {Award} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useWindowWidth} from 'hooks/use-window-width';
import React from 'react';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {isPlayingVenus} from 'selectors/is-playing-venus';
import {awardToQuantity} from 'selectors/score';
import styled from 'styled-components';

export const AwardsMilestonesLayout = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
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

export default function AwardsList({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();
    const windowWidth = useWindowWidth();
    const awardConfigsByAward = useTypedSelector(
        state =>
            Object.values(Award).reduce((acc, award) => {
                const isFunded = state.common.fundedAwards.map(fa => fa.award).includes(award);
                let fundedByPlayer;
                if (isFunded) {
                    const {fundedByPlayerIndex} = state.common.fundedAwards.find(
                        fa => fa.award === award
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

    const canPlay = award => actionGuard.canFundAward(award)[0];
    const isFunded = award => actionGuard.isAwardFunded(award);
    const isFree = loggedInPlayer.fundAward;

    const fundAward = (award: Award, payment?: PropertyCounter<Resource>) => {
        if (canPlay(award)) {
            if (isFree) {
                apiClient.fundAwardAsync({award, payment: {}});
            } else {
                apiClient.fundAwardAsync({award, payment});
            }
        }
    };

    let awards = Object.values(Award);
    const venus = useTypedSelector(isPlayingVenus);
    if (!venus) {
        awards = awards.filter(award => award !== Award.VENUPHILE);
    }

    return (
        <AwardsMilestonesLayout>
            <AwardHeader className="display">Awards</AwardHeader>

            <ActionListWithPopovers<Award>
                actions={awards}
                emphasizeOnHover={canPlay}
                isVertical={windowWidth > 895}
                ActionComponent={({action}) => (
                    <AwardBadge
                        award={action}
                        canFund={canPlay(action)}
                        isFunded={isFunded(action)}
                    />
                )}
                ActionPopoverComponent={({action, closePopover}) => (
                    <AwardPopover
                        award={action}
                        fundAward={(award, payment) => {
                            closePopover();
                            fundAward(award, payment);
                        }}
                        loggedInPlayer={loggedInPlayer}
                        cost={isFree ? 0 : awardConfigsByAward[action].cost}
                        isFunded={isFunded(action)}
                        fundedByPlayer={awardConfigsByAward[action].fundedByPlayer}
                    />
                )}
            />
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
`;

function AwardBadge({
    award,
    canFund,
    isFunded,
}: {
    award: Award;
    canFund: boolean;
    isFunded: boolean;
}) {
    const fundedByPlayerIndex =
        useTypedSelector(state => state.common.fundedAwards.find(fa => fa.award === award))
            ?.fundedByPlayerIndex ?? null;

    return (
        <AwardBadgeContainer className="display" canFund={canFund} isFunded={isFunded}>
            {fundedByPlayerIndex !== null && (
                <div style={{marginRight: 4}}>
                    <PlayerIcon playerIndex={fundedByPlayerIndex} size={10} />
                </div>
            )}
            <span>{getTextForAward(award)}</span>
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
    isFunded,
    fundedByPlayer,
    fundAward,
}: {
    award: Award;
    loggedInPlayer: PlayerState;
    cost: number;
    isFunded: boolean;
    fundedByPlayer?: PlayerState;
    fundAward: (action: Award, payment?: PropertyCounter<Resource>) => void;
}) {
    const actionGuard = useActionGuard();
    const [canPlay, reason] = actionGuard.canFundAward(award);
    const showPaymentPopover =
        loggedInPlayer.corporation.name === 'Helion' &&
        loggedInPlayer.resources[Resource.HEAT] > 0 &&
        !loggedInPlayer.fundAward;

    return (
        <TexturedCard width={200}>
            <Flex flexDirection="column">
                <GenericCardTitleBar bgColor={'#d67500'}>
                    {getTextForAward(award)}
                </GenericCardTitleBar>
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
                                Fund {getTextForAward(award)}
                            </CardButton>
                        </PaymentPopover>
                    </Flex>
                )}
            </Flex>
        </TexturedCard>
    );
}

function AwardRankings({award}: {award: Award}) {
    const players = useTypedSelector(state => state.players);
    return (
        <Flex flexDirection="column" width="100%">
            <Flex alignItems="center" marginBottom="8px" style={{fontSize: 14}}>
                <span>{getRequirementTextForAward(award)}</span>
            </Flex>
            {players.map(player => {
                const quantity = useTypedSelector(state => awardToQuantity[award](player, state));
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

export function getTextForAward(award: Award) {
    switch (award) {
        case Award.BANKER:
            return 'Banker';
        case Award.LANDLORD:
            return 'Landlord';
        case Award.MINER:
            return 'Miner';
        case Award.SCIENTIST:
            return 'Scientist';
        case Award.THERMALIST:
            return 'Thermalist';
        case Award.VENUPHILE:
            return 'Venuphile';
        default:
            throw new Error('Unrecognized award');
    }
}

function getRequirementTextForAward(award: Award) {
    switch (award) {
        case Award.BANKER:
            return 'Player with the most MC production wins.';
        case Award.LANDLORD:
            return 'Player with the most tiles (on or off Mars) wins.';
        case Award.MINER:
            return 'Player with the most titanium and steel resources wins.';
        case Award.SCIENTIST:
            return 'Player with the most science tags wins.';
        case Award.THERMALIST:
            return 'Player with the most heat resources wins.';
        case Award.VENUPHILE:
            return 'Player with the most Venus tags wins.';
        default:
            throw new Error('Unrecognized award');
    }
}

function getCostForAward(award: Award, state: GameState) {
    const fundedIndex = state.common.fundedAwards.findIndex(config => config.award === award);
    if (fundedIndex !== -1) {
        return [8, 14, 20][fundedIndex];
    } else {
        return [8, 14, 20, 20][state.common.fundedAwards.length];
    }
}
