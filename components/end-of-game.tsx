import {useRouter} from 'next/router';
import {useStore} from 'react-redux';
import {PlayerState} from 'reducer';
import {getCardVictoryPoints} from 'selectors/card';
import {getPlayedCards} from 'selectors/get-played-cards';
import {getAwardScore, getCityScore, getGreeneryScore, getMilestoneScore} from 'selectors/score';
import styled from 'styled-components';
import {PlayerCorpAndIcon} from './icons/player';
import {colors} from './ui';

const EndOfGameBase = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const AllScoresContainer = styled.div<{numPlayers: number}>`
    display: grid;
    grid-template-columns: ${props => `repeat(${props.numPlayers}, 1fr)`};
`;

const PlayerScoreContainer = styled.div`
    margin-left: 16px;
    &:first-child {
        margin-left: 0px;
    }
    padding: 16px;
    border: 1px solid black;
    background-color: lightgray;
    border-radius: 2px;
    flex-grow: 1;
    flex-basis: 0;
    min-width: fit-content;
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

type PlayerScoreInfos = {
    terraformRating: number;
    cardScore: number;
    greeneryScore: number;
    citiesScore: number;
    milestoneScore: number;
    awardScore: number;
    totalScore: number;
    player: PlayerState;
};

export function EndOfGame() {
    const store = useStore();
    const state = store.getState();
    const router = useRouter();

    const playerScoreInfos: Array<PlayerScoreInfos> = state.players.map(player => {
        const {index: playerIndex} = player;
        const terraformRating = player.terraformRating;
        const cardScore = getPlayedCards(player).reduce((total, card) => {
            return total + getCardVictoryPoints(card.victoryPoints, state, player, card);
        }, 0);
        const greeneryScore = getGreeneryScore(state, playerIndex);
        const citiesScore = getCityScore(state, playerIndex);
        const milestoneScore = getMilestoneScore(state, playerIndex);
        const awardScore = getAwardScore(state, playerIndex);

        const totalScore =
            terraformRating + cardScore + greeneryScore + citiesScore + milestoneScore + awardScore;

        return {
            player,
            terraformRating,
            cardScore,
            greeneryScore,
            citiesScore,
            milestoneScore,
            awardScore,
            totalScore,
        };
    });

    const winner = playerScoreInfos.sort((a, b) => b.totalScore - a.totalScore)[0];

    return (
        <EndOfGameBase>
            <h2 style={{color: colors.TEXT_LIGHT_1}}>
                Game over. {winner.player.corporation.name} ({winner.player.username}) wins!
            </h2>
            <AllScoresContainer numPlayers={playerScoreInfos.length}>
                {playerScoreInfos.map(scoreInfo => (
                    <PlayerScoreContainer key={scoreInfo.player.username}>
                        <PlayerScoreHeader>
                            <PlayerCorpAndIcon
                                player={scoreInfo.player}
                                includeUsername
                            ></PlayerCorpAndIcon>
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
        </EndOfGameBase>
    );
}
