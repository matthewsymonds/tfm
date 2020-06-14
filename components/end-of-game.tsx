import {useStore} from 'react-redux';
import styled from 'styled-components';
import {useRouter} from 'next/router';
import {getCardVictoryPoints} from 'selectors/card';
import {getGreeneryScore, getCityScore, getMilestoneScore, getAwardScore} from 'selectors/score';
import {useSyncState} from 'pages/sync-state';

const EndOfGameBase = styled.div`
    display: flex;
    flex-direction: column;
    margin: 50px auto;
    justify-content: center;
`;

const AllScoresContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

const PlayerScoreContainer = styled.div`
    margin: 16px;
    padding: 16px;
    border: 1px solid black;
    background-color: lightgray;
`;
const PlayerScoreHeader = styled.div`
    font-size: 22px;
    margin-bottom: 16px;
`;
const PlayerScoreRow = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 2px 0;
    span:first-child {
        margin-right: 16px;
    }
`;
const PlayerScoreTotalRow = styled(PlayerScoreRow)`
    margin-top: 8px;
    font-weight: 600;
`;

type playerScoreInfos = {
    username: string;
    corporation: string;
    terraformRating: number;
    cardScore: number;
    greeneryScore: number;
    citiesScore: number;
    milestoneScore: number;
    awardScore: number;
    totalScore: number;
};

export function EndOfGame() {
    useSyncState();
    const store = useStore();
    const state = store.getState();
    const router = useRouter();

    const playerScoreInfos: Array<playerScoreInfos> = state.players.map(player => {
        const {
            index: playerIndex,
            username,
            corporation: {name: corporation},
        } = player;
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

        return {
            username,
            corporation,
            terraformRating,
            cardScore,
            greeneryScore,
            citiesScore,
            milestoneScore,
            awardScore,
            totalScore,
        };
    });

    const winner = playerScoreInfos.sort((a, b) => a.totalScore - b.totalScore)[0];

    return (
        <EndOfGameBase>
            <h2>
                Game over. {winner.corporation} ({winner.username}) wins!
            </h2>
            <AllScoresContainer>
                {playerScoreInfos.map(scoreInfo => (
                    <PlayerScoreContainer>
                        <PlayerScoreHeader>
                            {scoreInfo.corporation} ({scoreInfo.username})
                        </PlayerScoreHeader>
                        <PlayerScoreRow>
                            <span>TR</span>
                            <span>{scoreInfo.terraformRating}</span>
                        </PlayerScoreRow>
                        <PlayerScoreRow>
                            <span>Cards</span>
                            <span>{scoreInfo.cardScore}</span>
                        </PlayerScoreRow>
                        <PlayerScoreRow>
                            <span>Cities</span>
                            <span>{scoreInfo.citiesScore}</span>
                        </PlayerScoreRow>
                        <PlayerScoreRow>
                            <span>Greeneries</span>
                            <span>{scoreInfo.greeneryScore}</span>
                        </PlayerScoreRow>
                        <PlayerScoreRow>
                            <span>Milestones</span>
                            <span>{scoreInfo.milestoneScore}</span>
                        </PlayerScoreRow>
                        <PlayerScoreRow>
                            <span>Awards</span>
                            <span>{scoreInfo.awardScore}</span>
                        </PlayerScoreRow>
                        <PlayerScoreTotalRow>
                            <span>Total</span>
                            <span>{scoreInfo.totalScore}</span>
                        </PlayerScoreTotalRow>
                    </PlayerScoreContainer>
                ))}
            </AllScoresContainer>
            <button onClick={() => router.push('/')}>Home</button>
        </EndOfGameBase>
    );
}
