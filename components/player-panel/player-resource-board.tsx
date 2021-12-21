import {Flex} from 'components/box';
import {ResourceIcon} from 'components/icons/resource';
import {colors} from 'components/ui';
import {Parameter} from 'constants/board';
import {CONVERSIONS} from 'constants/conversion';
import {Resource} from 'constants/resource-enum';
import {useActionGuard} from 'hooks/use-action-guard';
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
    player: PlayerState;
};

export const ResourceBoardCell = ({player, resource}: ResourceBoardCellProps) => {
    const actionGuard = useActionGuard(player.username);
    const amount = player.resources[resource];
    const production = player.productions[resource];
    const conversion = CONVERSIONS[resource];

    let showConversionAnimation = false;
    if (conversion) {
        [showConversionAnimation] = actionGuard.canDoConversionInSpiteOfUI(conversion);
    }

    let className = 'display';
    if (showConversionAnimation) {
        if (resource === Resource.PLANT) className += ' canDoPlantConversion';
        if (resource === Resource.HEAT) className += ' canDoHeatConversion';
    }

    return (
        <ResourceBoardCellBase className={className}>
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
