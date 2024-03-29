import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {GlobalParameters, Parameter} from 'constants/board';
import {
    GameStage,
    MAX_PARAMETERS,
    MIN_PARAMETERS,
    PARAMETER_STEPS,
} from 'constants/game';
import {PARAMETER_BONUSES} from 'constants/parameter-bonuses';
import React from 'react';
import {useTypedSelector} from 'reducer';
import {isPlayingVenus} from 'selectors/is-playing-expansion';
import styled from 'styled-components';
import {Box, Flex} from './box';
import {colors} from './ui';
import {MaybeTooltip} from './tooltip';

const GlobalParamColumn = styled.div`
    display: flex;
    flex-direction: column;
    @media (max-width: 895px) {
        flex-direction: row-reverse;
        align-items: center;
    }
    margin: 0 2px;
    flex-grow: 1;
    flex-basis: 0;
    min-width: 0;
`;

const GlobalParamStep = styled.div<{
    isFilledIn: boolean;
    color: string;
    bonus: boolean;
}>`
    flex-basis: 100%;
    border-radius: 2px;
    border: 1px solid #b5b5b5;
    border-width: ${props => (props.isFilledIn ? '2px' : '1px')};
    padding: 2px 0;
    margin: 2px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    cursor: default;
    color: white;
    font-weight: 500;
    background-color: ${props => props.color};
    opacity: ${props => (props.isFilledIn ? 1 : props.bonus ? 0.65 : 0.3)};
`;

type GlobalParamTrackProps = {
    parameter: Parameter;
    currentValue: number;
};

const GlobalParamTrackBase = styled.div`
    flex-direction: column-reverse;
    align-items: stretch;
    justify-content: stretch;
    flex: auto;
    display: flex;

    @media (max-width: 895px) {
        flex-direction: row;
    }
`;

function GlobalParamTrackStep({
    value,
    currentValue,
    parameter,
}: {
    value: number;
    currentValue: number;
    parameter: Parameter;
}) {
    const isCurrentValue = value === currentValue;
    const bonus = PARAMETER_BONUSES[parameter][value];
    const color = colors.PARAMETERS[parameter];
    const shouldShowTooltip = Boolean(bonus || isCurrentValue);

    return (
        <MaybeTooltip
            shouldShowTooltip={shouldShowTooltip}
            delayDuration={0}
            content={
                shouldShowTooltip
                    ? isCurrentValue
                        ? 'Current value'
                        : bonus!.name
                    : null
            }
        >
            <GlobalParamStep
                key={value}
                isFilledIn={isCurrentValue}
                bonus={!!bonus && currentValue < value}
                color={color}
            >
                {value}
            </GlobalParamStep>
        </MaybeTooltip>
    );
}

function GlobalParamTrack({parameter, currentValue}: GlobalParamTrackProps) {
    const numSteps =
        (MAX_PARAMETERS[parameter] - MIN_PARAMETERS[parameter]) /
        PARAMETER_STEPS[parameter];
    const steps = new Array(numSteps).fill(null).map((_, index) => {
        return MIN_PARAMETERS[parameter] + index * PARAMETER_STEPS[parameter];
    });
    steps.push(MAX_PARAMETERS[parameter]);

    return (
        <GlobalParamTrackBase>
            {steps.map(value => {
                return (
                    <GlobalParamTrackStep
                        key={value}
                        value={value}
                        parameter={parameter}
                        currentValue={currentValue}
                    />
                );
            })}
        </GlobalParamTrackBase>
    );
}

type GlobalParamsProps = {
    parameters: GlobalParameters;
};

const GlobalParamWrapper = styled.div`
    flex-direction: column;
    margin-right: 8px;
    margin-left: 8px;
    .global-param-icon {
        margin-right: 4px;
        margin-left: 4px;
        margin-top: 4px;
    }
    @media (max-width: 895px) {
        flex-direction: row;
        margin-right: 0;
        margin-top: 0;
        margin-left: 0px;
        padding-left: 8px;
        padding-right: 8px;
        width: 100%;

        .global-param-icon {
            margin-left: 0px;
        }
    }
`;

const GlobalParamColumns = styled.div`
    display: flex;
    flex-direction: row;
    @media (max-width: 895px) {
        flex-direction: column;
    }
`;

export default function GlobalParams(props: GlobalParamsProps) {
    const generation = useTypedSelector(state => state.common.generation);
    const turn = useTypedSelector(state => state.common.turn);
    const gameStage = useTypedSelector(state => state.common.gameStage);
    const isGreeneryPlacement = gameStage === GameStage.GREENERY_PLACEMENT;
    const roundText = isGreeneryPlacement
        ? 'Greenery placement'
        : `Gen ${generation}, Turn ${turn}`;

    const venus = useTypedSelector(isPlayingVenus);

    return (
        <GlobalParamWrapper className="global-params">
            <Flex
                className="textLight1 round-text"
                fontSize="12px"
                marginBottom="1px"
            >
                {roundText}
            </Flex>
            <Box display="inline-block" width="100%">
                <GlobalParamColumns>
                    {Object.keys(props.parameters)
                        .filter(
                            parameter => parameter !== Parameter.VENUS || venus
                        )
                        .map(parameter => (
                            <GlobalParamColumn key={parameter as Parameter}>
                                <GlobalParamTrack
                                    parameter={parameter as Parameter}
                                    currentValue={props.parameters[parameter]}
                                />
                                <Flex
                                    alignItems="center"
                                    justifyContent="center"
                                    className="global-param-icon"
                                    width="20px"
                                    height="24px"
                                >
                                    <GlobalParameterIcon
                                        parameter={parameter as Parameter}
                                        size={16}
                                        margin={0}
                                    />
                                </Flex>
                            </GlobalParamColumn>
                        ))}
                </GlobalParamColumns>
            </Box>
        </GlobalParamWrapper>
    );
}
