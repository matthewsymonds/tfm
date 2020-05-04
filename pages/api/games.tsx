import {gamesModel} from '../../database';

export default async (req, res) => {
    let game;
    try {
        game = await gamesModel.findOne();
    } catch (error) {
        game = null;
    }
    if (!game) {
        game = new gamesModel();
    }

    if (req.method === 'POST') {
        game.state = req.body;
        await game.save();
    }

    res.json(game);
};
