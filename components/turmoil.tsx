import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Action, Payment} from 'constants/action';
import {Deck} from 'constants/card-types';
import {getGlobalEvent} from 'constants/global-events';
import {getParty, PartyConfig, UNITY} from 'constants/party';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import Masonry, {ResponsiveMasonry} from 'react-responsive-masonry';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {Box, Flex} from './box';
import {CARD_HEIGHT, CARD_WIDTH, MainCardText} from './card/Card';
import {
    ActionContainerBase,
    renderArrow,
    renderLeftSideOfArrow,
    renderRightSideOfArrow,
} from './card/CardActions';
import {renderExchangeRates, renderTrigger} from './card/CardEffects';
import {BaseActionIconography, Colon} from './card/CardIconography';
import {GenericCardTitleBar} from './card/CardTitle';
import {DelegateComponent} from './delegate';
import PaymentPopover from './popovers/payment-popover';
import TexturedCard from './textured-card';
import {colors} from './ui';

function GlobalEventCard({name}: {name: string}) {
    const globalEvent = getGlobalEvent(name);
    if (!globalEvent) return null;
    return (
        <Box marginLeft="4px" marginRight="4px">
            <TexturedCard width={CARD_WIDTH - 20} height={CARD_HEIGHT - 30} borderWidth={2}>
                <GenericCardTitleBar bgColor={colors.CARD_GLOBAL_EVENT} padding="4px 0">
                    <Box margin="0 4px">
                        <PartySymbol party={globalEvent.top.party} margin="0 auto 0 0" />
                    </Box>
                    <Box flexGrow="1" marginRight="4px">
                        {globalEvent.top.name}
                    </Box>
                </GenericCardTitleBar>
                <GenericCardTitleBar bgColor={colors.CARD_EVENT} padding="4px 0">
                    <Box flexGrow="1" marginLeft="4px">
                        {globalEvent.bottom.name}
                    </Box>
                    <Box margin="0 4px">
                        <PartySymbol party={globalEvent.bottom.party} margin="0 0 0 auto" />
                    </Box>
                </GenericCardTitleBar>
                <MainCardText>{globalEvent.action.text}</MainCardText>
                {globalEvent.firstPlayerAction ? (
                    <Box margin="8px">
                        <BaseActionIconography card={globalEvent.firstPlayerAction} />
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
                height={CARD_HEIGHT - 30}
                borderWidth={2}
            >
                <GenericCardTitleBar bgColor={colors.CARD_GLOBAL_EVENT}>
                    No current Global Event
                </GenericCardTitleBar>
            </TexturedCard>
        </Box>
    );
}

const PartyBase = styled.div<{background: string; margin: string; size: number}>`
    color: #eee;
    border-radius: ${props => props.size * 0.5}px;
    line-height: ${props => props.size * 0.7}px;
    height: ${props => props.size * 0.7}px;
    width: ${props => props.size}px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => props.size * 0.4}px;
    background: ${props => props.background};
    margin: ${props => props.margin};
    border: 1px solid ${colors.DARK_4};

    &.unity > span {
        position: relative;
        left: -${props => props.size * 0.1}px;
        letter-spacing: -${props => props.size * 0.2}px;
    }
`;

export const MiniPartyIcon = styled.div`
    border-radius: 15px;
    height: 30px;
    width: 40px;
    background: gray;
    margin: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:first-child {
        width: 40px;
    }
`;

export function PartySymbol({
    party,
    margin = '0',
    size = 50,
}: {
    party: string;
    margin?: string;
    size?: number;
}) {
    const {color, symbol} = getParty(party ?? '') ?? {
        symbol: '',
        color: 'gray',
    };

    return (
        <PartyBase
            background={color}
            margin={margin}
            size={size}
            className={party === UNITY ? 'unity' : ''}
        >
            <span>{symbol}</span>
        </PartyBase>
    );
}

function PartyPolicyInternal({party, disabled}: {party: string; disabled?: boolean}) {
    const rulingPartyPolicy = getParty(party);

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
            <React.Fragment>{renderExchangeRates(rulingPartyPolicy.exchangeRates)}</React.Fragment>
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

function PartyPolicy(props) {
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
}

export const LOBBYING_COST = 5;

export function getLobbyingAction(state: GameState, player: PlayerState) {
    const turmoil = state.common.turmoil!;
    const freeDelegate = turmoil.lobby[player.index];
    return {
        cost: freeDelegate ? 0 : LOBBYING_COST,
        placeDelegatesInOneParty: 1,
    };
}

const TurmoilAction = styled(ActionContainerBase)`
    display: flex;
    align-items: center;
`;

function Lobbying({
    party,
    canLobby,
    reason,
    action,
    apiClient,
    player,
}: {
    party: PartyConfig;
    canLobby: boolean;
    reason: string;
    action: Action;
    apiClient: ApiClient;
    player: PlayerState;
}) {
    const usePaymentPopover =
        action.cost && player.corporation.name === 'Helion' && player.resources[Resource.HEAT] > 0;

    const button = (
        <PaymentPopover
            cost={action.cost ?? 0}
            onConfirmPayment={payment => apiClient.lobbyAsync(party.name, payment)}
            shouldHide={!usePaymentPopover || !canLobby}
        >
            <TurmoilAction
                disabled={!canLobby}
                onClick={() =>
                    canLobby &&
                    apiClient.lobbyAsync(party.name, {[Resource.MEGACREDIT]: action.cost})
                }
            >
                {renderLeftSideOfArrow(action)}
                {renderArrow()}
                {renderRightSideOfArrow(action)}
            </TurmoilAction>
        </PaymentPopover>
    );

    return (
        <Flex alignItems="center" justifyContent="center" flexDirection="column">
            {button}
            <Box fontSize="10px">
                <em>{canLobby ? 'Add a delegate to ' + party.name : null}</em>
            </Box>
        </Flex>
    );
}

export function canClickDelegate(state: GameState, player: PlayerState, index: number) {
    const {turmoil} = state.common;
    if (!turmoil) return false;

    if (player.removeNonLeaderDelegate) {
        return index !== 0;
    }
    return false;
}

export function canClickParty(state: GameState, player: PlayerState, party: string) {
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

export function canClickPolicy(
    state: GameState,
    actionGuard: ActionGuard,
    player: PlayerState,
    payment: Payment
) {
    const {turmoil} = state.common;
    if (!turmoil) return false;

    const {action} = getParty(turmoil.rulingParty);

    if (!action) {
        return false;
    }

    if (!actionGuard.canAffordActionCost(action, player, payment)) {
        return false;
    }

    return actionGuard.canPlayAction(action, state)[0];
}

export function Turmoil() {
    const isTurmoilEnabled = useTypedSelector(state => state.options.decks.includes(Deck.TURMOIL));
    if (!isTurmoilEnabled) return null;
    const turmoil = useTypedSelector(state => state.common.turmoil);
    if (!turmoil) return null;

    const player = useLoggedInPlayer();
    const actionGuard = useActionGuard(player.username);
    const apiClient = useApiClient();

    const [canLobby, reason] = actionGuard.canLobby();

    const lobbying: Action = useTypedSelector(state => getLobbyingAction(state, player));

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
        if (!canClickPolicy(state, actionGuard, player, payment)) {
            return;
        }

        apiClient.doRulingPolicyActionAsync(payment);
    }

    const delegations: React.ReactElement[] = [];
    for (const delegation in turmoil.delegations) {
        const party = getParty(delegation);
        const delegates = turmoil.delegations[delegation].map((delegate, index) => (
            <Box key={index} marginLeft={index === 0 ? '0px' : '2px'}>
                <DelegateComponent
                    delegate={delegate}
                    isLeader={index === 0}
                    canClick={canClickDelegate(state, player, index)}
                    onClick={() => handleClickDelegate(delegation, index)}
                />
            </Box>
        ));
        const element = (
            <PartyPanel
                key={party.name}
                canClick={canClickParty(state, player, party.name)}
                onClick={() => handleClickParty(party.name)}
            >
                <Flex
                    className="display"
                    position="relative"
                    width="100%"
                    marginBottom="8px"
                    alignItems="center"
                    flexDirection="column"
                >
                    {party.name}
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
                    <span style={{marginRight: '4px', fontSize: '10px'}}>Policy:</span>
                    <PartyPolicy party={delegation} disabled={true} />
                </Box>
                <Box>
                    <span style={{marginRight: '4px', fontSize: '10px'}}>Bonus:</span>
                    <BaseActionIconography inline={true} card={party.partyBonus} />
                </Box>

                <Flex alignItems="center" justifyContent="center" marginBottom="8px">
                    {delegates}
                </Flex>
                <Lobbying
                    canLobby={canLobby}
                    reason={reason}
                    action={lobbying}
                    apiClient={apiClient}
                    player={player}
                    party={party}
                />
            </PartyPanel>
        );
        delegations.push(element);
    }

    const party = getParty(turmoil.rulingParty);

    const partyActionCost = party?.action?.cost ?? 0;

    const usePaymentPopover =
        partyActionCost &&
        player.corporation.name === 'Helion' &&
        player.resources[Resource.HEAT] > 0;
    const canDoPolicy = canClickPolicy(state, actionGuard, player, player.resources);
    return (
        <Flex
            color={colors.LIGHT_2}
            flexDirection="column"
            margin="4px"
            flex="1 1 0px"
            alignItems="center"
            width="100%"
        >
            <h2 className="display">Global Events</h2>
            <Flex flexWrap="wrap" width="100%" alignItems="center" justifyContent="center">
                <GlobalEventCard name={turmoil.distantGlobalEvent.name} />
                <GlobalEventCard name={turmoil.comingGlobalEvent.name} />
                {turmoil.currentGlobalEvent ? (
                    <GlobalEventCard name={turmoil.currentGlobalEvent.name} />
                ) : (
                    <EmptyGlobalEvent />
                )}
            </Flex>
            <Box display="table" width="100%">
                <Box display="table-row">
                    <Box display="table-cell">
                        <Flex
                            alignItems="center"
                            justifyContent="flex-start"
                            flexDirection="column"
                            margin="12px"
                        >
                            <h3 className="display">Ruling Policy</h3>
                            <PartyPanel width="fit-content">
                                <PaymentPopover
                                    cost={partyActionCost}
                                    onConfirmPayment={payment =>
                                        apiClient.lobbyAsync(party.name, payment)
                                    }
                                    shouldHide={!usePaymentPopover || !canDoPolicy}
                                >
                                    <PartyPolicy
                                        party={turmoil.rulingParty}
                                        canClick={canDoPolicy}
                                        onClick={() =>
                                            !usePaymentPopover &&
                                            handleClickPolicy({
                                                [Resource.MEGACREDIT]: partyActionCost,
                                            })
                                        }
                                    />
                                </PaymentPopover>
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
                            <DelegateComponent delegate={turmoil.chairperson} isLeader={true} />
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
                            <h3 className="display" style={{textAlign: 'center'}}>
                                Lobby
                            </h3>

                            <Box margin="0 auto" fontSize="10px">
                                {turmoil.lobby.map((delegate, index) =>
                                    delegate ? (
                                        <DelegateComponent
                                            isLeader={false}
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
                            <h3 className="display" style={{textAlign: 'center'}}>
                                Delegate Reserve
                            </h3>

                            <Box margin="0 auto" fontSize="10px">
                                {Object.keys(turmoil.delegateReserve).map(playerIndex => {
                                    const delegates = turmoil.delegateReserve[playerIndex];
                                    return (
                                        <Flex key={playerIndex}>
                                            {delegates.map((delegate, index) =>
                                                delegate ? (
                                                    <DelegateComponent
                                                        isLeader={false}
                                                        delegate={delegate}
                                                        key={index}
                                                    />
                                                ) : null
                                            )}
                                        </Flex>
                                    );
                                })}
                            </Box>
                        </Flex>
                    </Box>
                </Box>
            </Box>
            <Box marginTop="12px" margin="0 auto" width="100%">
                <h3 className="display" style={{textAlign: 'center'}}>
                    Delegations
                </h3>

                <ResponsiveMasonry columnsCountBreakPoints={{0: 1, 260: 2}}>
                    <Masonry gutter="8px">{delegations}</Masonry>
                </ResponsiveMasonry>
            </Box>
        </Flex>
    );
}

const PartyPanel = props => (
    <Box
        onClick={props.onClick}
        boxShadow={props.canClick ? '0px 0px 38px 5px #000000' : 'none'}
        padding="4px"
        fontSize="20px"
        borderRadius="4px"
        color="#333"
        background="#d7d7d7"
        {...props}
    />
);
