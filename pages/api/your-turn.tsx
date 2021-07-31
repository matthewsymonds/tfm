import {GameStage} from 'constants/game';
import {gamesModel, retrieveSession} from 'database';

export default async (req, res) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult || !sessionResult.username) {
        return;
    }

    let games;

    switch (req.method) {
        case 'GET':
            // Retrieve list of public games.
            try {
                games = await gamesModel.find(
                    {
                        $and: [
                            // Games with more than one player (player index 1 exists)
                            {'players.1': {$exists: true}},
                            {'state.common.gameStage': {$not: {$eq: GameStage.END_OF_GAME}}},
                            {
                                $or: [
                                    {
                                        // Where the current player has this username.
                                        currentPlayer: sessionResult.username,
                                    },
                                    {
                                        // or we'rd in draft/buy or discard
                                        'state.players': {
                                            $elemMatch: {
                                                username: sessionResult.username,
                                                pendingCardSelection: {
                                                    $ne: null,
                                                },
                                            },
                                        },
                                        'state.common.gameStage': {
                                            $in: [GameStage.BUY_OR_DISCARD, GameStage.DRAFTING],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {name: 1, state: 1}
                );
                // Unfortunately we have to do all this crap to detect when someone is waiting to draft...
                games = games.filter(game => {
                    if (game.state.common.gameStage === GameStage.ACTIVE_ROUND) {
                        return true;
                    }
                    const currentPlayer = game.state.players.find(
                        player => player.username === sessionResult.username
                    );
                    const {pendingCardSelection} = currentPlayer;
                    if (!pendingCardSelection) return false;
                    if (game.state.common.gameStage === GameStage.BUY_OR_DISCARD) {
                        return pendingCardSelection.possibleCards.length === 4;
                    }
                    if (game.state.common.gameStage === GameStage.DRAFTING) {
                        return (
                            pendingCardSelection.possibleCards.length +
                                pendingCardSelection.draftPicks.length ===
                            4
                        );
                    }
                    return false;
                });
            } catch (error) {
                games = [];
            }
            // Ensure the results are fresh!
            res.setHeader('cache-control', 'no-cache');
            return res.json({games: games.map(game => ({name: game.name}))});
        default:
            res.status(404);
            res.json({error: 'Call misformatted '});
            return;
    }
};
