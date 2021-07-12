import {gamesModel, retrieveSession} from 'database';

export default async (req, res) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult || !sessionResult.username) {
        return;
    }

    let games;
    let game;

    switch (req.method) {
        case 'GET':
            // Retrieve list of public games.
            try {
                games = await gamesModel.find(
                    {
                        // Games with more than one player (player index 1 exists)
                        'players.1': {$exists: true},
                        // Where the current player has this username.
                        currentPlayer: sessionResult.username,
                    },
                    'name'
                );
            } catch (error) {
                games = [];
            }
            return res.json({games});
        default:
            res.status(404);
            res.json({error: 'Call misformatted '});
            return;
    }
};
