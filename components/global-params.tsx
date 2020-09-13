import {Flex} from 'components/box';
import {colors} from 'components/ui';
import {getParameterName, GlobalParameters, Parameter} from 'constants/board';
import {MAX_PARAMETERS, MIN_PARAMETERS, PARAMETER_STEPS} from 'constants/game';
import styled from 'styled-components';

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

const GlobalParamStep = styled.div<{isFilledIn: boolean; color: string}>`
    border-radius: 2px;
    border: 1px solid #b5b5b5;
    flex: auto;
    padding: 2px 0;
    margin-left: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: white;
    font-weight: 500;
    background-color: ${props => props.color};
    opacity: ${props => (props.isFilledIn ? 1 : 0.2)};
`;

type GlobalParamValueProps = {
    parameter: Parameter;
    currentValue: number;
};

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
                return (
                    <GlobalParamStep
                        key={`${parameter}-${value}`}
                        isFilledIn={isFilledIn}
                        color={colors.PARAMETERS[parameter]}
                    >
                        {value}
                    </GlobalParamStep>
                );
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
