import {Box, Flex} from 'components/box';
import {ResourceIcon} from 'components/icons/resource';
import {colors} from 'components/ui';
import {Parameter} from 'constants/board';
import {CONVERSIONS} from 'constants/conversion';
import {GameStage} from 'constants/game';
import {getResourceSymbol} from 'constants/resource';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import React from 'react';
import {PlayerState, useTypedSelector} from 'reducer';
import {getUseStoredResourcesAsCard} from 'selectors/get-stored-resources-as-card';
import {SupplementalResources} from 'server/api-action-handler';
import styled, {keyframes} from 'styled-components';
import {HeatPaymentPopover} from './popovers/payment-popover';

const plantBgCycle = keyframes`
    0% {
        background-color: ${colors.LIGHTEST_BG};
    }
    40% {
        background-color: ${colors.PARAMETERS[Parameter.OXYGEN]};
    }
    60% {
        background-color: ${colors.PARAMETERS[Parameter.OXYGEN]};
    }
    100% {
        background-color: ${colors.LIGHTEST_BG};
    }
`;

const heatBgCycle = keyframes`
    0% {
        background-color: ${colors.LIGHTEST_BG};
    }
    40% {
        background-color: ${colors.PARAMETERS[Parameter.TEMPERATURE]};
    }
    60% {
        background-color: ${colors.PARAMETERS[Parameter.TEMPERATURE]};
    }
    100% {
        background-color: ${colors.LIGHTEST_BG};
    }
`;

const ResourceBoardCellBase = styled.div<{canDoConversion?: boolean; showPointerCursor?: boolean}>`
    display: grid;
    grid-template-columns: repeat(3, 24px);
    grid-template-rows: 24px;
    align-items: center;
    margin: 4px 4px 0px 0;
    font-size: 14px;
    background-color: ${colors.LIGHTEST_BG};
    border: 1px solid #222;
    cursor: ${props => (props.showPointerCursor ? 'pointer' : 'default')};

    &.canDoPlantConversion {
        animation: ${plantBgCycle} 4s ease-in-out infinite;
        animation-delay: 2s;
    }

    &.canDoHeatConversion {
        animation: ${heatBgCycle} 4s ease-in-out infinite;
    }
`;

export type ResourceBoardCellProps = {
    resource: Resource;
    amount: number;
    production: number;
    handleOnClick?: () => void;
    showConversionAnimation?: boolean;
    showPointerCursor?: boolean;
    isLoggedInPlayer?: boolean;
    children?: React.ReactNode;
};

export const ResourceBoardCell = ({
    amount,
    production,
    resource,
    showConversionAnimation,
    showPointerCursor,
    handleOnClick,
    children,
}: ResourceBoardCellProps) => {
    let className = 'display';
    if (showConversionAnimation) {
        if (resource === Resource.PLANT) className += ' canDoPlantConversion';
        if (resource === Resource.HEAT) className += ' canDoHeatConversion';
    }

    return (
        <ResourceBoardCellBase
            className={className}
            onClick={handleOnClick}
            showPointerCursor={showPointerCursor}
        >
            <Flex
                alignSelf="stretch"
                alignItems="center"
                justifyContent="center"
                style={{gridArea: '0 / 0 / 0 / 1'}}
            >
                <ResourceIcon name={resource} size={16} />
            </Flex>
            <Flex
                alignSelf="stretch"
                alignItems="center"
                justifyContent="center"
                style={{gridArea: '0 / 1 / 0 / 2'}}
            >
                {amount}
                {children ? <Box marginLeft="2px">{children}</Box> : null}
            </Flex>
            <Flex
                alignSelf="stretch"
                alignItems="center"
                justifyContent="center"
                style={{gridArea: '0 / 2 / 0 / 3'}}
                margin="2px"
                background={colors.PRODUCTION_BG}
            >
                {production}
            </Flex>
        </ResourceBoardCellBase>
    );
};

