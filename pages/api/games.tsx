import {gamesModel, retrieveSession} from '../../database';

export default async (req, res) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult) {
        return;
    }

    let games;

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
            const game = new gamesModel();
            game.state = {};
            game.users = [sessionResult.username];
            await game.save();
            res.json({game});
            return;
        default:
            res.status(404);
            res.json({error: 'Call misformatted '});
            return;
    }
};
