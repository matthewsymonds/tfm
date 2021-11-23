import {ApiClient} from 'api-client';
import {Action} from 'constants/action';
import {Deck} from 'constants/card-types';
import {getGlobalEvent} from 'constants/global-events';
import {getParty, PartyConfig} from 'constants/party';
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
                        <PartySymbol party={globalEvent.top.party} right="auto" />
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
                        <PartySymbol party={globalEvent.bottom.party} left="auto" />
                    </Box>
                </GenericCardTitleBar>
                <MainCardText>{globalEvent.action.text}</MainCardText>
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

const PartyBase = styled.div<{background: string; left?: string; right?: string}>`
    color: #eee;
    border-radius: 32px;
    height: 30px;
    min-width: 50px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 24px;
    text-shadow: 0px 0px 4px rgba(200, 200, 200, 0.4);
    background: ${props => props.background};
    margin-left: ${props => props.left};
    margin-right: ${props => props.right};
    box-shadow: 0 0 0 1px rgba(100, 100, 100, 0.4);
    &.overlapping {
        position: relative;
        & > :first-child {
            position: absolute;
            left: 4px;
        }
        & > :last-child {
            position: absolute;
            right: 4px;
        }
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

export function PartySymbol({party, left, right}: {party?: string; left?: string; right?: string}) {
    const {color, symbol, className = '', repeatSymbol = false} = getParty(party ?? '') ?? {
        symbol: '',
        color: 'gray',
    };

    const numSymbolElements = repeatSymbol || 1;
    let symbolElements: React.ReactElement[] = [];
    for (let i = 0; i < numSymbolElements; i++) {
        symbolElements.push(<div key={i}>{symbol}</div>);
    }
    return (
        <PartyBase background={color} left={left} right={right} className={className}>
            {symbolElements}
        </PartyBase>
    );
}

function PartyPolicyInternal({party}: {party: string}) {
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
            <TurmoilAction>
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
        <Flex display="inline-flex" flexGrow="1">
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

    const delegations: React.ReactElement[] = [];
    for (const delegation in turmoil.delegations) {
        const party = getParty(delegation);
        const delegates = turmoil.delegations[delegation].map((delegate, index) => (
            <Box key={index} marginLeft={index === 0 ? '0px' : '2px'}>
                <DelegateComponent delegate={delegate} isLeader={index === 0} />
            </Box>
        ));
        const element = (
            <PartyPanel key={party.name}>
                <Flex
                    className="display"
                    position="relative"
                    width="100%"
                    marginBottom="8px"
                    alignItems="center"
                >
                    {party.name}
                    <Box position="absolute" right="0px" top="0px">
                        <PartySymbol party={delegation} />
                    </Box>
                </Flex>
                <Box>
                    <span style={{marginRight: '4px', fontSize: '10px'}}>Policy:</span>
                    <PartyPolicy party={delegation} />
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
            <Flex alignItems="flex-start" justifyContent="space-around" width="100%">
                <Flex flexDirection="column" marginTop="8px" marginBottom="2px" alignItems="center">
                    <h3 className="display">Ruling Policy</h3>
                    <PartyPanel width="fit-content">
                        <PartyPolicy party={turmoil.rulingParty} />
                    </PartyPanel>
                </Flex>
                <Flex flexDirection="column" marginTop="8px" marginBottom="2px" alignItems="center">
                    <h3 className="display">Chairperson</h3>
                    <DelegateComponent delegate={turmoil.chairperson} isLeader={true} />
                </Flex>
            </Flex>
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
        padding="4px"
        fontSize="20px"
        borderRadius="4px"
        color="#333"
        background="#d7d7d7"
        {...props}
    />
);
