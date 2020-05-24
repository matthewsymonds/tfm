import {PlayerState} from '../reducer';
import {PlayerResourceBoard} from './resource';

type PlayerOverviewProps = {
    player: PlayerState;
    isLoggedInPlayer: boolean;
};

export const PlayerOverview = ({player, isLoggedInPlayer}: PlayerOverviewProps) => (
    <>
        <h2>{player.corporation?.name}</h2>
        <PlayerResourceBoard player={player} isLoggedInPlayer={isLoggedInPlayer} />
    </>
);
