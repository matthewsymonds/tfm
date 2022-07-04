import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {ActionContainerBase} from 'components/card/ActionContainerBase';
import {Action, Payment} from 'constants/action';
import {Deck} from 'constants/card-types';
import {GameStage} from 'constants/game';
import {getGlobalEvent} from 'constants/global-events';
import {getPartyConfig, PartyConfig, UNITY} from 'constants/party';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import Masonry, {ResponsiveMasonry} from 'react-responsive-masonry';
import Twemoji from 'react-twemoji';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import {getLobbyingAction} from 'selectors/get-lobbying-action';
import styled from 'styled-components';
import {Box, Flex} from './box';
import {CARD_HEIGHT, CARD_WIDTH, MainCardText} from './card/Card';
import {
    renderArrow,
    renderLeftSideOfArrow,
    renderRightSideOfArrow,
} from './card/CardActions';
import {renderExchangeRates, renderTrigger} from './card/CardEffects';
import {BaseActionIconography, Colon} from './card/CardIconography';
import {GenericCardTitleBar} from './card/CardTitle';
import {DelegateComponent} from './delegate';
import {PartySymbol} from './icons/turmoil';
import {TurmoilPartyListWithDetailView} from './list-with-detail-view/turmoil-party-list-with-detail-view';
import {usePaymentPopover} from './popovers/payment-popover';
import TexturedCard from './textured-card';
import {colors} from './ui';

function GlobalEventCard({name}: {name: string}) {
    const globalEvent = getGlobalEvent(name);
    if (!globalEvent) return null;
    return (
        <Box marginLeft="4px" marginRight="4px">
            <TexturedCard
                width={CARD_WIDTH - 20}
                height={CARD_HEIGHT}
                borderWidth={2}
            >
                <GenericCardTitleBar
                    bgColor={colors.CARD_GLOBAL_EVENT}
                    padding="4px 0"
                    marginTop="16px"
                >
                    <Box margin="0 4px">
                        <PartySymbol
                            party={globalEvent.top.party}
                            margin="0 auto 0 0"
                        />
                    </Box>
                    <Box flexGrow="1" marginRight="4px">
                        {globalEvent.top.name}
                    </Box>
                </GenericCardTitleBar>
                <GenericCardTitleBar
                    bgColor={colors.CARD_EVENT}
                    padding="4px 0"
                    marginTop="16px"
                >
                    <Box flexGrow="1" marginLeft="4px">
                        {globalEvent.bottom.name}
                    </Box>
                    <Box margin="0 4px">
                        <PartySymbol
                            party={globalEvent.bottom.party}
                            margin="0 0 0 auto"
                        />
                    </Box>
                </GenericCardTitleBar>
                <MainCardText>{globalEvent.action.text}</MainCardText>
                {globalEvent.firstPlayerAction ? (
                    <Box margin="8px">
                        <BaseActionIconography
                            card={globalEvent.firstPlayerAction}
                        />
                    </Box>
                ) : null}
                <BaseActionIconography card={globalEvent.action} />
            </TexturedCard>
        </Box>
    );
}

function EmptyGlobalEvent() {
    return (
        <Box marginLeft="4px" marginRight="4px">
            <TexturedCard
                isSelected={false}
                width={CARD_WIDTH - 20}
                height={CARD_HEIGHT}
                borderWidth={2}
            >
                <GenericCardTitleBar bgColor={colors.CARD_GLOBAL_EVENT}>
                    No current Global Event
                </GenericCardTitleBar>
            </TexturedCard>
        </Box>
    );
}

