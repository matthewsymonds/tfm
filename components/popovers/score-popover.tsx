import {Popover} from 'reactstrap';
import styled from 'styled-components';

import {getCardVictoryPoints} from 'selectors/card';
import {getGreeneryScore, getCityScore, getMilestoneScore, getAwardScore} from 'selectors/score';
import {useStore} from 'react-redux';

type Props = {
    isOpen: boolean;
    target: string | null;
    playerIndex: number;
    toggle: () => void;
};

const ScorePopoverBase = styled.div`
    padding: 16px;
    border-radius: 3px;
    box-shadow: 1px 1px 10px 0px rgba(0, 0, 0, 0.35);
    background: #f7f7f7;
    font-family: sans-serif;
`;

const ScorePopoverRow = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
    span:first-child {
        margin-right: 16px;
    }
`;

const ScorePopoverTotalRow = styled(ScorePopoverRow)`
    border-top: 1px solid black;
    font-weight: 600;
`;

export function ScorePopover({isOpen, target, toggle, playerIndex}: Props) {
    const store = useStore();
    const state = store.getState();
    const player = state.players[playerIndex];

    const terraformRating = player.terraformRating;
    const cardScore = player.playedCards.reduce((total, card) => {
        return total + getCardVictoryPoints(card.victoryPoints, state, card);
    }, 0);
    const greeneryScore = getGreeneryScore(state, playerIndex);
    const citiesScore = getCityScore(state, playerIndex);
    const milestoneScore = getMilestoneScore(state, playerIndex);
    const awardScore = getAwardScore(state, playerIndex);

    const totalScore =
        terraformRating + cardScore + greeneryScore + citiesScore + milestoneScore + awardScore;
    return (
        <Popover
            trigger="hover"
            placement="right"
            isOpen={isOpen}
            target={target}
            toggle={toggle}
            fade={true}
        >
            <ScorePopoverBase>
                <ScorePopoverRow>
                    <span>TR</span>
                    <span>{terraformRating}</span>
                </ScorePopoverRow>
                <ScorePopoverRow>
                    <span>Cards</span>
                    <span>{cardScore}</span>
                </ScorePopoverRow>
                <ScorePopoverRow>
                    <span>Cities</span>
                    <span>{citiesScore}</span>
                </ScorePopoverRow>
                <ScorePopoverRow>
                    <span>Greeneries</span>
                    <span>{greeneryScore}</span>
                </ScorePopoverRow>
                <ScorePopoverRow>
                    <span>Milestones</span>
                    <span>{milestoneScore}</span>
                </ScorePopoverRow>
                <ScorePopoverRow>
                    <span>Awards</span>
                    <span>{awardScore}</span>
                </ScorePopoverRow>
                <ScorePopoverTotalRow>
                    <span>Total</span>
                    <span>{totalScore}</span>
                </ScorePopoverTotalRow>
            </ScorePopoverBase>
        </Popover>
    );
}
