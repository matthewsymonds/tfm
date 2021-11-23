import {ApiActionType} from 'client-server-shared/api-action-type';
import {deserializeResourceOptionAction} from 'components/ask-user-to-confirm-resource-action-details';
import {Deck} from 'constants/card-types';
import {GameStage} from 'constants/game';
import {Card} from 'models/card';
import {GameState} from 'reducer';
import {ApiActionHandler} from 'server/api-action-handler';
import {StateHydrator} from 'server/state-hydrator';
import spawnExhaustiveSwitchError from 'utils';

export function playGame(
    type: ApiActionType,
    // TODO enhance
    payload: any,
    actionHandler: ApiActionHandler,
    stateHydrator: StateHydrator,
    originalState: GameState,
    stateCheckpoint?: string
) {
    let card: Card;
    switch (type) {
        case ApiActionType.API_PLAY_CARD:
            card = stateHydrator.getCard(payload.name);

            actionHandler.playCard({
                serializedCard: card,
                payment: payload.payment,
                conditionalPayments: payload.conditionalPayments,
                supplementalResources: payload.supplementalResources,
            });

            break;
        case ApiActionType.API_PLAY_CARD_ACTION:
            card = stateHydrator.getCard(payload.name);
            actionHandler.playCardAction({
                parent: card,
                payment: payload.payment,
                supplementalResources: payload.supplementalResources,
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
        case ApiActionType.API_PASS_GENERATION:
            actionHandler.passGeneration();
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
            if (
                actionHandler.state.options.decks.includes(Deck.PRELUDE) &&
                actionHandler.state.common.gameStage === GameStage.CORPORATION_SELECTION &&
                preludes.length !== 2
            ) {
                throw new Error('Not selecting enough preludes');
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
        case ApiActionType.API_TRADE_FOR_FREE:
            actionHandler.tradeForFree(payload);
            break;
        case ApiActionType.API_COMPLETE_BUILD_COLONY:
            actionHandler.completePlaceColony(payload);
            break;
        case ApiActionType.API_COMPLETE_INCREASE_AND_DECREASE_COLONY_TILE_TRACKS:
            actionHandler.completeIncreaseAndDecreaseColonyTileTracks(payload);
            break;
        case ApiActionType.API_COMPLETE_PUT_ADDITIONAL_COLONY_TILE_INTO_PLAY:
            actionHandler.completePutAdditionalColonyTileIntoPlay(payload);
            break;
        case ApiActionType.API_LOBBY:
            actionHandler.lobby(payload);
            break;
        case ApiActionType.API_COMPLETE_CHOOSE_NEXT_ACTION:
            actionHandler.completeChooseNextAction(payload);
            break;
        case ApiActionType.API_START_OVER:
            if (!stateCheckpoint) {
                return;
            }
            actionHandler.startOver(JSON.parse(stateCheckpoint) as GameState);
            break;
        default:
            throw spawnExhaustiveSwitchError(type);
    }
    actionHandler.handleForcedActionsIfNeeded(originalState);
}
