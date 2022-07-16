import {Box, Flex} from 'components/box';
import {CARD_HEIGHT, CARD_WIDTH, MainCardText} from 'components/card/Card';
import {BaseActionIconography} from 'components/card/CardIconography';
import {GenericCardTitleBar} from 'components/card/CardTitle';
import {DelegateComponent} from 'components/delegate';
import {PartySymbol} from 'components/icons/turmoil';
import {TurmoilPartyListWithDetailView} from 'components/list-with-detail-view/turmoil-party-list-with-detail-view';
import {usePaymentPopover} from 'components/popovers/payment-popover';
import TexturedCard from 'components/textured-card';
import {TurmoilPartyPolicy} from 'components/turmoil-party-policy';
import {colors} from 'components/ui';
import {Payment} from 'constants/action';
import {Deck} from 'constants/card-types';
import {getGlobalEvent} from 'constants/global-events';
import {getPartyConfig, TurmoilParty} from 'constants/party';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import {GameState, PlayerState, useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {Button} from './button';

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

    function handleClickPolicy(payment: Payment) {
        if (!actionGuard.canDoRulingPolicyAction(payment)) {
            return;
        }

        apiClient.doRulingPolicyActionAsync(payment);
    }

    const rulingParty = getPartyConfig(turmoil.rulingParty as TurmoilParty);
    const rulingPartyActionCost = rulingParty?.action?.cost ?? 0;
    const {collectPaymentAndPerformAction, triggerRef} =
        usePaymentPopover<HTMLButtonElement>({
            onConfirmPayment: handleClickPolicy,
            opts: {type: 'action', cost: rulingPartyActionCost, action: {}},
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
                marginBottom="8px"
            >
                <GlobalEventCard name={turmoil.distantGlobalEvent.name} />
                <GlobalEventCard name={turmoil.comingGlobalEvent.name} />
                {turmoil.currentGlobalEvent ? (
                    <GlobalEventCard name={turmoil.currentGlobalEvent.name} />
                ) : (
                    <EmptyGlobalEvent />
                )}
            </Flex>
            <TurmoilStatusTable
                canClickRulingPolicyAction={canDoRulingPolicyAction}
                onClickRulingPolicyAction={collectPaymentAndPerformAction}
                rulingPolicyActionRef={triggerRef}
            />
            <Flex
                flexDirection="column"
                width="100%"
                backgroundColor={colors.DARK_2}
                padding="8px"
                boxSizing="border-box"
                borderRadius="4px"
            >
                <TurmoilStatusCellHeader className="display">
                    Delegations
                </TurmoilStatusCellHeader>
                <TurmoilPartyListWithDetailView />
            </Flex>
        </Flex>
    );
}

function TurmoilStatusTable({
    canClickRulingPolicyAction,
    onClickRulingPolicyAction,
    rulingPolicyActionRef,
}: {
    canClickRulingPolicyAction: boolean;
    onClickRulingPolicyAction: () => void;
    rulingPolicyActionRef: React.RefObject<HTMLButtonElement>;
}) {
    const rulingParty = useTypedSelector(
        state => state.common.turmoil?.rulingParty
    );
    const charipersonDelegate = useTypedSelector(
        state => state.common.turmoil?.chairperson
    );
    const lobbyDelegates = useTypedSelector(state =>
        state.common.turmoil?.lobby.filter(d => d !== null)
    );
    const reserveDelegatesByPlayerIndex = useTypedSelector(
        state => state.common.turmoil?.delegateReserve
    );

    if (
        !rulingParty ||
        !charipersonDelegate ||
        !lobbyDelegates ||
        !reserveDelegatesByPlayerIndex
    ) {
        return null;
    }

    return (
        <Flex justifyContent="space-between" width="100%" marginBottom="4px">
            <TurmoilStatusCell isFirstCell={true}>
                <TurmoilStatusCellHeader className="display">
                    Ruling policy
                </TurmoilStatusCellHeader>
                <TurmoilStatusCellContent>
                    {canClickRulingPolicyAction ? (
                        <Button
                            onClick={onClickRulingPolicyAction}
                            ref={rulingPolicyActionRef}
                        >
                            <TurmoilPartyPolicy
                                partyName={rulingParty as TurmoilParty}
                            />
                        </Button>
                    ) : (
                        <TurmoilPartyPolicy
                            partyName={rulingParty as TurmoilParty}
                        />
                    )}
                </TurmoilStatusCellContent>
            </TurmoilStatusCell>
            <TurmoilStatusCell>
                <TurmoilStatusCellHeader className="display">
                    Chairperson
                </TurmoilStatusCellHeader>
                <TurmoilStatusCellContent>
                    <DelegateComponent
                        delegate={charipersonDelegate}
                        size={20}
                    />
                </TurmoilStatusCellContent>
            </TurmoilStatusCell>
            <TurmoilStatusCell>
                <TurmoilStatusCellHeader className="display">
                    Lobby
                </TurmoilStatusCellHeader>
                <TurmoilStatusCellContent>
                    {lobbyDelegates.length === 0 ? (
                        <span style={{fontSize: 14}}>
                            <em>No delegates</em>
                        </span>
                    ) : (
                        lobbyDelegates.map((delegate, index) => (
                            <DelegateComponent
                                key={`${
                                    delegate?.playerIndex ?? 'neutral'
                                }-${index}`}
                                delegate={delegate}
                                size={20}
                                margin="0 0 0 2px"
                            />
                        ))
                    )}
                </TurmoilStatusCellContent>
            </TurmoilStatusCell>
            <TurmoilStatusCell isLastCell={true}>
                <TurmoilStatusCellHeader className="display">
                    Delegate reserve
                </TurmoilStatusCellHeader>

                <TurmoilStatusCellContent>
                    {Object.entries(reserveDelegatesByPlayerIndex).map(
                        ([playerIndex, reserveDelegates], index) => {
                            return (
                                <Flex
                                    key={playerIndex}
                                    alignItems="center"
                                    marginRight={
                                        index ===
                                        Object.entries(
                                            reserveDelegatesByPlayerIndex
                                        ).length -
                                            1
                                            ? '0px'
                                            : '8px'
                                    }
                                >
                                    <span style={{fontSize: 14}}>
                                        {reserveDelegates.length}
                                    </span>
                                    <DelegateComponent
                                        delegate={{
                                            playerIndex: Number(playerIndex),
                                        }}
                                        size={20}
                                        margin="0 0 0 2px"
                                    />
                                </Flex>
                            );
                        }
                    )}
                </TurmoilStatusCellContent>
            </TurmoilStatusCell>
        </Flex>
    );
}

const TurmoilStatusCell = styled.div<{
    isFirstCell?: boolean;
    isLastCell?: boolean;
}>`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 8px;
    background: ${colors.DARK_2};
    border-radius: 4px;
    flex: 1 1 25%;
    margin-left: ${props => (props.isFirstCell ? '0' : '2px')};
    margin-right: ${props => (props.isLastCell ? '0' : '2px')};
`;

const TurmoilStatusCellHeader = styled.h4`
    color: ${colors.YELLOW};
    opacity: 0.8;
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 4px 0;
`;

const TurmoilStatusCellContent = styled.div`
    display: flex;
    align-items: center;
`;
