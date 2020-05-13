import {gamesModel, retrieveSession} from '../../database';
import {getInitialState} from '../../initial-state';

export default async (req, res) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult) {
        return;
    }

    let games;
    let game;

    const {name, players} = req.body;

    switch (req.method) {
        case 'GET':
            // Retrieve list of public games.
            try {
                games = await gamesModel.find({public: true}, 'name players createdAt');
            } catch (error) {
                games = [];
            }
            return res.json({games});
        case 'POST':
            game = await gamesModel.findOne({name});
            if (game) {
                res.json({error: 'Game with that name already exists'});
                return;
            }
            game = new gamesModel();
            game.name = name;
            game.state = getInitialState(players);
            game.players = players;
            // TODO make configurable
            game.public = false;
            try {
                await game.save();
            } catch (error) {
                res.json({error: 'Could not create game, please check fields and try again.'});
                return;
            }
            res.json({game});
            return;
        default:
            res.status(404);
            res.json({error: 'Call misformatted '});
            return;
    }
};
