import {gamesModel, retrieveSession} from 'database';
import {RootState} from 'reducer';
import {produce} from 'immer';
import {GameStage} from 'constants/game';

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
            game.state = mergeExistingGameStateWithNew(req.body.state, game.state, sessionResult);
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
/* Assists with situation like card selection where multiple players are syncing state. */
function mergeExistingGameStateWithNew(
    newState: RootState | undefined,
    oldState: RootState,
    session: {username: string}
) {
    if (!newState) return oldState;

    return produce(newState, draft => {
        for (const player of draft.players) {
            if (player.username === session.username) {
                // Player can modify their own state.
                continue;
            }

            const oldStatePlayer = oldState.players.find(
                oldPlayer => oldPlayer.index === player.index
            );

            // For safety, if for some reason the player doesn't exist, continue.
            if (!oldStatePlayer) continue;

            // Don't modify an opponent's cards in hand.
            player.cards = oldStatePlayer.cards;
            // Don't modify an opponent's corporation.
            player.corporation = oldStatePlayer.corporation;
            // Don't modify an opponent's card selections.
            player.selectedCards = oldStatePlayer.selectedCards;

            // If a player is "Ready" don't override their readiness to play.
            player.action = oldStatePlayer.action;
            player.turn = oldStatePlayer.turn;

            if (oldState.common.gameStage !== GameStage.ACTIVE_ROUND) {
                player.resources = oldStatePlayer.resources;
                player.productions = oldStatePlayer.productions;
                player.playedCards = oldStatePlayer.playedCards;
            }
        }
    });
}
