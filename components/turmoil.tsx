import {Deck} from 'constants/card-types';
import {PLAYER_COLORS} from 'constants/game';
import {getGlobalEvent} from 'constants/global-events';
import {Party, PARTY_CONFIGS} from 'constants/party';
import {Delegate} from 'constants/turmoil';
import React from 'react';
import Masonry, {ResponsiveMasonry} from 'react-responsive-masonry';
import {useTypedSelector} from 'reducer';
import styled from 'styled-components';
import {Box, Flex} from './box';
import {CARD_HEIGHT, CARD_WIDTH, MainCardText} from './card/Card';
import {renderArrow, renderLeftSideOfArrow, renderRightSideOfArrow} from './card/CardActions';
import {renderExchangeRates, renderTrigger} from './card/CardEffects';
import {BaseActionIconography, Colon} from './card/CardIconography';
import {GenericCardTitleBar} from './card/CardTitle';
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

export function PartySymbol({party, left, right}: {party?: Party; left?: string; right?: string}) {
    switch (party) {
        case Party.MARS_FIRST:
            return (
                <PartyBase background="#ab291a" left={left} right={right}>
                    ♂
                </PartyBase>
            );
        case Party.SCIENTISTS:
            return (
                <PartyBase background="darkgray" left={left} right={right}>
                    🧪
                </PartyBase>
            );
        case Party.UNITY:
            return (
                <PartyBase
                    background="linear-gradient(to right,#38388f,#3ca4c7,#38388f)"
                    left={left}
                    right={right}
                    className="overlapping"
                >
                    <div>◯</div>
                    <div>◯</div>
                    <div>◯</div>
                </PartyBase>
            );
        case Party.GREENS:
            return (
                <PartyBase background="#229522" left={left} right={right}>
                    🌲
                </PartyBase>
            );
        case Party.REDS:
            return (
                <PartyBase background="#2a0e00" left={left} right={right}>
                    🚩
                </PartyBase>
            );
        case Party.KELVINISTS:
            return (
                <PartyBase background="#363636" left={left} right={right}>
                    🔥
                </PartyBase>
            );
        default:
            return <PartyBase background="gray" left={left} right={right}></PartyBase>;
    }
}

function PartyPolicyInternal({party}: {party: Party}) {
    const rulingPartyPolicy = PARTY_CONFIGS[party];

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
            <Flex alignItems="center" justifyContent="center">
                {renderLeftSideOfArrow(action)}
                {renderArrow()}
                {renderRightSideOfArrow(action, undefined, undefined, true)}
            </Flex>
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

function DelegateComponent({delegate, isLeader}: {delegate: Delegate; isLeader: boolean}) {
    return (
        <Flex
            borderRadius="50%"
            borderWidth="1px"
            width="12px"
            height="12px"
            lineHeight="16px"
            fontSize="20px"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderColor={isLeader ? 'darkgray' : 'transparent'}
            borderStyle="solid"
            fontFamily="u1f400"
            padding="6px"
            background={
                delegate?.playerIndex !== undefined
                    ? PLAYER_COLORS[delegate.playerIndex]
                    : 'transparent'
            }
        >
            👤
        </Flex>
    );
}

export function Turmoil() {
    const isTurmoilEnabled = useTypedSelector(state => state.options.decks.includes(Deck.TURMOIL));
    if (!isTurmoilEnabled) return null;
    const turmoil = useTypedSelector(state => state.common.turmoil!);

    const delegations: React.ReactElement[] = [];
    for (const delegation in turmoil.delegations) {
        const party = PARTY_CONFIGS[delegation];
        const delegates = turmoil.delegations[delegation].map((delegate, index) => (
            <DelegateComponent delegate={delegate} isLeader={index === 0} key={index} />
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
                        <PartySymbol party={delegation as Party} />
                    </Box>
                </Flex>
                <Box>
                    <span style={{marginRight: '4px', fontSize: '10px'}}>Policy:</span>
                    <PartyPolicy party={delegation as Party} />
                </Box>
                <Box>
                    <span style={{marginRight: '4px', fontSize: '10px'}}>Bonus:</span>
                    <BaseActionIconography inline={true} card={party.partyBonus} />
                </Box>

                {delegates}
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
