import React, {useContext} from 'react';
import styled from 'styled-components';

import {standardProjectActions, StandardProjectType} from '../constants/standard-project';
import {AppContext} from '../context/app-context';
import {useTypedSelector} from '../reducer';
import {useDispatch} from 'react-redux';

const StandardProjectsBase = styled.div`
    display: flex;
    flex-direction: column;
    padding: 8px;
    background-color: lightgray;
    border-radius: 3px;
    color: white;
`;

const StandardProjectRow = styled.div<{selectable: boolean}>`
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 4px;
    cursor: ${props => (props.selectable ? 'pointer' : 'default')};
    &:hover {
        background: ${props => (props.selectable ? 'lightgreen' : 'white')};
    }
`;

const StandardProjectPayment = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
    padding: 4px;
    color: black;
`;

const StandardProjectLabel = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background-color: yellow;
    color: black;
    padding: 4px;
    margin-left: 16px;
`;

const STANDARD_PROJECT_RENDER_CONFIGS = {
    [StandardProjectType.SELL_PATENTS]: {
        payment: '(X) Card => (X) MC',
        label: 'Sell patents'
    },
    [StandardProjectType.POWER_PLANT]: {
        payment: '11 MC => Energy prod +1',
        label: 'Power plant'
    },
    [StandardProjectType.ASTEROID]: {
        payment: '14 MC => Temparture +1',
        label: 'Asteroid'
    },
    [StandardProjectType.AQUIFER]: {
        payment: '18 MC => Ocean',
        label: 'Ocean'
    },
    [StandardProjectType.GREENERY]: {
        payment: '23 MC => Greenery',
        label: 'Greenery'
    },
    [StandardProjectType.CITY]: {
        payment: '25 MC => City',
        label: 'City'
    }
};

export default function StandardProjects() {
    const state = useTypedSelector(state => state);
    const dispatch = useDispatch();
    const context = useContext(AppContext);

    return (
        <StandardProjectsBase>
            {standardProjectActions.map(standardProjectAction => {
                const config = STANDARD_PROJECT_RENDER_CONFIGS[standardProjectAction.type];
                return (
                    <StandardProjectRow
                        selectable={context.canPlayStandardProject(standardProjectAction, state)}
                        onClick={() => {
                            if (context.canPlayStandardProject(standardProjectAction, state)) {
                                context.playStandardProject(standardProjectAction, state);
                                context.processQueue(dispatch);
                            }
                        }}>
                        <StandardProjectPayment>{config.payment}</StandardProjectPayment>
                        <StandardProjectLabel>{config.label}</StandardProjectLabel>
                    </StandardProjectRow>
                );
            })}
        </StandardProjectsBase>
    );
}
