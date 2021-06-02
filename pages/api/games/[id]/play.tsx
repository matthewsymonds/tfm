import {ApiActionType} from 'client-server-shared/api-action-type';
import {deserializeResourceOptionAction} from 'components/ask-user-to-confirm-resource-action-details';
import {gamesModel, retrieveSession} from 'database';
import {Card} from 'models/card';
import {ApiActionHandler} from 'server/api-action-handler';
import {StateHydrator} from 'server/state-hydrator';
import {censorGameState} from 'state-serialization';
import spawnExhaustiveSwitchError from 'utils';

export default async (req, res) => {
    const sessionResult = await retrieveSession(req, res);
    if (!sessionResult) return;
    // only accept POST!
    const method = req.method.toUpperCase();

    if (method !== 'POST') {
        res.status(400);
        res.json({error: 'Misformatted request!!'});
        return;
    }

    const {
        query: {id},
    } = req;

    let game;
    const {username} = sessionResult;

    try {
        game = await gamesModel.findOne({name: id}).cache();
        if (!game) throw new Error('Not found');
        if (!game.players.includes(username)) throw new Error('Not in this game!');
        const {type, payload}: {type: ApiActionType; payload} = req.body;
        const hydratedGame = {
            queue: game.queue,
            state: game.state,
            players: game.players,
            name: game.name,
        };
        const originalState = hydratedGame.state;
        const actionHandler = new ApiActionHandler(hydratedGame, username);
        const stateHydrator = new StateHydrator(hydratedGame, username);
        let card: Card;
        switch (type) {
            case ApiActionType.API_PLAY_CARD:
                card = stateHydrator.getCard(payload.name);
                await actionHandler.playCardAsync({serializedCard: card, payment: payload.payment});

                break;
            case ApiActionType.API_PLAY_CARD_ACTION:
                card = stateHydrator.getCard(payload.name);
                await actionHandler.playCardActionAsync({
                    parent: card,
                    payment: payload.payment,
                    choiceIndex: payload.choiceIndex,
                });
                break;
            case ApiActionType.API_PLAY_STANDARD_PROJECT:
                const standardProjectAction = stateHydrator.getStandardProject(
                    payload.standardProjectActionType
                );
                await actionHandler.playStandardProjectAsync({
                    standardProjectAction,
                    payment: payload.payment,
                });
                break;
            case ApiActionType.API_CLAIM_MILESTONE:
                await actionHandler.claimMilestoneAsync(payload);
                break;
            case ApiActionType.API_FUND_AWARD:
                await actionHandler.fundAwardAsync(payload);
                break;
            case ApiActionType.API_DO_CONVERSION:
                await actionHandler.doConversionAsync(payload);
                break;
            case ApiActionType.API_SKIP_ACTION:
                await actionHandler.skipActionAsync();
                break;
            case ApiActionType.API_COMPLETE_PLACE_TILE:
                await actionHandler.completePlaceTileAsync(payload);
                break;
            case ApiActionType.API_COMPLETE_CHOOSE_RESOURCE_ACTION_DETAILS:
                const option = deserializeResourceOptionAction(payload.option, actionHandler.state);
                await actionHandler.completeChooseResourceActionDetailsAsync({
                    option,
                    variableAmount: payload.variableAmount,
                });
                break;
            case ApiActionType.API_SKIP_CHOOSE_RESOURCE_ACTION_DETAILS:
                await actionHandler.skipChooseResourceActionDetailsAsync();
                break;
            case ApiActionType.API_CONFIRM_CARD_SELECTION:
                const {cards, payment, corporation, preludes} = payload;
                if (cards.length > 10) {
                    throw new Error('trying to select too many cards');
                }
                await actionHandler.confirmCardSelectionAsync({
                    selectedCards: cards,
                    selectedPreludes: preludes,
                    corporation,
                    payment,
                });
                break;
            case ApiActionType.API_CONTINUE_AFTER_REVEALING_CARDS:
                await actionHandler.continueAfterRevealingCardsAsync();
                break;
            case ApiActionType.API_COMPLETE_CHOOSE_DUPLICATE_PRODUCTION:
                await actionHandler.completeChooseDuplicateProductionAsync(payload);
                break;
            case ApiActionType.API_SKIP_CHOOSE_DUPLICATE_PRODUCTION:
                await actionHandler.skipChooseDuplicateProductionAsync();
                break;
            case ApiActionType.API_INCREASE_LOWEST_PRODUCTION_ASYNC:
                await actionHandler.increaseLowestProductionAsync(payload);
                break;
            default:
                throw spawnExhaustiveSwitchError(type);
        }
        await actionHandler.handleForcedActionsIfNeededAsync(originalState);
        game.queue = hydratedGame.queue;
        game.state = hydratedGame.state;
        game.updatedAt = Date.now();
        await game.save();

        res.json({
            state: censorGameState(hydratedGame.state, username),
        });
    } catch (error) {
        res.status(404);
        res.json({error: error.message});
    }
};
