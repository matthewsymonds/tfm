import {gamesModel, retrieveSession} from '../../../database';

export default async (req, res) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult) return;
    let game;

    const {
        query: {id},
    } = req;

    try {
        game = await gamesModel.findById(id);
    } catch (error) {
        res.status(404);
        res.json({error: 'Not found'});
    }

    switch (req.method) {
        case 'GET':
            res.json({game});
            return;
        case 'PUT':
            game.state = req.body.state || game.state;
            game.users = req.body.users || game.users;
            await game.save();
            res.json(game);
            return;
        default:
            res.status(400);
            res.json({error: 'Misformatted request.'});
    }
};
