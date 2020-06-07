import {PlayerState} from 'reducer';
import {PlayerResourceBoard} from './resource';
import {CardComponent, CardActionElements} from './card';
import {Box, Flex} from './box';
import {useStore} from 'react-redux';
import {useState} from 'react';
import {ScorePopover} from 'components/popovers/score-popover';

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
