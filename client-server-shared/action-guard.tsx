import {getOptionsForDuplicateProduction} from 'components/ask-user-to-confirm-duplicate-production';
import {
    canSkipResourceActionDetails,
    getPlayerOptionWrappers,
    ResourceActionOption,
} from 'components/ask-user-to-confirm-resource-action-details';
import {Action} from 'constants/action';
import {Award, Cell, Milestone} from 'constants/board';
import {CardType} from 'constants/card-types';
import {Conversion} from 'constants/conversion';
import {GameStage, PARAMETER_STEPS} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {StandardProjectAction, StandardProjectType} from 'constants/standard-project';
import {Tag} from 'constants/tag';
import {VariableAmount} from 'constants/variable-amount';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {getValidPlacementsForRequirement} from 'selectors/board';
import {doesAnyoneHaveResourcesToSteal} from 'selectors/does-anyone-have-resources-to-steal';
import {doesPlayerHaveRequiredResourcesToRemove} from 'selectors/does-player-have-required-resource-to-remove';
import {getIsPlayerMakingDecision} from 'selectors/get-is-player-making-decision';
import {getMoney} from 'selectors/get-money';
import {isActiveRound} from 'selectors/is-active-round';
import {meetsProductionRequirements} from 'selectors/meets-production-requirements';
import {meetsTerraformRequirements} from 'selectors/meets-terraform-requirements';
import {meetsTilePlacementRequirements} from 'selectors/meets-tile-placement-requirements';
import {milestoneQuantitySelectors, minMilestoneQuantity} from 'selectors/milestone-selectors';
import {getTags} from 'selectors/variable-amount';

type CanPlayAndReason = [boolean, string];

export class ActionGuard {
    constructor(private readonly state: GameState, private readonly username: string) {
        this.state = state;
        this.username = username;
    }

    _getPlayerToConsider() {
        return this.state.players.find(player => player.username === this.username)!;
    }

    canPlayCard(
        card: Card,
        // TODO check that the payment object as presented is something the user can afford
        payment?: PropertyCounter<Resource>
    ): CanPlayAndReason {
        const {state} = this;
        const player = this._getPlayerToConsider();
        if (
            !this.canPlayCorporation(card) &&
            !player.cards.some(playerCard => playerCard.name === card.name)
        ) {
            return [false, 'User cannot play this card at this time'];
        }
        if (
            state.common.gameStage === GameStage.CORPORATION_SELECTION &&
            card.type === CardType.CORPORATION
        ) {
            return [true, 'Good to go'];
        }
        const [canPlay, reason] = this.canPlayAction(card, state);

        if (!canPlay) {
            return [canPlay, reason];
        }
        if (!this.canAffordCard(card)) {
            return [false, 'Cannot afford to play'];
        }

        if (!this.doesPlayerHaveRequiredTags(card)) {
            return [false, 'Required tags not met'];
        }

        if (!this.canPlayWithGlobalParameters(card)) {
            return [false, 'Global parameters not met'];
        }

        if (!this.canPlayWithRequiredTilePlacements(card)) {
            return [false, 'Tile placements not met'];
        }

        if (!this.canSatisfyTilePlacements(card)) {
            return [false, 'No valid tile placements'];
        }

        const {requiredProduction} = card;

        if (requiredProduction && player.productions[requiredProduction] < 1) {
            return [false, 'Required production not met.'];
        }

        if (card.minTerraformRating && player.terraformRating < card.minTerraformRating) {
            return [false, 'Terraform rating too low'];
        }

        if (player.pendingDiscard) {
            return [false, 'Cannot play while selecting card(s) to discard'];
        }

        if (state.common.gameStage !== GameStage.ACTIVE_ROUND) {
            return [false, 'Cannot play card outside active round'];
        }

        return [canPlay, reason];
    }

    canPlayStandardProject(standardProjectAction: StandardProjectAction): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        const {state} = this;

        const [canPlay, reason] = this.canPlayAction(standardProjectAction, state);
        if (!canPlay) {
            return [canPlay, reason];
        }

        if (!isActiveRound(state)) {
            return [false, 'Cannot play standard project outside active round'];
        }

        // Selling patents is the only standard project whose cost is cards, not megacredits
        if (standardProjectAction.type === StandardProjectType.SELL_PATENTS) {
            return [player.cards.length > 0, 'Must have a card to sell'];
        }

        let cost = standardProjectAction.cost!;
        const {discounts} = player;

        cost -= discounts.standardProjects;
        if (standardProjectAction.type === StandardProjectType.POWER_PLANT) {
            cost -= discounts.standardProjectPowerPlant;
        }

