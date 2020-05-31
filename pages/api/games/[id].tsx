import {gamesModel, retrieveSession} from 'database';

export default async (req, res) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult) return;
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

    switch (req.method.toUpperCase()) {
        case 'GET':
            res.json({
                state: game.state,
                queue: game.queue,
                players: game.players,
            });
            return;
        case 'POST':
            game.state = req.body.state || game.state;
            game.users = req.body.users || game.users;
            game.queue = req.body.queue;
            await game.save();
            res.json({
                state: game.state,
                players: game.players,
                queue: game.queue,
            });
            return;
        default:
            res.status(400);
            res.json({error: 'Misformatted request!!'});
    }
};
