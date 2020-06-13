import {ScorePopover} from 'components/popovers/score-popover';
import {PlayerState} from 'reducer';
import {Flex} from './box';
import {Pane} from 'evergreen-ui';
import {CardActionElements, CardComponent} from './card';
import {PlayerResourceBoard} from './resource';
import styled from 'styled-components';

type PlayerOverviewProps = {
    player: PlayerState;
    isLoggedInPlayer: boolean;
};

const TextButton = styled.button`
    display: inline-flex;
    border: 0;
    padding: 0;
    margin: 0;
    line-height: initial;
    background: none;
    font-size: inherit;
    font-weight: 600;
    min-width: unset;
    color: blue;
    &:hover {
        opacity: 0.75;
        color: blue;
        border: none;
        background: none;
    }
    &:active {
        opacity: 1;
    }
`;

export const PlayerOverview = ({player, isLoggedInPlayer}: PlayerOverviewProps) => {
    const corporation = player.corporation!;
    const terraformRating = player.terraformRating;

    return (
        <>
            <h2>
                <span>
                    {player.corporation?.name} (
                    <ScorePopover playerIndex={player.index}>
                        <Pane display="inline-flex">
                            <TextButton>{terraformRating} TR</TextButton>
                        </Pane>
                    </ScorePopover>
                    )
                </span>
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
