import {useContext} from 'react';
import {useDispatch} from 'react-redux';
import {Milestone} from '../../constants/board';
import {AppContext} from '../../context/app-context';
import {useTypedSelector} from '../../reducer';
import {BoardActionHeader, BoardActionRow, BoardActionsContainer} from './board-actions';

function getTextForMilestone(milestone: Milestone) {
    switch (milestone) {
        case Milestone.BUILDER:
            return 'Builder';
        case Milestone.GARDENER:
            return 'Gardener';
        case Milestone.PLANNER:
            return 'Planner';
        case Milestone.TERRAFORMER:
            return 'Terraformer';
        case Milestone.MAYOR:
            return 'Mayor';
        default:
            throw new Error('Unrecognized milestone');
    }
}

function Milestones() {
    const context = useContext(AppContext);
    const state = useTypedSelector(state => state);
    const dispatch = useDispatch();

    return (
        <BoardActionsContainer>
            <BoardActionHeader>Milestones</BoardActionHeader>
            {Object.values(Milestone).map(milestone => {
                const hasBeenClaimed = !!state.common.claimedMilestones.find(
                    m => m.milestone === milestone
                );
                const text = getTextForMilestone(milestone);
                return (
                    <BoardActionRow
                        key={milestone}
                        selectable={context.canClaimMilestone(milestone, state)}
                        onClick={() => {
                            if (context.canClaimMilestone(milestone, state)) {
                                context.claimMilestone(milestone, state);
                                context.processQueue(dispatch);
                            }
                        }}
                    >
                        <span>{hasBeenClaimed ? <s>{text}</s> : text}</span>
                        <span>8</span>
                    </BoardActionRow>
                );
            })}
        </BoardActionsContainer>
    );
}

export default Milestones;
