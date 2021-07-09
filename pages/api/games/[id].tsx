import {gamesModel, retrieveSession} from 'database';
import {censorGameState} from 'state-serialization';

export default async (req, res) => {
    let game;

    const {
        query: {id},
    } = req;

    try {
        game = await gamesModel.findOne({name: id});
        if (!game) throw new Error('Not found');
    } catch (error) {
        res.status(404);
        res.json({error: error.message});
        return;
    }

    let username: string;

    if (game.state.players.length === 1) {
        username = game.state.players[0].username;
    } else {
        const sessionResult = await retrieveSession(req, res);
        if (!sessionResult) return;
        username = sessionResult.username;
    }

    switch (req.method.toUpperCase()) {
        case 'GET':
            res.setHeader('cache-control', 'no-cache');
            res.json({
                state: censorGameState(game.state, username),
            });
            return;
        default:
            res.status(400);
            res.json({error: 'Misformatted request!!'});
    }
};
