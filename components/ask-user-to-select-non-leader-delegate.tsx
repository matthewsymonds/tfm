import {PlayerState, useTypedSelector} from 'reducer';
import {
    GREENS,
    KELVINISTS,
    MARS_FIRST,
    REDS,
    SCIENTISTS,
    TurmoilParty,
    UNITY,
} from 'constants/party';
import React, {useCallback, useState} from 'react';
import {Flex, Box} from './box';
import {DelegateComponent} from './delegate';
import {useApiClient} from 'hooks/use-api-client';
import {Button} from './button';
import {colors} from './ui';
import {Delegate} from 'constants/turmoil';
import {PartySymbol} from './icons/turmoil';

export function AskUserToSelectNonLeaderDelegate({
    player,
    variant,
}: {
    player: PlayerState;
    variant: 'removeNonLeader' | 'exchangeNeutralNonLeader';
}) {
    const turmoil = useTypedSelector(state => state.common.turmoil);
    const [selectedDelegateConfig, setSelectedDelegateConfig] =
        useState<null | {
            delegateIndex: number;
            playerIndex: number | undefined;
            party: TurmoilParty;
        }>(null);
    const apiClient = useApiClient();
    const isDelegateSelectable = useCallback(
        (delegate: Delegate, delegateIndex: number, party: string) => {
            if (variant === 'exchangeNeutralNonLeader') {
                return (
                    typeof delegate.playerIndex !== 'number' &&
                    delegateIndex > 0 &&
                    delegate.playerIndex !== player.index
                );
            }
            if (variant === 'removeNonLeader') {
                return delegateIndex > 0;
            }
        },
        [variant]
    );

    if (!turmoil) return null;

    return (
        <Box>
            <h2 style={{color: colors.TEXT_LIGHT_1}}>
                {variant === 'removeNonLeader'
                    ? 'Click a non-leader delegate to remove'
                    : variant === 'exchangeNeutralNonLeader'
                    ? 'Click a neutral, non-leader delegate to exchange with'
                    : null}
            </h2>
            <Flex flexDirection="column">
                {[MARS_FIRST, SCIENTISTS, UNITY, GREENS, REDS, KELVINISTS].map(
                    party => {
                        return (
                            <Flex marginBottom="8px">
                                <Flex marginRight="16px">
                                    <PartySymbol party={party} />
                                </Flex>
                                <Flex alignItems="center">
                                    {turmoil.delegations[party].map(
                                        (delegate, delegateIndex) => {
                                            const isSelectable =
                                                isDelegateSelectable(
                                                    delegate,
                                                    delegateIndex,
                                                    party
                                                );

                                            return (
                                                <Flex marginRight="4px">
                                                    <DelegateComponent
                                                        delegate={delegate}
                                                        canClick={isSelectable}
                                                        onClick={() => {
                                                            if (isSelectable) {
                                                                setSelectedDelegateConfig(
                                                                    {
                                                                        delegateIndex:
                                                                            delegateIndex,
                                                                        playerIndex:
                                                                            delegate.playerIndex,
                                                                        party,
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </Flex>
                                            );
                                        }
                                    )}
                                </Flex>
                            </Flex>
                        );
                    }
                )}
            </Flex>
            <Flex marginTop="8px" justifyContent="center">
                {selectedDelegateConfig && (
                    <Button
                        onClick={() => {
                            if (variant === 'removeNonLeader') {
                                apiClient.completeRemoveNonLeaderDelegateAsync(
                                    selectedDelegateConfig.party,
                                    selectedDelegateConfig.delegateIndex
                                );
                            } else if (variant === 'exchangeNeutralNonLeader') {
                                apiClient.completeExchangeNeutralNonLeaderDelegateAsync(
                                    selectedDelegateConfig.party
                                );
                            }
                        }}
                    >
                        <span style={{marginRight: 4}}>
                            {variant === 'removeNonLeader'
                                ? 'Remove'
                                : variant === 'exchangeNeutralNonLeader'
                                ? 'Exchange'
                                : null}
                        </span>
                        <DelegateComponent
                            delegate={{
                                playerIndex: selectedDelegateConfig.playerIndex,
                            }}
                        />
                        {variant === 'removeNonLeader' && (
                            <span style={{margin: '0 4px'}}>from</span>
                        )}
                        {variant === 'exchangeNeutralNonLeader' && (
                            <React.Fragment>
                                <span style={{margin: '0 4px'}}>with</span>
                                <DelegateComponent
                                    delegate={{playerIndex: player.index}}
                                />
                                <span style={{margin: '0 4px'}}>in</span>
                            </React.Fragment>
                        )}
                        <PartySymbol
                            party={selectedDelegateConfig.party}
                            size={30}
                        />
                    </Button>
                )}
            </Flex>
        </Box>
    );
}
