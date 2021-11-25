import {Flex} from 'components/box';
import {ResourceIcon} from 'components/icons/resource';
import {HeatPaymentPopover} from 'components/popovers/payment-popover';
import {colors} from 'components/ui';
import {Parameter} from 'constants/board';
import {CONVERSIONS} from 'constants/conversion';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {useLoggedInPlayer} from 'hooks/use-logged-in-player';
import React from 'react';
import {PlayerState} from 'reducer';
import styled, {keyframes} from 'styled-components';

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
    width: fit-content;
    align-items: center;
    flex-grow: 1;
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

function useConvertibleResource(
    resource: Resource,
    player: PlayerState
): {
    canConvert: boolean;
    handleConversionClick: null | (() => void);
} {
    const apiClient = useApiClient();
    const loggedInPlayer = useLoggedInPlayer();
    const actionGuard = useActionGuard(player.username);
    const conversion = CONVERSIONS[resource];

    if (!conversion) {
        return {canConvert: false, handleConversionClick: null};
    }

    const [canDoConversionInSpiteOfUI] = actionGuard.canDoConversionInSpiteOfUI(conversion);
    // - when looking at another players board, we never need to handle conversion click
    // - when looking at your own board, but you don't have enough resources,
    //   we also don't need to handle conversion click
    if (loggedInPlayer.index !== player.index || !canDoConversionInSpiteOfUI) {
        return {
            canConvert: canDoConversionInSpiteOfUI,
            handleConversionClick: null,
        };
    }

    let [canDoConversion, reason] = actionGuard.canDoConversion(conversion);
    if (!canDoConversion) {
        return {
            canConvert: false,
            handleConversionClick: null,
        };
    } else {
        return {
            canConvert: true,
            handleConversionClick: () => {
                apiClient.doConversionAsync({
                    resource: Resource.HEAT,
                });
            },
        };
    }
}

export type ResourceBoardCellProps = {
    resource: Resource;
    player: PlayerState;
};

export const ResourceBoardCell = ({player, resource}: ResourceBoardCellProps) => {
    const loggedInPlayer = useLoggedInPlayer();
    const isLoggedInPlayer = loggedInPlayer.index === player.index;
    const amount = player.resources[resource];
    const production = player.productions[resource];
    const {canConvert, handleConversionClick} = useConvertibleResource(resource, player);

    const showConversionAnimation = canConvert;
    let className = 'display';
    if (showConversionAnimation) {
        if (resource === Resource.PLANT) className += ' canDoPlantConversion';
        if (resource === Resource.HEAT) className += ' canDoHeatConversion';
    }

    return (
        <ResourceBoardCellBase
            className={className}
            onClick={() => handleConversionClick?.()}
            showPointerCursor={isLoggedInPlayer && canConvert}
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
                flexDirection="column"
                justifyContent="center"
                flexWrap="wrap"
                flexShrink={1}
                style={{gridArea: '0 / 1 / 0 / 2'}}
            >
                {amount}
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

export const PlayerResourceBoard = ({player}: PlayerResourceBoardProps) => {
    return (
        <Flex flexDirection="column" marginTop="4px">
            <ResourceBoard>
                <ResourceBoardRow>
                    {[Resource.MEGACREDIT, Resource.STEEL, Resource.TITANIUM].map(resource => {
                        return (
                            <ResourceBoardCell key={resource} resource={resource} player={player} />
                        );
                    })}
                </ResourceBoardRow>
                <ResourceBoardRow>
                    {[Resource.PLANT, Resource.ENERGY, Resource.HEAT].map(resource => {
                        return (
                            <ResourceBoardCell key={resource} resource={resource} player={player} />
                        );
                    })}
                </ResourceBoardRow>
            </ResourceBoard>
        </Flex>
    );
};
