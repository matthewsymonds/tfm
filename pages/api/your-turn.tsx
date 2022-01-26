import {GameStage} from 'constants/game';
import {gamesModel, retrieveSession} from 'database';
import {NextApiRequest, NextApiResponse} from 'next';
import {SerializedState} from 'state-serialization';

export type NamedGame = {name: string};

export async function getYourTurnGameNames(username: string): Promise<NamedGame[]> {
    let gameNames: NamedGame[];
    try {
        let games = await gamesModel.find(
            {
                $and: [
                    // Games with more than one player (player index 1 exists)
                    {'players.1': {$exists: true}},
                    {'state.common.gameStage': {$not: {$eq: GameStage.END_OF_GAME}}},
                    {
                        $or: [
                            {
                                // Where the current player has this username.
                                currentPlayer: username,
                            },
                            {
                                // or we're in draft/buy or discard
                                'state.players': {
                                    $elemMatch: {
                                        username: username,
                                        pendingCardSelection: {
                                            $ne: null,
                                        },
                                    },
                                },
                                'state.common.gameStage': {
                                    $in: [
                                        GameStage.BUY_OR_DISCARD,
                                        GameStage.DRAFTING,
                                        GameStage.CORPORATION_SELECTION,
                                    ],
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
            const state = game.state as SerializedState;
            if (
                state.common.gameStage === GameStage.ACTIVE_ROUND ||
                state.common.gameStage === GameStage.GREENERY_PLACEMENT
            ) {
                return true;
            }
            const currentPlayer = state.players.find(player => player.username === username);
            const pendingCardSelection = currentPlayer?.pendingCardSelection;
            if (!pendingCardSelection) return false;
            if (state.common.gameStage === GameStage.BUY_OR_DISCARD) {
                return pendingCardSelection.possibleCards.length === 4;
            }
            if (state.common.gameStage === GameStage.DRAFTING) {
                return (
                    pendingCardSelection.possibleCards.length +
                        (pendingCardSelection.draftPicks?.length ?? 0) ===
                    4
                );
            }
            return false;
        });
        gameNames = games.map(game => ({name: game.name}));
    } catch (error) {
        gameNames = [];
    }

    return gameNames;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult || !sessionResult.username) {
        return;
    }

    switch (req.method?.toUpperCase()) {
        case 'GET':
            // Retrieve list of public games.
            const gameNames = await getYourTurnGameNames(sessionResult.username);
            // Ensure the results are fresh!
            res.setHeader('cache-control', 'no-cache');
            return res.json({games: gameNames});
        default:
            res.status(404);
            res.json({error: 'Call misformatted '});
            return;
    }
};
