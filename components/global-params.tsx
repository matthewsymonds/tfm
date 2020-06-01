import styled from 'styled-components';
import {Parameter, GlobalParameters} from 'constants/board';
import {Panel, Box} from './box';
import {colors} from 'constants/game';

const GlobalParamName = styled.span`
    font-style: italic;
`;

const GlobalParamValue = styled.span<{color: string}>`
    margin-left: 4px;
    color: ${props => props.color};
`;

type GlobalParamsProps = {
    parameters: GlobalParameters;
};

export default function GlobalParams(props: GlobalParamsProps) {
    const {parameters} = props;

    return (
        <Panel>
            <Box margin="8px">
                <Box marginBottom="4px">
                    <GlobalParamName>Temperature</GlobalParamName>
                    <GlobalParamValue color={colors[0]}>
                        {parameters[Parameter.TEMPERATURE]}
                    </GlobalParamValue>
                </Box>
                <Box marginBottom="4px">
                    <GlobalParamName>Oxygen</GlobalParamName>
                    <GlobalParamValue color={colors[1]}>
                        {parameters[Parameter.OXYGEN]}
                    </GlobalParamValue>
                </Box>
                <Box marginBottom="4px">
                    <GlobalParamName>Ocean</GlobalParamName>
                    <GlobalParamValue color={colors[2]}>
                        {parameters[Parameter.OCEAN]}
                    </GlobalParamValue>
                </Box>
            </Box>
        </Panel>
    );
}
