import {GameStage} from 'constants/game';
import {gamesModel, retrieveSession, usersModel} from 'database';
import {getInitialState} from 'initial-state';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult || !sessionResult.username) {
        return;
    }

    let games;
    let game;

    switch (req.method?.toUpperCase()) {
        case 'GET':
            // Retrieve list of public games.
            try {
                games = await gamesModel.find(
                    {
                        players: sessionResult.username,
                        'state.common.gameStage': {$ne: GameStage.END_OF_GAME},
                    },
                    'name players createdAt'
                );
            } catch (error) {
                games = [];
            }
            return res.json({games});
        case 'POST': {
            const {name, options} = req.body;
            let players = req.body.players.slice(0, 5);
            players = [...new Set(players)];
            game = await gamesModel.findOne({name});
            if (game) {
                res.json({error: 'Game with that name already exists'});
                return;
            }
            const validPlayers = await usersModel.find({
                username: {$in: players},
            });
            if (validPlayers.length !== players.length) {
                res.json({error: 'Not all players found'});
                return;
            }
            game = new gamesModel();
            game.name = name;
            game.state = getInitialState(players, options, name);
            game.players = players;
            // TODO make configurable
            game.public = false;
            try {
                await game.save();
            } catch (error) {
                res.json({
                    error: 'Could not create game, please check fields and try again.',
                });
                return;
            }
            res.json({game});
            return;
        }
        default:
            res.status(404);
            res.json({error: 'Call misformatted '});
            return;
    }
};
