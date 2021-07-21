import {ApiActionType} from 'client-server-shared/api-action-type';
import {deserializeResourceOptionAction} from 'components/ask-user-to-confirm-resource-action-details';
import {Card} from 'models/card';
import {GameState} from 'reducer';
import {ApiActionHandler} from 'server/api-action-handler';
import {StateHydrator} from 'server/state-hydrator';
import spawnExhaustiveSwitchError from 'utils';

export async function playGame(
    type: ApiActionType,
    // TODO enhance
    payload: any,
    actionHandler: ApiActionHandler,
    stateHydrator: StateHydrator,
    originalState: GameState
) {
    let card: Card;
    switch (type) {
        case ApiActionType.API_PLAY_CARD:
            card = stateHydrator.getCard(payload.name);
            actionHandler.playCard({
                serializedCard: card,
                payment: payload.payment,
                conditionalPayments: payload.conditionalPayments,
            });

            break;
        case ApiActionType.API_PLAY_CARD_ACTION:
            card = stateHydrator.getCard(payload.name);
            actionHandler.playCardAction({
                parent: card,
                payment: payload.payment,
                choiceIndex: payload.choiceIndex,
            });
            break;
        case ApiActionType.API_PLAY_STANDARD_PROJECT:
            const standardProjectAction = stateHydrator.getStandardProject(
                payload.standardProjectActionType
            );
            actionHandler.playStandardProject({
                standardProjectAction,
                payment: payload.payment,
            });
            break;
        case ApiActionType.API_CLAIM_MILESTONE:
            actionHandler.claimMilestone(payload);
            break;
        case ApiActionType.API_FUND_AWARD:
            actionHandler.fundAward(payload);
            break;
        case ApiActionType.API_DO_CONVERSION:
            actionHandler.doConversion(payload);
            break;
        case ApiActionType.API_SKIP_ACTION:
            actionHandler.skipAction();
            break;
        case ApiActionType.API_COMPLETE_PLACE_TILE:
            actionHandler.completePlaceTile(payload);
            break;
        case ApiActionType.API_COMPLETE_CHOOSE_RESOURCE_ACTION_DETAILS:
            const option = deserializeResourceOptionAction(payload.option, actionHandler.state);
            actionHandler.completeChooseResourceActionDetails({
                option,
                variableAmount: payload.variableAmount,
            });
            break;
        case ApiActionType.API_SKIP_CHOOSE_RESOURCE_ACTION_DETAILS:
            actionHandler.skipChooseResourceActionDetails();
            break;
        case ApiActionType.API_CONFIRM_CARD_SELECTION:
            const {cards, payment, corporation, preludes} = payload;
            if (cards.length > 10) {
                throw new Error('trying to select too many cards');
            }
            actionHandler.confirmCardSelection({
                selectedCards: cards,
                selectedPreludes: preludes,
                corporation,
                payment,
            });
            break;
        case ApiActionType.API_CONTINUE_AFTER_REVEALING_CARDS:
            actionHandler.continueAfterRevealingCards();
            break;
        case ApiActionType.API_COMPLETE_CHOOSE_DUPLICATE_PRODUCTION:
            actionHandler.completeChooseDuplicateProduction(payload);
            break;
        case ApiActionType.API_SKIP_CHOOSE_DUPLICATE_PRODUCTION:
            actionHandler.skipChooseDuplicateProduction();
            break;
        case ApiActionType.API_INCREASE_LOWEST_PRODUCTION:
            actionHandler.increaseLowestProduction(payload);
            break;
        case ApiActionType.API_TRADE:
            actionHandler.trade(payload);
            break;
        case ApiActionType.API_COMPLETE_BUILD_COLONY:
            actionHandler.completePlaceColony(payload);
            break;
        case ApiActionType.API_COMPLETE_INCREASE_AND_DECREASE_COLONY_TILE_TRACKS:
            actionHandler.completeIncreaseAndDecreaseColonyTileTracks(payload);
            break;
        default:
            throw spawnExhaustiveSwitchError(type);
    }
    actionHandler.handleForcedActionsIfNeeded(originalState);
}