        const megacredits = player.resources[Resource.MEGACREDIT];
        const heat = player.corporation.name === 'Helion' ? player.resources[Resource.HEAT] : 0;
        return [cost <= megacredits + heat, 'Cannot afford standard project'];
    }

    canClaimMilestone(milestone: Milestone): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        const {state} = this;

        if (!isActiveRound(state)) {
            return [false, 'Cannot claim milestone outside active round'];
        }

        // Is it availiable?
        if (state.common.claimedMilestones.length === 3) {
            return [false, '3 milestones already claimed'];
        }

        if (state.common.claimedMilestones.find(claim => claim.milestone === milestone)) {
            return [false, 'Milestone already claimed'];
        }

        // Can they afford it?
        let availableMoney = player.resources[Resource.MEGACREDIT];
        if (player.corporation.name === 'Helion') {
            availableMoney += player.resources[Resource.HEAT];
        }

        if (availableMoney < 8) {
            return [false, 'Cannot afford'];
        }

        return [
            milestoneQuantitySelectors[milestone](player, state) >= minMilestoneQuantity[milestone],
            'Has not met milestone',
        ];
    }

    canFundAward(award: Award): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        const {state} = this;

        if (this.shouldDisableUI()) return [false, 'Cannot fund award right now'];

        if (!isActiveRound(state)) {
            return [false, 'Cannot fund award when it is not active round'];
        }

        // Is it available?
        if (state.common.fundedAwards.length === 3) {
            return [false, 'No more awards available'];
        }
        if (state.common.fundedAwards.find(claim => claim.award === award)) {
            return [false, 'Award has already been funded'];
        }

        // Can they afford it?
        const cost = [8, 14, 20][state.common.fundedAwards.length];

        const megacredits = player.resources[Resource.MEGACREDIT];
        const heat = player.corporation.name === 'Helion' ? player.resources[Resource.HEAT] : 0;
        return [cost <= megacredits + heat, 'Cannot afford to fund award'];
    }

    canSkipAction(): CanPlayAndReason {
        return [!this.shouldDisableValidGreeneryPlacementUI(), 'Cannot skip action right now'];
    }

    canAffordActionCost(action: Action) {
        const player = this._getPlayerToConsider();
        let {cost, acceptedPayment = []} = action;
        if (!cost) {
            return true;
        }

        for (const acceptedPaymentType of acceptedPayment) {
            cost -=
                player.exchangeRates[acceptedPaymentType] * player.resources[acceptedPaymentType];
        }

        if (player.corporation.name === 'Helion') {
            cost -= player.exchangeRates[Resource.HEAT] * player.resources[Resource.HEAT];
        }

        return cost <= player.resources[Resource.MEGACREDIT];
    }

    canAffordCard(card: Card) {
        const player = this._getPlayerToConsider();
        let cost = this.getDiscountedCardCost(card);

        const isBuildingCard = card.tags.some(tag => tag === Tag.BUILDING);
        if (isBuildingCard) {
            cost -= player.exchangeRates[Resource.STEEL] * player.resources[Resource.STEEL];
        }

        const isSpaceCard = card.tags.some(tag => tag === Tag.SPACE);
        if (isSpaceCard) {
            cost -= player.exchangeRates[Resource.TITANIUM] * player.resources[Resource.TITANIUM];
        }

        const playerIsHelion = player.corporation.name === 'Helion';
        if (playerIsHelion) {
            cost -= player.exchangeRates[Resource.HEAT] * player.resources[Resource.HEAT];
        }

        return cost <= player.resources[Resource.MEGACREDIT];
    }

    canDoConversion(conversion: Conversion | undefined): CanPlayAndReason {
        if (!conversion) return [false, 'No conversion available'];
        const {state} = this;
        const gameStage = state.common.gameStage;
        if (gameStage === GameStage.GREENERY_PLACEMENT) {
            if (conversion.resourceToRemove !== Resource.PLANT) {
                return [false, 'May only convert plants in greenery placement phase'];
            }

            if (this.shouldDisableValidGreeneryPlacementUI()) {
                return [false, 'Cannot do conversion right now'];
            }

            return this.canPlayActionInSpiteOfUI(conversion, state);
        }
        return this.canPlayAction(conversion, state);
    }

    getDiscountedCardCost(card: Card) {
        let {cost = 0} = card;
        const player = this._getPlayerToConsider();
        const {discounts} = player;

        cost -= discounts.card;
        for (const tag of card.tags) {
            cost -= discounts.tags[tag] || 0;
        }
        for (const tag of [...new Set(card.tags)]) {
            cost -= discounts.cards[tag] || 0;
        }
        cost -= discounts.nextCardThisGeneration;

        return Math.max(0, cost);
    }

    doesPlayerHaveRequiredTags(card: Card) {
        const player = this._getPlayerToConsider();

        for (const tag in card.requiredTags) {
            const requiredAmount = card.requiredTags[tag];

            const playerTags = getTags(player);

            const isEnough = playerTags.filter(t => t === tag).length >= requiredAmount;

            if (!isEnough) return false;
        }

        return true;
    }

    canPlayWithGlobalParameters(card: Card) {
        const {requiredGlobalParameter} = card;
        if (!requiredGlobalParameter) return true;
        const player = this._getPlayerToConsider();

        const {type, min = -Infinity, max = Infinity} = requiredGlobalParameter;

        const value = this.state.common.parameters[type];

        // This section takes into account Inventrix/Special Design/...
        let adjustedMin = min;
        let adjustedMax = max;

        adjustedMin -= (player.parameterRequirementAdjustments[type] ?? 0) * PARAMETER_STEPS[type];
        adjustedMin -=
            (player.temporaryParameterRequirementAdjustments[type] ?? 0) * PARAMETER_STEPS[type];

        adjustedMax += (player.parameterRequirementAdjustments[type] ?? 0) * PARAMETER_STEPS[type];
        adjustedMax +=
            (player.temporaryParameterRequirementAdjustments[type] ?? 0) * PARAMETER_STEPS[type];

        return value >= adjustedMin && value <= adjustedMax;
    }

    canSatisfyTilePlacements(card: Card) {
        const player = this._getPlayerToConsider();

        for (const tilePlacement of card.tilePlacements) {
            const validPlacements = getValidPlacementsForRequirement(
                this.state,
                tilePlacement,
                player
            );

            if (validPlacements.length === 0) {
                return false;
            }
        }

        return true;
    }

    canPlayWithRequiredTilePlacements(card: Card) {
        const player = this._getPlayerToConsider();
        let tiles = this.state.common.board
            .flat()
            .filter(cell => cell.tile)
            .map(cell => cell.tile);

        for (const placement of card.requiredTilePlacements) {
            const match = tiles.find(tile => {
                if (placement.currentPlayer && tile && tile.ownerPlayerIndex !== player.index) {
                    return false;
                }

                return tile && tile.type === placement.type;
            });

            if (!match) return false;

            tiles = tiles.filter(tile => tile !== match);
        }

        return true;
    }

    canPlayCardAction(action: Action, state: GameState, parent: Card): CanPlayAndReason {
        if (!this.canAffordActionCost(action)) {
            return [false, 'Cannot afford action cost'];
        }

        if (parent.lastRoundUsedAction === state.common.generation) {
            return [false, 'Already used this generation'];
        }

        return this.canPlayAction(action, state, parent);
    }

    canPlayAction(action: Action, state: GameState, parent?: Card): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        if (this.shouldDisableUI()) {
            if (state.common.currentPlayerIndex === player.index) {
                return [false, 'Cannot play action before finalizing other choices.'];
            }
            return [false, 'Cannot play out of turn.'];
        }

        return this.canPlayActionInSpiteOfUI(action, state, parent);
    }

    canCompletePlaceTile(cell: Cell): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        const validPlacements = getValidPlacementsForRequirement(
            this.state,
            player.pendingTilePlacement,
            player
        );

        const matchingCell = validPlacements.find(candidate => {
            if (candidate.specialName) {
                return candidate.specialName === cell.specialName;
            }
            return candidate.coords?.every((coord, index) => coord === cell.coords?.[index]);
        });

        return [!!matchingCell, 'Not a valid placement location'];
    }

    canCompleteChooseResourceActionDetails(
        option: ResourceActionOption,
        amount: number
    ): CanPlayAndReason {
        const name =
            'name' in option.location
                ? option.location.name
                : 'username' in option.location
                ? option.location.username
                : '';
        const quantity = option.isVariable ? amount : option.quantity;

        const playerOptionWrappers = getPlayerOptionWrappers(
            this.state,
            this._getPlayerToConsider()
        );
        const isDecreaseProduction = option.actionType === 'decreaseProduction';
        const min = isDecreaseProduction ? 1 : 0;
        if (option.isVariable && amount < min) {
            return [false, 'Variable amount too small'];
        }

        const matchingValidOption = playerOptionWrappers.some(wrapper => {
            const max = isDecreaseProduction
                ? wrapper.player.productions[option.resource]
                : wrapper.player.resources[option.resource];
            if (quantity > max) {
                return [false, 'Not enough resources or production'];
            }
            return wrapper.options.some(validOption => {
                // find matching valid option!

                const resourceMatches = option.resource === validOption.resource;

                const actionTypeMatches = option.actionType === validOption.actionType;

                const {location} = validOption;

                let locationMatches: boolean = false;

                if ('name' in location) {
                    locationMatches = location.name === name;
                }
                if ('username' in location) {
                    locationMatches = location.username === name;
                }

                const isVariableMatches = option.isVariable === validOption.isVariable;
                const quantityMatches = option.quantity === validOption.quantity;

                return [
                    resourceMatches &&
                        actionTypeMatches &&
                        isVariableMatches &&
                        quantityMatches &&
                        locationMatches,
                    'Did not pass action check',
                ];
            });
        });

        return [matchingValidOption, 'Did not match a valid option'];
    }

    canSkipChooseResourceActionDetails(): CanPlayAndReason {
        const playerOptionWrappers = getPlayerOptionWrappers(
            this.state,
            this._getPlayerToConsider()
        );
        const {
            actionType,
            resourceAndAmounts,
        } = this._getPlayerToConsider().pendingResourceActionDetails!;
        const canSkipChooseResource = canSkipResourceActionDetails(
            playerOptionWrappers,
            actionType,
            resourceAndAmounts
        );

        return [canSkipChooseResource, 'Cannot skip making a resource choice right now'];
    }

    canSkipChooseDuplicateProduction(): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        if (!player.pendingDuplicateProduction) {
            return [false, 'No pending duplicate production to skip'];
        }
        const {tag} = player.pendingDuplicateProduction;
        const {state} = this;

        const options = getOptionsForDuplicateProduction(tag, player, state);

        return [options.length === 0, 'Cannot skip if at least one option available'];
    }

    shouldDisableUI(state: GameState = this.state) {
        if (state.syncing) {
            return true;
        }
        const {gameStage} = state.common;
        const player = this._getPlayerToConsider();
        if (player.index !== state.common.currentPlayerIndex) {
            return true;
        }
        if (gameStage !== GameStage.ACTIVE_ROUND) {
            return true;
        }
        if (getIsPlayerMakingDecision(state, player)) {
            return true;
        }

        return false;
    }

    shouldDisableValidGreeneryPlacementUI(state: GameState = this.state) {
        const {gameStage} = state.common;
        const player = this._getPlayerToConsider();
        if (player.index !== state.common.currentPlayerIndex) {
            return true;
        }
        if (gameStage !== GameStage.ACTIVE_ROUND && gameStage !== GameStage.GREENERY_PLACEMENT) {
            return true;
        }
        if (getIsPlayerMakingDecision(state, player)) {
            return true;
        }

        return false;
    }

    canPlayActionInSpiteOfUI(action: Action, state: GameState, parent?: Card): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        return canPlayActionInSpiteOfUI(action, state, player, parent);
    }

    canConfirmCardSelection(numCards: number, state: GameState, corporation: Card) {
        const loggedInPlayer = this._getPlayerToConsider();
        if (!loggedInPlayer.corporation) {
            return false;
        }
        const playerMoney = getMoney(state, loggedInPlayer, corporation);
        const totalCardCost = numCards * 3;
        const shouldDisableDiscardConfirmation =
            loggedInPlayer.pendingDiscard?.amount === VariableAmount.USER_CHOICE && numCards === 0;
        if (loggedInPlayer.buyCards && totalCardCost > playerMoney) {
            return false;
        }
        return !(
            shouldDisableDiscardConfirmation ||
            (loggedInPlayer.numCardsToTake !== null && numCards < loggedInPlayer.numCardsToTake)
        );
    }

    canPlayCorporation(card: Card) {
        const {possibleCorporations} = this._getPlayerToConsider();

        return possibleCorporations.some(
            possibleCorporation => possibleCorporation.name === card.name
        );
    }
}

export function canPlayActionInSpiteOfUI(
    action: Action,
    state: GameState,
    player: PlayerState,
    parent?: Card
): CanPlayAndReason {
    if (!doesPlayerHaveRequiredResourcesToRemove(action, state, player, parent)) {
        return [false, 'Not enough of required resource'];
    }

    if (!doesAnyoneHaveResourcesToSteal(action, state, player, parent)) {
        return [false, `There's no source to steal from`];
    }

    // Also accounts for opponent productions if applicable
    if (!meetsProductionRequirements(action, state, player, parent)) {
        return [false, 'Does not have required production'];
    }

    if (!meetsTilePlacementRequirements(action, state, player, parent)) {
        return [false, 'Cannot place tile'];
    }

    if (!meetsTerraformRequirements(action, state, parent)) {
        return [false, 'Not yet terraformed this generation'];
    }

    return [true, 'Good to go'];
}
