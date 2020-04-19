import styled from 'styled-components';
import {Parameter, GlobalParameters} from '../constants/board';

const GlobalParamsBase = styled.div`
    display: flex;
    flex-direction: column;
    padding: 8px;
    backgroundcolor: hsla(28, 0%, 85%, 1);
    border-radius: 3px;
    color: white;
`;

const GlobalParamValue = styled.span`
    margin-left: 4px;
`;

type GlobalParamsProps = {
    parameters: GlobalParameters;
};

export default function GlobalParams(props: GlobalParamsProps) {
    const {parameters} = props;

    return (
        <GlobalParamsBase>
            <div>
                <span>Temperature</span>
                <GlobalParamValue>{parameters[Parameter.TEMPERATURE]}</GlobalParamValue>
            </div>
            <div>
                <span>Oxygen</span>
                <GlobalParamValue>{parameters[Parameter.OXYGEN]}</GlobalParamValue>
            </div>
            <div>
                <span>Ocean</span>
                <GlobalParamValue>{parameters[Parameter.OCEAN]}</GlobalParamValue>
            </div>
            <div>
                <span>Venus</span>
                <GlobalParamValue>{parameters[Parameter.VENUS]}</GlobalParamValue>
            </div>
        </GlobalParamsBase>
    );
}
