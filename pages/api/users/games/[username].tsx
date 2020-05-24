import {gamesModel, retrieveSession} from 'database';

/* The User Games route. */

export default async (req, res) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult) {
        return;
    }

    const {
        query: {username},
    } = req;

    if (sessionResult.username !== username) {
        res.status(404);
        res.end();
        return;
    }

    let games;

    switch (req.method) {
        case 'GET':
            // Retrieve list of games the user is in.
            try {
                games = await gamesModel.find({players: username}, 'name players createdAt');
            } catch (error) {
                games = [];
            }

            res.json({
                games,
            });
            return;
        default:
            res.status(400);
            res.json({
                error: 'Unable to interpret request.',
            });
    }
};