function PartyPolicyInternal({
    party,
    disabled,
}: {
    party: string;
    disabled?: boolean;
}) {
    const rulingPartyPolicy = getPartyConfig(party);

    if (rulingPartyPolicy.effect) {
        const {effect} = rulingPartyPolicy;
        const {action} = effect;
        if (!action) return null;
        return (
            <React.Fragment>
                {renderTrigger(effect.trigger)}
                <Colon />
                {renderLeftSideOfArrow(action)}
                {renderRightSideOfArrow(action)}
            </React.Fragment>
        );
    }

    if (rulingPartyPolicy.exchangeRates) {
        return (
            <React.Fragment>
                {renderExchangeRates(rulingPartyPolicy.exchangeRates)}
            </React.Fragment>
        );
    }

    if (rulingPartyPolicy.action) {
        const {action} = rulingPartyPolicy;
        return (
            <TurmoilAction disabled={disabled}>
                {renderLeftSideOfArrow(action)}
                {renderArrow()}
                {renderRightSideOfArrow(action, undefined, undefined, true)}
            </TurmoilAction>
        );
    }

    return null;
}

type PartyPolicyProps = {
    party: string;
    canClick?: boolean;
    disabled?: boolean;
    onClick?: Function;
};

const PartyPolicy = React.forwardRef((props: PartyPolicyProps, ref) => {
    return (
        <Flex
            display="inline-flex"
            flexGrow="1"
            boxShadow={props.canClick ? '0px 0px 38px 5px #ccc' : 'none'}
            onClick={props.onClick}
            cursor={props.canClick ? 'pointer' : 'auto'}
        >
            <PartyPolicyInternal {...props} />
        </Flex>
    );
});

const TurmoilAction = styled(ActionContainerBase)`
    display: flex;
    align-items: center;
`;

function Lobbying({
    party,
    canLobby,
    action,
    apiClient,
}: {
    party: PartyConfig;
    canLobby: boolean;
    action: Action;
    apiClient: ApiClient;
}) {
    return (
        <Flex
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
        >
            <TurmoilAction
                disabled={!canLobby}
                onClick={() =>
                    canLobby &&
                    apiClient.lobbyAsync(party.name, {
                        [Resource.MEGACREDIT]: action.cost,
                    })
                }
                style={{paddingBottom: '4px'}}
            >
                {renderLeftSideOfArrow(action)}
                {renderArrow()}
                {renderRightSideOfArrow(action)}
            </TurmoilAction>
            <Box fontSize="10px">
                <em>{canLobby ? 'Add a delegate to ' + party.name : null}</em>
            </Box>
        </Flex>
    );
}

export function canClickDelegate(
    state: GameState,
    player: PlayerState,
    index: number
) {
    const {turmoil} = state.common;
    if (!turmoil) return false;

    if (player.removeNonLeaderDelegate) {
        return index !== 0;
    }
    return false;
}

export function canClickParty(
    state: GameState,
    player: PlayerState,
    party: string
) {
    const {turmoil} = state.common;
    if (!turmoil) return false;

    if (player.exchangeNeutralNonLeaderDelegate) {
        const [, ...delegation] = turmoil.delegations[party];
        return delegation.some(delegate => delegate.playerIndex == undefined);
    }
    if (player.placeDelegatesInOneParty) {
        return true;
    }
    return false;
}

