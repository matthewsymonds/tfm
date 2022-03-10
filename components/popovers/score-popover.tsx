import {Pane, Popover, Position} from 'evergreen-ui';
import {useTypedSelector} from 'reducer';
import {getCardVictoryPoints} from 'selectors/card';
import {getVisiblePlayedCards} from 'selectors/get-played-cards';
import {isPlayingTurmoil} from 'selectors/is-playing-expansion';
import {
    getAwardScore,
    getCityScore,
    getGreeneryScore,
    getMilestoneScore,
    getTurmoilEndOfGameScore,
} from 'selectors/score';
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
    const player = useTypedSelector(state => state.players[playerIndex]);
    const terraformRating = player.terraformRating;
    const visibleCardScore = useTypedSelector(state =>
        getVisiblePlayedCards(player).reduce((total, card) => {
            return (
                total +
                getCardVictoryPoints(card.victoryPoints, state, player, card)
            );
        }, 0)
    );
    const greeneryScore = useTypedSelector(state =>
        getGreeneryScore(state, playerIndex)
    );
    const citiesScore = useTypedSelector(state =>
        getCityScore(state, playerIndex)
    );
    const milestoneScore = useTypedSelector(state =>
        getMilestoneScore(state, playerIndex)
    );
    const awardScore = useTypedSelector(state =>
        getAwardScore(state, playerIndex)
    );
    const turmoilScore = useTypedSelector(state =>
        getTurmoilEndOfGameScore(state, playerIndex)
    );

    const playingTurmoil = useTypedSelector(state => isPlayingTurmoil(state));

    const totalScore =
        terraformRating +
        visibleCardScore +
        greeneryScore +
        citiesScore +
        milestoneScore +
        awardScore +
        turmoilScore;
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
                    {playingTurmoil ? (
                        <ScorePopoverRow>
                            <span>Turmoil</span>
                            <span>{turmoilScore}</span>
                        </ScorePopoverRow>
                    ) : null}
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
