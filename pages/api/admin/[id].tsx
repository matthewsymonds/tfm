import {gamesModel, retrieveSession} from 'database';
import {NextApiRequest, NextApiResponse} from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
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

    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult) return;
    const username = sessionResult.username;

    const adminNames = (process.env.ADMIN_NAMES ?? '').split(',');

    if (!adminNames.includes(username)) {
        res.status(403);
        res.json({error: 'Forbidden', adminNames});
        return;
    }

    switch (req.method?.toUpperCase()) {
        case 'GET':
            res.setHeader('cache-control', 'no-cache');
            res.json({
                state: game.state,
            });
            return;
        case 'POST':
            const {state} = req.body;
            if (state) {
                try {
                    game.state = JSON.parse(state);
                    game.markModified('state');
                    game.save({validateBeforeSave: false});
                } catch (error) {
                    console.log(error);
                    res.json({error: 'problem'});
                }
            }
            res.status(200);
            res.json({result: 'OK'});
            return;
        default:
            res.status(400);
            res.json({error: 'Misformatted request!!'});
    }
};