export const ResourceBoardRow = styled.div`
    display: flex;
    align-items: flex-start;
`;

export const ResourceBoard = styled.div`
    display: flex;
    flex-direction: column;
`;

type PlayerResourceBoardProps = {
    player: PlayerState;
    isLoggedInPlayer: boolean;
};

export const PlayerResourceBoard = ({player, isLoggedInPlayer}: PlayerResourceBoardProps) => {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard(player.username);

    const isEndOfGame = useTypedSelector(state => state.common.gameStage === GameStage.END_OF_GAME);

    return (
        <Flex flexDirection="column" marginTop="4px">
            <ResourceBoard>
                <ResourceBoardRow>
                    {[Resource.MEGACREDIT, Resource.STEEL, Resource.TITANIUM].map(resource => {
                        return (
                            <ResourceBoardCell
                                key={resource}
                                resource={resource}
                                amount={player.resources[resource]}
                                production={player.productions[resource]}
                            />
                        );
                    })}
                </ResourceBoardRow>
                <ResourceBoardRow>
                    {[Resource.PLANT, Resource.ENERGY, Resource.HEAT].map(resource => {
                        const conversion = CONVERSIONS[resource];
                        let [canDoConversion, reason] = actionGuard.canDoConversion(conversion);
                        let canDoConversionInSpiteOfUI = false;
                        if (conversion) {
                            [
                                canDoConversionInSpiteOfUI,
                                reason,
                            ] = actionGuard.canDoConversionInSpiteOfUI(conversion);
                        }

                        let handleOnClick = () => {
                            if (isLoggedInPlayer && canDoConversion) {
                                apiClient.doConversionAsync({resource});
                            }
                        };

                        const doConversionWithSupplementalResources = (
                            supplementalResources: SupplementalResources
                        ) => {
                            apiClient.doConversionAsync({resource, supplementalResources});
                        };

                        const element = (children?: React.ReactNode) => (
                            <ResourceBoardCell
                                key={resource}
                                resource={resource}
                                amount={player.resources[resource]}
                                production={player.productions[resource]}
                                showPointerCursor={canDoConversion && isLoggedInPlayer}
                                showConversionAnimation={canDoConversionInSpiteOfUI && !isEndOfGame}
                                handleOnClick={handleOnClick}
                            >
                                {children}
                            </ResourceBoardCell>
                        );

                        if (resource === Resource.HEAT && canDoConversion && isLoggedInPlayer) {
                            const useStoredResourceAsCard = getUseStoredResourcesAsCard(player);
                            if (useStoredResourceAsCard) {
                                const storedResource = useStoredResourceAsCard.storedResourceType;
                                const quantity = useStoredResourceAsCard.storedResourceAmount;
                                if (storedResource && quantity) {
                                    const heatCost = conversion?.removeResource[Resource.HEAT];
                                    handleOnClick = () => {};
                                    return (
                                        <HeatPaymentPopover
                                            cost={heatCost as number}
                                            key={resource}
                                            useStoredResourceAsCard={useStoredResourceAsCard}
                                            onConfirmPayment={payment => {
                                                doConversionWithSupplementalResources({
                                                    name: useStoredResourceAsCard.name,
                                                    quantity: (payment[storedResource] ??
                                                        0) as number,
                                                });
                                            }}
                                        >
                                            {element(
                                                <Flex
                                                    flexDirection="column"
                                                    alignItems="center"
                                                    transform="scale(80%)"
                                                >
                                                    <Box marginRight="2px">
                                                        {
                                                            useStoredResourceAsCard.storedResourceAmount
                                                        }
                                                    </Box>
                                                    <div>
                                                        {getResourceSymbol(
                                                            useStoredResourceAsCard.storedResourceType!
                                                        )}
                                                    </div>
                                                </Flex>
                                            )}
                                        </HeatPaymentPopover>
                                    );
                                }
                            }
                        }

                        return element();
                    })}
                </ResourceBoardRow>
            </ResourceBoard>
        </Flex>
    );
};
