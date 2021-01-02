import ActionListWithPopovers from 'components/action-list-with-popovers';
import {Flex} from 'components/box';
import {GenericCardCost} from 'components/card/CardCost';
import {GenericCardTitleBar} from 'components/card/CardTitle';
import {PlayerCorpAndIcon} from 'components/icons/player';
import PaymentPopover from 'components/popovers/payment-popover';
import TexturedCard from 'components/textured-card';
import {colors} from 'components/ui';
import {Award} from 'constants/board';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {awardToQuantity} from 'selectors/score';
import styled from 'styled-components';

const AwardHeader = styled.div`
    margin: 4px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 13px;
    font-weight: 600;
    color: white;
    opacity: 0.3;
`;

export default function AwardsNew({loggedInPlayer}: {loggedInPlayer: PlayerState}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();
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

    const fundAward = (award: Award, payment?: PropertyCounter<Resource>) => {
        const [canPlay] = actionGuard.canFundAward(award);
        if (canPlay) {
            apiClient.fundAwardAsync({award, payment});
        }
    };

    return (
        <Flex flexDirection="column" alignItems="flex-end">
            <AwardHeader className="display">Awards</AwardHeader>

            <ActionListWithPopovers<Award>
                actions={Object.values(Award)}
                ActionComponent={({action}) => (
                    <AwardBadge
                        award={action}
                        fundAward={fundAward}
                        loggedInPlayer={loggedInPlayer}
                        cost={awardConfigsByAward[action].cost}
                        isFunded={awardConfigsByAward[action].isFunded}
                    />
                )}
                ActionPopoverComponent={({action}) => (
                    <AwardPopover
                        award={action}
                        loggedInPlayer={loggedInPlayer}
                        cost={awardConfigsByAward[action].cost}
                        isFunded={awardConfigsByAward[action].isFunded}
                        fundedByPlayer={awardConfigsByAward[action].fundedByPlayer}
                    />
                )}
            />
        </Flex>
    );
}

const AwardBadgeContainer = styled.div`
    padding: 4px;
    color: white;
`;

function AwardBadge({
    award,
    fundAward,
    loggedInPlayer,
    cost,
}: {
    award: Award;
    fundAward: (action: Award | null, payment?: PropertyCounter<Resource>) => void;
    loggedInPlayer: PlayerState;
    cost: number;
    isFunded: boolean;
}) {
    const showPaymentPopover =
        loggedInPlayer.corporation.name === 'Helion' && loggedInPlayer.resources[Resource.HEAT] > 0;

    return (
        <PaymentPopover
            cost={cost}
            onConfirmPayment={payment => fundAward(award, payment)}
            shouldHide={!showPaymentPopover}
        >
            <AwardBadgeContainer
                className="display"
                onClick={() => {
                    !showPaymentPopover && fundAward(award, {[Resource.MEGACREDIT]: cost});
                }}
            >
                <span>{getTextForAward(award)}</span>
            </AwardBadgeContainer>
        </PaymentPopover>
    );
}

const ErrorText = styled.span`
    color: ${colors.TEXT_ERROR};
`;

function AwardPopover({
    award,
    cost,
    isFunded,
    fundedByPlayer,
}: {
    award: Award;
    loggedInPlayer: PlayerState;
    cost: number;
    isFunded: boolean;
    fundedByPlayer?: PlayerState;
}) {
    const actionGuard = useActionGuard();
    const [canPlay, reason] = actionGuard.canFundAward(award);

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
                <Flex alignItems="center" justifyContent="center">
                    <PlayerCorpAndIcon player={player} />
                    <span style={{marginLeft: 20}}>{quantity}</span>
                </Flex>;
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
