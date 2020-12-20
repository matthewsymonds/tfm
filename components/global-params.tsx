import {getParameterName, GlobalParameters, Parameter} from 'constants/board';
import {MAX_PARAMETERS, MIN_PARAMETERS, PARAMETER_STEPS} from 'constants/game';
import {PARAMETER_BONUSES} from 'constants/parameter-bonuses';
import {Tooltip} from 'react-tippy';
import styled from 'styled-components';
import {Flex} from './box';
import {colors} from './ui';

const GlobalParamsBase = styled.div`
    width: 100%;
    margin-top: 8px;
`;

const GlobalParamRow = styled.div`
    display: flex;
    margin-bottom: 2px;
    flex-direction: row;
`;

const GlobalParamName = styled.span`
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 90px;
    color: white;
    letter-spacing: 0.1em;
    font-size: 10px;
    margin-right: 2px;
`;

const GlobalParamStep = styled.div<{isFilledIn: boolean; color: string; bonus: boolean}>`
    border-radius: 2px;
    border: 1px solid #b5b5b5;
    padding: 2px 0;
    margin-left: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: white;
    font-weight: 500;
    background-color: ${props => props.color};
    opacity: ${props => (props.isFilledIn ? 1 : props.bonus ? 0.65 : 0.4)};
`;

type GlobalParamValueProps = {
    parameter: Parameter;
    currentValue: number;
};

const BonusTooltip = styled.div<{color: string}>`
    border-radius: 3px;
    background-color: #fae2cf;
    color: #111111;
    border: 1px solid ${props => props.color};
    padding: 8px;
    font-size: 11px;
`;

function GlobalParamValue({parameter, currentValue}: GlobalParamValueProps) {
    const numSteps =
        (MAX_PARAMETERS[parameter] - MIN_PARAMETERS[parameter]) / PARAMETER_STEPS[parameter];
    const steps = new Array(numSteps).fill(null).map((_, index) => {
        return MIN_PARAMETERS[parameter] + index * PARAMETER_STEPS[parameter];
    });
    steps.push(MAX_PARAMETERS[parameter]);

    return (
        <Flex justifyContent="space-between" flex="auto">
            {steps.map(value => {
                const isFilledIn = currentValue === value;
                // Takes logged in player index, but we don't need that.
                const bonus = PARAMETER_BONUSES[parameter][value]?.(0);
                const color = colors.PARAMETERS[parameter];
                // Where's the water?
                const stepElement = (
                    <GlobalParamStep
                        key={`${parameter}-${value}`}
                        isFilledIn={isFilledIn}
                        bonus={!!bonus}
                        color={color}
                    >
                        {value}
                    </GlobalParamStep>
                );

                const showTooltip = isFilledIn || !!bonus;

                return (
                    <Tooltip
                        style={{flexBasis: '100%'}}
                        sticky={true}
                        animation="fade"
                        html={
                            showTooltip ? (
                                <BonusTooltip color={color}>
                                    {isFilledIn ? 'Current value' : bonus!.name}
                                </BonusTooltip>
                            ) : (
                                <div />
                            )
                        }
                    >
                        {stepElement}
                    </Tooltip>
                );

                return stepElement;
            })}
        </Flex>
    );
}

type GlobalParamsProps = {
    parameters: GlobalParameters;
};

export default function GlobalParams(props: GlobalParamsProps) {
    return (
        <GlobalParamsBase>
            {Object.keys(props.parameters).map(parameter => (
                <GlobalParamRow key={parameter as Parameter}>
                    <GlobalParamName>{getParameterName(parameter as Parameter)}</GlobalParamName>
                    <GlobalParamValue
                        parameter={parameter as Parameter}
                        currentValue={props.parameters[parameter]}
                    />
                </GlobalParamRow>
            ))}
        </GlobalParamsBase>
    );
}
