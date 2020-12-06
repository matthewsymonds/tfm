// import {Popover} from 'reactstrap';
import {CardType} from 'constants/card-types';
import {Pane, Popover, Position} from 'evergreen-ui';
import {useTypedSelector} from 'reducer';
import {getCardVictoryPoints} from 'selectors/card';
import {getAwardScore, getCityScore, getGreeneryScore, getMilestoneScore} from 'selectors/score';
import styled from 'styled-components';

type Props = {
    playerIndex: number;
    children: React.ReactNode;
};

const ScorePopoverBase = styled.div`
    padding: 16px;
    box-shadow: 1px 1px 10px 0px rgba(0, 0, 0, 0.35);
    background: #f7f7f7;
    display: flex;
    flex-direction: column;
`;

const ScorePopoverRow = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
    span:first-child {
        margin-right: 40px;
    }
`;

const ScorePopoverTotalRow = styled(ScorePopoverRow)`
    border-top: 1px solid black;
    font-weight: 600;
    padding-top: 8px;
    margin-top: 8px;
`;

export function ScorePopover({children, playerIndex}: Props) {
    const state = useTypedSelector(state => state);
    const player = state.players[playerIndex];
    const terraformRating = player.terraformRating;
    const visibleCardScore = player.playedCards
        .filter(card => card.type !== CardType.EVENT)
        .reduce((total, card) => {
            return total + getCardVictoryPoints(card.victoryPoints, state, card);
        }, 0);
    const greeneryScore = getGreeneryScore(state, playerIndex);
    const citiesScore = getCityScore(state, playerIndex);
    const milestoneScore = getMilestoneScore(state, playerIndex);
    const awardScore = getAwardScore(state, playerIndex);

    const totalScore =
        terraformRating +
        visibleCardScore +
        greeneryScore +
        citiesScore +
        milestoneScore +
        awardScore;
    return (
        <Popover
            position={Position.BOTTOM}
            minWidth="unset"
            content={
                <ScorePopoverBase>
                    <ScorePopoverRow>
                        <span>TR</span>
                        <span>{terraformRating}</span>
                    </ScorePopoverRow>
                    <ScorePopoverRow>
                        <span>Visible Cards</span>
                        <span>{visibleCardScore}</span>
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
            }
        >
            <Pane>{children}</Pane>
        </Popover>
    );
}
