import React, {useContext} from 'react';

import {
    standardProjectActions,
    StandardProjectType,
    StandardProjectAction,
} from '../../constants/standard-project';
import {AppContext} from '../../context/app-context';
import {useTypedSelector, PlayerState} from '../../reducer';
import {useDispatch} from 'react-redux';
import {BoardActionsContainer, BoardActionRow, BoardActionHeader} from './board-actions';
import {useLoggedInPlayer} from '../../selectors/players';

function getTextForStandardProject(standardProject: StandardProjectType) {
    switch (standardProject) {
        case StandardProjectType.SELL_PATENTS:
            return 'Sell patents';
        case StandardProjectType.POWER_PLANT:
            return 'Power plant';
        case StandardProjectType.ASTEROID:
            return 'Asteroid';
        case StandardProjectType.AQUIFER:
            return 'Ocean';
        case StandardProjectType.GREENERY:
            return 'Greenery';
        case StandardProjectType.CITY:
            return 'City';
    }
}

function getPriceForStandardProject(
    standardProjectAction: StandardProjectAction,
    player: PlayerState
) {
    switch (standardProjectAction.type) {
        case StandardProjectType.SELL_PATENTS:
            return 'X';
        case StandardProjectType.POWER_PLANT:
            return standardProjectAction.cost - player.discounts.standardProjectPowerPlant;
        default:
            return standardProjectAction.cost;
    }
}

export default function StandardProjects() {
    const state = useTypedSelector(state => state);
    const dispatch = useDispatch();
    const context = useContext(AppContext);
    const player = useLoggedInPlayer();

    return (
        <BoardActionsContainer>
            <BoardActionHeader>Standard&nbsp;Projects</BoardActionHeader>
            {standardProjectActions.map((standardProjectAction, index) => {
                return (
                    <BoardActionRow
                        key={index}
                        selectable={context.canPlayStandardProject(standardProjectAction, state)}
                        onClick={() => {
                            if (context.canPlayStandardProject(standardProjectAction, state)) {
                                context.playStandardProject(standardProjectAction, state);
                                context.processQueue(dispatch);
                            }
                        }}
                    >
                        <span>{getTextForStandardProject(standardProjectAction.type)}</span>
                        <span>{getPriceForStandardProject(standardProjectAction, player)}</span>
                    </BoardActionRow>
                );
            })}
        </BoardActionsContainer>
    );
}
