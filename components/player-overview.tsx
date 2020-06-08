import {ScorePopover} from 'components/popovers/score-popover';
import {useState} from 'react';
import {PlayerState} from 'reducer';
import {Flex} from './box';
import {CardActionElements, CardComponent} from './card';
import {PlayerResourceBoard} from './resource';

type PlayerOverviewProps = {
    player: PlayerState;
    isLoggedInPlayer: boolean;
};

export const PlayerOverview = ({player, isLoggedInPlayer}: PlayerOverviewProps) => {
    const corporation = player.corporation!;
    const terraformRating = player.terraformRating;

    const [isScorePopoverOpen, setIsScorePopoverOpen] = useState(false);
    return (
        <>
            <h2 id={player.username} onClick={() => setIsScorePopoverOpen(!isScorePopoverOpen)}>
                <span>
                    {player.corporation?.name} ({terraformRating})
                </span>
                <ScorePopover
                    isOpen={isScorePopoverOpen}
                    target={player.username}
                    playerIndex={player.index}
                    toggle={() => setIsScorePopoverOpen(!isScorePopoverOpen)}
                />
            </h2>
            <PlayerResourceBoard player={player} isLoggedInPlayer={isLoggedInPlayer} />
            <Flex justifyContent="center">
                <CardComponent content={corporation}>
                    <CardActionElements
                        player={player}
                        isLoggedInPlayer={isLoggedInPlayer}
                        card={corporation}
                    />
                </CardComponent>
            </Flex>
        </>
    );
};
