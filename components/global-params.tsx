import {GlobalParameterIcon} from 'components/icons/global-parameter';
import {GlobalParameters, Parameter} from 'constants/board';
import {GameStage, MAX_PARAMETERS, MIN_PARAMETERS, PARAMETER_STEPS} from 'constants/game';
import {PARAMETER_BONUSES} from 'constants/parameter-bonuses';
import {Tooltip} from 'react-tippy';
import {useTypedSelector} from 'reducer';
import {isPlayingVenus} from 'selectors/is-playing-venus';
import styled from 'styled-components';
import {Flex} from './box';
import {ColoredTooltip} from './colored-tooltip';
import {colors} from './ui';

const GlobalParamColumn = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0 2px;
`;

const GlobalParamStep = styled.div<{isFilledIn: boolean; color: string; bonus: boolean}>`
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
        <Flex
            flexDirection="column-reverse"
            alignItems="stretch"
            justifyContent="stretch"
            flex="auto"
        >
            {steps.map(value => {
                const isFilledIn = currentValue === value;
                // Takes logged in player index, but we don't need that.
                const bonus = PARAMETER_BONUSES[parameter][value]?.(0);
                const color = colors.PARAMETERS[parameter];

                const showTooltip = isFilledIn || !!bonus;

                return (
                    <GlobalParamStep
                        key={value}
                        isFilledIn={isFilledIn}
                        bonus={!!bonus && currentValue < value}
                        color={color}
                    >
                        <Tooltip
                            key={`${parameter}-${value}`}
                            sticky={true}
                            animation="fade"
                            unmountHTMLWhenHide={true}
                            html={
                                showTooltip ? (
                                    <ColoredTooltip color={color}>
                                        {isFilledIn ? 'Current value' : bonus!.name}
                                    </ColoredTooltip>
                                ) : (
                                    <div />
                                )
                            }
                        >
                            {value}
                        </Tooltip>
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
    const generation = useTypedSelector(state => state.common.generation);
    const turn = useTypedSelector(state => state.common.turn);
    const gameStage = useTypedSelector(state => state?.common?.gameStage);
    const isGreeneryPlacement = gameStage === GameStage.GREENERY_PLACEMENT;
    const roundText = isGreeneryPlacement
        ? 'End of game Greenery placement'
        : `Gen ${generation}, Turn ${turn}`;

    const venus = useTypedSelector(isPlayingVenus);
    return (
        <Flex margin="0 4px 0 0" flexDirection="column">
            <Flex className="textLight1" fontSize="12px" marginBottom="1px">
                {roundText}
            </Flex>
            <Flex>
                {Object.keys(props.parameters)
                    .filter(parameter => parameter !== Parameter.VENUS || venus)
                    .map(parameter => (
                        <GlobalParamColumn key={parameter as Parameter}>
                            <GlobalParamValue
                                parameter={parameter as Parameter}
                                currentValue={props.parameters[parameter]}
                            />
                            <Flex alignItems="center" justifyContent="center" height="40px">
                                <GlobalParameterIcon parameter={parameter as Parameter} size={24} />
                            </Flex>
                        </GlobalParamColumn>
                    ))}
            </Flex>
        </Flex>
    );
}
