/** @jsx jsx */
import {jsx} from '@emotion/core';
import {Parameter, GlobalParameters} from '../constants/board';

type GlobalParamsProps = {
    parameters: GlobalParameters;
};

export default function GlobalParams(props: GlobalParamsProps) {
    const {parameters} = props;

    return (
        <div
            css={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                left: 50,
                padding: 8,
                backgroundColor: 'hsla(28, 0%, 85%, 1)',
                borderRadius: 3
            }}>
            <div>
                <span>Temperature</span>
                <span css={{marginLeft: 4}}>{parameters[Parameter.TEMPERATURE]}</span>
            </div>
            <div>
                <span>Oxygen</span>
                <span css={{marginLeft: 4}}>{parameters[Parameter.OXYGEN]}</span>
            </div>
            <div>
                <span>Ocean</span>
                <span css={{marginLeft: 4}}>{parameters[Parameter.OCEAN]}</span>
            </div>
            <div>
                <span>Venus</span>
                <span css={{marginLeft: 4}}>{parameters[Parameter.VENUS]}</span>
            </div>
        </div>
    );
}