export function Turmoil() {
    const isTurmoilEnabled = useTypedSelector(state =>
        state.options?.decks.includes(Deck.TURMOIL)
    );
    if (!isTurmoilEnabled) return null;
    const turmoil = useTypedSelector(state => state.common.turmoil);
    if (!turmoil) return null;

    const player = useLoggedInPlayer();
    const actionGuard = useActionGuard(player.username);
    const apiClient = useApiClient();

    const [canLobby] = actionGuard.canLobby();

    const lobbying: Action = useTypedSelector(state =>
        getLobbyingAction(state, player)
    );

    const state = useTypedSelector(state => state);

    function handleClickDelegate(party: string, index: number) {
        if (!canClickDelegate(state, player, index)) {
            return;
        }
        if (player.removeNonLeaderDelegate) {
            apiClient.completeRemoveNonLeaderDelegateAsync(party, index);
            return;
        }
    }

    function handleClickParty(party: string) {
        if (!canClickParty(state, player, party)) {
            return;
        }
        if (player.exchangeNeutralNonLeaderDelegate) {
            apiClient.completeExchangeNeutralNonLeaderDelegateAsync(party);
            return;
        }
        if (player.placeDelegatesInOneParty) {
            apiClient.completePlaceDelegatesInOnePartyAsync(party);
            return;
        }
    }

    function handleClickPolicy(payment: Payment) {
        if (!actionGuard.canDoRulingPolicyAction(payment)) {
            return;
        }

        apiClient.doRulingPolicyActionAsync(payment);
    }

    const delegations: React.ReactElement[] = [];
    for (const delegation in turmoil.delegations) {
        const party = getPartyConfig(delegation);
        const delegates = turmoil.delegations[delegation].map(
            (delegate, index) => (
                <Box key={index} marginLeft={index === 0 ? '0px' : '2px'}>
                    <DelegateComponent
                        delegate={delegate}
                        // isLeader={index === 0}
                        canClick={canClickDelegate(state, player, index)}
                        onClick={() => handleClickDelegate(delegation, index)}
                    />
                </Box>
            )
        );
        const canClick = canClickParty(state, player, party.name);
        const element = (
            <PartyPanel key={party.name}>
                <Flex
                    className="display"
                    position="relative"
                    width="100%"
                    marginBottom="8px"
                    alignItems="center"
                    flexDirection="column"
                >
                    <PartyTitle
                        onClick={() => handleClickParty(party.name)}
                        background="transparent"
                        padding="2px"
                        borderRadius="4px"
                        boxShadow={
                            canClick ? '0px 0px 38px 5px #000000' : 'none'
                        }
                        cursor={canClick ? 'pointer' : 'auto'}
                    >
                        {party.name}
                    </PartyTitle>
                    {turmoil.dominantParty === party.name ? (
                        <Box fontStyle="italic" fontSize="12px">
                            This party is dominant.
                        </Box>
                    ) : null}
                    <Box position="absolute" right="0px" top="0px">
                        <PartySymbol party={delegation} />
                    </Box>
                </Flex>
                <Box>
                    <span style={{marginRight: '4px', fontSize: '10px'}}>
                        Policy:
                    </span>
                    <PartyPolicy party={delegation} disabled={true} />
                </Box>
                <Box>
                    <span style={{marginRight: '4px', fontSize: '10px'}}>
                        Bonus:
                    </span>
                    <BaseActionIconography
                        inline={true}
                        card={party.partyBonus}
                    />
                </Box>

                <Flex
                    alignItems="center"
                    justifyContent="center"
                    marginBottom="8px"
                    flexWrap="wrap"
                >
                    {delegates}
                </Flex>
                <Lobbying
                    canLobby={canLobby}
                    action={lobbying}
                    apiClient={apiClient}
                    party={party}
                />
            </PartyPanel>
        );
        delegations.push(element);
    }

    const party = getPartyConfig(turmoil.rulingParty);

    const partyActionCost = party?.action?.cost ?? 0;

    const {collectPaymentAndPerformAction, triggerRef} = usePaymentPopover({
        onConfirmPayment: handleClickPolicy,
        opts: {type: 'action', cost: partyActionCost, action: {}},
    });

    const canDoRulingPolicyAction = actionGuard.canDoRulingPolicyAction(
        player.resources
    );
    return (
        <Flex
            color={colors.LIGHT_2}
            flexDirection="column"
            flex="1 1 0px"
            alignItems="center"
            className="turmoil"
            width="100%"
            maxWidth="576px"
        >
            <h2 className="display no-margin-top">Global Events</h2>
            <Flex
                flexWrap="wrap"
                width="100%"
                alignItems="center"
                justifyContent="center"
            >
                <GlobalEventCard name={turmoil.distantGlobalEvent.name} />
                <GlobalEventCard name={turmoil.comingGlobalEvent.name} />
                {turmoil.currentGlobalEvent ? (
                    <GlobalEventCard name={turmoil.currentGlobalEvent.name} />
                ) : (
                    <EmptyGlobalEvent />
                )}
            </Flex>
            <Box display="table" className="policy-table" width="100%">
                <Box display="table-row">
                    <Box display="table-cell">
                        <Flex
                            alignItems="center"
                            justifyContent="flex-start"
                            flexDirection="column"
                            margin="12px"
                        >
                            <h3 className="display">Ruling Policy</h3>
                            <PartyPanel width="fit-content" display="flex">
                                <PartyPolicy
                                    party={turmoil.rulingParty}
                                    canClick={canDoRulingPolicyAction}
                                    ref={triggerRef}
                                    disabled={!canDoRulingPolicyAction}
                                    onClick={collectPaymentAndPerformAction}
                                />
                            </PartyPanel>
                        </Flex>
                    </Box>
                    <Box display="table-cell">
                        <Flex
                            alignItems="center"
                            justifyContent="flex-start"
                            flexDirection="column"
                            margin="12px"
                        >
                            <h3 className="display">Chairperson</h3>
                            <DelegateComponent
                                delegate={turmoil.chairperson}
                                // isLeader={true}
                            />
                        </Flex>
                    </Box>
                </Box>
                <Box display="table-row">
                    <Box display="table-cell">
                        <Flex
                            alignItems="center"
                            justifyContent="flex-start"
                            flexDirection="column"
                            margin="12px"
                        >
                            <h3
                                className="display"
                                style={{textAlign: 'center'}}
                            >
                                Lobby
                            </h3>

                            <Box margin="0 auto" fontSize="10px">
                                {turmoil.lobby.map((delegate, index) =>
                                    delegate ? (
                                        <DelegateComponent
                                            // isLeader={false}
                                            delegate={delegate}
                                            key={index}
                                        />
                                    ) : null
                                )}
                                {turmoil.lobby.every(delegate => !delegate) ? (
                                    <em>The lobby is empty.</em>
                                ) : null}
                            </Box>
                        </Flex>
                    </Box>
                    <Box display="table-cell">
                        <Flex
                            alignItems="center"
                            justifyContent="flex-start"
                            flexDirection="column"
                            margin="12px"
                        >
                            <h3
                                className="display"
                                style={{textAlign: 'center'}}
                            >
                                Delegate Reserve
                            </h3>

                            <Box margin="0 auto" fontSize="10px">
                                {Object.keys(turmoil.delegateReserve).map(
                                    playerIndex => {
                                        const delegates =
                                            turmoil.delegateReserve[
                                                playerIndex
                                            ];
                                        return (
                                            <Flex key={playerIndex}>
                                                {delegates.map(
                                                    (delegate, index) =>
                                                        delegate ? (
                                                            <DelegateComponent
                                                                // isLeader={false}
                                                                delegate={
                                                                    delegate
                                                                }
                                                                key={index}
                                                            />
                                                        ) : null
                                                )}
                                            </Flex>
                                        );
                                    }
                                )}
                            </Box>
                        </Flex>
                    </Box>
                </Box>
            </Box>

            <TurmoilPartyListWithDetailView />

            <Box marginTop="12px" margin="0 auto" width="100%">
                <h3 className="display" style={{textAlign: 'center'}}>
                    Delegations
                </h3>

                <ResponsiveMasonry columnsCountBreakPoints={{0: 1, 390: 2}}>
                    <Masonry gutter="8px">{delegations}</Masonry>
                </ResponsiveMasonry>
            </Box>
        </Flex>
    );
}

const PartyPanelInternal = props => (
    <Box
        boxShadow={props.canClick ? '0px 0px 38px 5px #000000' : 'none'}
        padding="4px"
        fontSize="20px"
        borderRadius="4px"
        color="#333"
        background="#d7d7d7"
        {...props}
    />
);

const PartyPanel = React.memo(PartyPanelInternal);

const PartyTitle = styled(Box)`
    &:hover {
        box-shadow: none;
    }
`;
