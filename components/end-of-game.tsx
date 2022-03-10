import {useStore} from 'react-redux';
import {PlayerState, useTypedSelector} from 'reducer';
import {getCardVictoryPoints} from 'selectors/card';
import {getPlayedCards} from 'selectors/get-played-cards';
import {isPlayingTurmoil} from 'selectors/is-playing-expansion';
import {
    getAwardScore,
    getCityScore,
    getGreeneryScore,
    getMilestoneScore,
    getTurmoilEndOfGameScore,
} from 'selectors/score';
import styled from 'styled-components';
import {PlayerCorpAndIcon} from './icons/player';
import {colors} from './ui';

const AllScoresContainer = styled.div<{numPlayers: number}>`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    overflow: auto;
    max-width: 100%;
`;

const PlayerScoreContainer = styled.div`
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
    turmoilScore: number;
    totalScore: number;
    player: PlayerState;
};

export function EndOfGame() {
    const store = useStore();
    const state = store.getState();

    const playerScoreInfos: Array<PlayerScoreInfos> = state.players.map(
        player => {
            const {index: playerIndex} = player;
            const terraformRating = player.terraformRating;
            const cardScore = getPlayedCards(player).reduce((total, card) => {
                return (
                    total +
                    getCardVictoryPoints(
                        card.victoryPoints,
                        state,
                        player,
                        card
                    )
                );
            }, 0);
            const greeneryScore = getGreeneryScore(state, playerIndex);
            const citiesScore = getCityScore(state, playerIndex);
            const milestoneScore = getMilestoneScore(state, playerIndex);
            const awardScore = getAwardScore(state, playerIndex);

            const turmoilScore = getTurmoilEndOfGameScore(state, playerIndex);

            const totalScore =
                terraformRating +
                cardScore +
                greeneryScore +
                citiesScore +
                milestoneScore +
                awardScore +
                turmoilScore;

            return {
                player,
                terraformRating,
                cardScore,
                greeneryScore,
                citiesScore,
                milestoneScore,
                awardScore,
                totalScore,
                turmoilScore,
            };
        }
    );

    const winner = playerScoreInfos.sort(
        (a, b) => b.totalScore - a.totalScore
    )[0];
    const isTurmoilEnabled = useTypedSelector(isPlayingTurmoil);
    return (
        <>
            <h2 className="display" style={{color: colors.TEXT_LIGHT_1}}>
                Game over. {winner.player.corporation.name} (
                {winner.player.username}) wins!
            </h2>
            <table style={{background: colors.LIGHTEST_BG}}>
                <tbody>
                    <tr>
                        <th>Player</th>
                        {playerScoreInfos.map(scoreInfo => (
                            <td key={scoreInfo.player.username}>
                                <PlayerCorpAndIcon
                                    player={scoreInfo.player}
                                    includeUsername
                                ></PlayerCorpAndIcon>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th>TR</th>

                        {playerScoreInfos.map(scoreInfo => (
                            <td key={scoreInfo.player.username}>
                                <span>{scoreInfo.terraformRating}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th>Cards</th>

                        {playerScoreInfos.map(scoreInfo => (
                            <td key={scoreInfo.player.username}>
                                <span>{scoreInfo.cardScore}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th>Cities</th>

                        {playerScoreInfos.map(scoreInfo => (
                            <td key={scoreInfo.player.username}>
                                <span>{scoreInfo.citiesScore}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th>Greeneries</th>

                        {playerScoreInfos.map(scoreInfo => (
                            <td key={scoreInfo.player.username}>
                                <span>{scoreInfo.greeneryScore}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th>Milestones</th>

                        {playerScoreInfos.map(scoreInfo => (
                            <td key={scoreInfo.player.username}>
                                <span>{scoreInfo.milestoneScore}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th>Awards</th>

                        {playerScoreInfos.map(scoreInfo => (
                            <td key={scoreInfo.player.username}>
                                <span>{scoreInfo.awardScore}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th>
                            <b>Total</b>
                        </th>

                        {playerScoreInfos.map(scoreInfo => (
                            <td key={scoreInfo.player.username}>
                                <b>{scoreInfo.totalScore}</b>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </>
    );
}
