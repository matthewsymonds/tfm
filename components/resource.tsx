import {ApiClient} from 'api-client';
import {ActionGuard} from 'client-server-shared/action-guard';
import {Flex} from 'components/box';
import {ResourceIcon} from 'components/icons/resource';
import {colors} from 'components/ui';
import {Parameter} from 'constants/board';
import {CONVERSIONS} from 'constants/conversion';
import {Resource} from 'constants/resource';
import {Pane} from 'evergreen-ui';
import {useActionGuard} from 'hooks/use-action-guard';
import {useApiClient} from 'hooks/use-api-client';
import {AppContext} from 'context/app-context';
import {useContext} from 'react';
import {useDispatch} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
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

const ResourceBoardCellBase = styled.div<{canDoConversion?: boolean}>`
    display: grid;
    grid-template-columns: repeat(3, 24px);
    grid-template-rows: 24px;
    align-items: center;
    margin: 4px 4px 0px 0;
    font-size: 14px;
    background-color: ${colors.LIGHTEST_BG};
    border: 1px solid #222;
    cursor: default;

    &.canDoPlantConversion {
        animation: ${plantBgCycle} 4s ease-in-out infinite;
        animation-delay: 2s;
        cursor: pointer;
    }

    &.canDoHeatConversion {
        animation: ${heatBgCycle} 4s ease-in-out infinite;
        cursor: pointer;
    }
`;

export type ResourceBoardCellProps = {
    resource: Resource;
    amount: number;
    production: number;
    handleOnClick?: () => void;
    showConversionAnimation?: boolean;
};

export const ResourceBoardCell = ({
    amount,
    production,
    resource,
    showConversionAnimation,
    handleOnClick,
}: ResourceBoardCellProps) => {
    let className = 'display';
    if (showConversionAnimation) {
        if (resource === Resource.PLANT) className += ' canDoPlantConversion';
        if (resource === Resource.HEAT) className += ' canDoHeatConversion';
    }

    return (
        <ResourceBoardCellBase className={className} onClick={handleOnClick}>
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
    plantConversionOnly?: boolean;
};

export const PlayerResourceBoard = ({
    player,
    isLoggedInPlayer,
    plantConversionOnly,
}: PlayerResourceBoardProps) => {
    const apiClient = useApiClient();
    const actionGuard = useActionGuard();

    return (
        <Flex flexDirection="column">
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
                        if (canDoConversion) {
                            [
                                canDoConversionInSpiteOfUI,
                                reason,
                            ] = actionGuard.canPlayActionInSpiteOfUI(conversion, state);
                        }

                        function handleOnClick() {
                            if (isLoggedInPlayer && canDoConversion) {
                                apiClient.doConversionAsync({resource});
                            }
                        }

                        return (
                            <ResourceBoardCell
                                key={resource}
                                resource={resource}
                                amount={player.resources[resource]}
                                production={player.productions[resource]}
                                showConversionAnimation={canDoConversionInSpiteOfUI}
                                handleOnClick={handleOnClick}
                            />
                        );
                    })}
                </ResourceBoardRow>
            </ResourceBoard>
        </Flex>
    );
};
