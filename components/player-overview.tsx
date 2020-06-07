import {PlayerState} from 'reducer';
import {PlayerResourceBoard} from './resource';
import {CardComponent, CardActionElements} from './card';
import {Box, Flex} from './box';

type PlayerOverviewProps = {
    player: PlayerState;
    isLoggedInPlayer: boolean;
};

export const PlayerOverview = ({player, isLoggedInPlayer}: PlayerOverviewProps) => {
    const corporation = player.corporation!;
    return (
        <>
            <h2>
                {corporation?.name} ({player.terraformRating})
            </h2>
            <Flex justifyContent="center">
                <CardComponent content={corporation}>
                    <CardActionElements
                        player={player}
                        isLoggedInPlayer={isLoggedInPlayer}
                        card={corporation}
                    />
                </CardComponent>
            </Flex>
            <PlayerResourceBoard player={player} isLoggedInPlayer={isLoggedInPlayer} />
        </>
    );
};
