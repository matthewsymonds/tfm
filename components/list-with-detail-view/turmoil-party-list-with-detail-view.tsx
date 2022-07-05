import React, {useCallback} from 'react';
import {useTypedSelector} from 'reducer';
import {Flex} from 'components/box';
import {Button} from 'components/button';
import {
    renderArrow,
    renderLeftSideOfArrow,
    renderRightSideOfArrow,
} from 'components/card/CardActions';
import {renderExchangeRates, renderTrigger} from 'components/card/CardEffects';
import {BaseActionIconography, Colon} from 'components/card/CardIconography';
import {DelegateComponent} from 'components/delegate';
import {ResourceIcon} from 'components/icons/resource';
import {colors} from 'components/ui';
import {ListWithDetailView} from 'components/list-with-detail-view/list-with-detail-view';
import {getPartyConfig, PartyConfig, TurmoilParty} from 'constants/party';
import {Resource} from 'constants/resource-enum';
import {Delegate} from 'constants/turmoil';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import styled from 'styled-components';
import {PartySymbol} from 'components/icons/turmoil';
import {getLobbyingAction} from 'selectors/get-lobbying-action';
import {TurmoilPartyPolicy} from 'components/turmoil-party-policy';

type TurmoilPartyState = PartyConfig & {
    delegates: Array<Delegate>; // delegates in the party
    isRulingParty: boolean; // is this the ruling party?
    isDominantParty: boolean; // is this the ruling party?
};

export function TurmoilPartyListWithDetailView() {
    const turmoilParties = useTypedSelector(state => {
        const partyNames = Object.keys(state.common.turmoil?.delegations ?? []);
        return partyNames.map(partyName => {
            const delegates =
                state.common.turmoil?.delegations[partyName] ?? [];
            return {
                ...getPartyConfig(partyName),
                delegates,
                isRulingParty: state.common.turmoil?.rulingParty === partyName,
                isDominantParty:
                    state.common.turmoil?.dominantParty === partyName,
            };
        });
    });

    const renderTurmoilPartyListItem = useCallback(
        (turmoilParty: TurmoilPartyState) => {
            // TODO: add indicators for dominant & ruling party
            return (
                <React.Fragment>
                    <PartySymbol party={turmoilParty.name} size={24} />
                    <span
                        style={{
                            marginLeft: 8,
                        }}
                    >
                        {turmoilParty.name}
                    </span>
                    <Flex marginLeft="8px">
                        {turmoilParty.delegates.map((delegate, index) => (
                            <DelegateComponent
                                key={`${turmoilParty.name}-${index}-${
                                    delegate.playerIndex ?? 'neutral'
                                }`}
                                delegate={delegate}
                                margin="0 2px"
                            />
                        ))}
                    </Flex>
                </React.Fragment>
            );
        },
        []
    );
    const renderTurmoilPartyDetailView = useCallback(
        (turmoilParty: TurmoilPartyState) => {
            // TODO: add indicators for dominant & ruling party
            return (
                <Flex
                    flexDirection="column"
                    alignItems="flex-start"
                    width="100%"
                    marginLeft="4px"
                >
                    <Flex
                        justifyContent="space-between"
                        alignItems="flex-start"
                        width="100%"
                    >
                        <Flex alignItems="center">
                            <PartySymbol party={turmoilParty.name} size={32} />
                            <h3
                                className="display"
                                style={{
                                    color: colors.TEXT_LIGHT_1,
                                    margin: '0 0 0 4px',
                                }}
                            >
                                {turmoilParty.name}
                            </h3>
                        </Flex>
                        <AddDelegateButton partyName={turmoilParty.name} />
                    </Flex>
                    <Flex
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="flex-start"
                        marginTop="16px"
                        height="24px"
                    >
                        {turmoilParty.delegates.length === 0 && (
                            <span style={{fontSize: 14, lineHeight: '18px'}}>
                                <em>No delegates</em>
                            </span>
                        )}
                        <Flex>
                            {turmoilParty.delegates.map((delegate, index) => (
                                <DelegateComponent
                                    key={`${turmoilParty.name}-${index}-${
                                        delegate.playerIndex ?? 'neutral'
                                    }`}
                                    delegate={delegate}
                                    margin="0 2px"
                                    size={24}
                                />
                            ))}
                        </Flex>
                    </Flex>
                    <Flex
                        justifyContent="space-between"
                        alignItems="flex-start"
                        width="calc(100% - 4px)"
                        flex="auto"
                        marginTop="8px"
                    >
                        <Flex flexDirection="column">
                            <SubHeader>Policy</SubHeader>
                            <TurmoilPartyPolicy partyName={turmoilParty.name} />
                        </Flex>
                        <Flex
                            justifyContent="center"
                            flexDirection="column"
                            alignItems="end"
                        >
                            <SubHeader>Bonus</SubHeader>
                            <BaseActionIconography
                                inline={true}
                                card={turmoilParty.partyBonus}
                            />
                        </Flex>
                    </Flex>
                </Flex>
            );
        },
        []
    );

    if (turmoilParties.length === 1) {
        return null;
    }
    return (
        <ListWithDetailView
            items={turmoilParties}
            listWidthPercentage={50}
            initialSelectedItemIndex={turmoilParties.indexOf(
                turmoilParties.find(tp => tp.isDominantParty) ??
                    turmoilParties[0]
            )}
            renderListItem={renderTurmoilPartyListItem}
            renderDetailItem={renderTurmoilPartyDetailView}
        />
    );
}

function AddDelegateButton({partyName}: {partyName: TurmoilParty}) {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();
    const loggedInPlayer = useLoggedInPlayer();
    const state = useTypedSelector(state => state);
    const lobbyAction = getLobbyingAction(state, loggedInPlayer);
    const [canLobby] = actionGuard.canLobby();

    return (
        <Button
            disabled={!canLobby}
            size="small"
            onClick={() => {
                if (canLobby) {
                    apiClient.lobbyAsync(partyName, {
                        [Resource.MEGACREDIT]: lobbyAction.cost,
                    });
                }
            }}
        >
            {lobbyAction.cost > 0 && (
                <ResourceIcon
                    name={Resource.MEGACREDIT}
                    amount={lobbyAction.cost}
                    margin="0 4px 0 0"
                    size={16}
                />
            )}
            Add delegate
        </Button>
    );
}

const SubHeader = styled.h4`
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    font-size: 0.7rem;
    margin: 8px 0;
`;

const TurmoilStatusCellHeader = styled.h4`
    color: ${colors.YELLOW};
    opacity: 0.8;
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 4px 0;
`;
