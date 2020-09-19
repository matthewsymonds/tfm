import {Action} from 'constants/action';
import {Award, Milestone} from 'constants/board';
import {Conversion} from 'constants/conversion';
import {GameStage, PARAMETER_STEPS} from 'constants/game';
import {PropertyCounter} from 'constants/property-counter';
import {Resource} from 'constants/resource';
import {StandardProjectAction, StandardProjectType} from 'constants/standard-project';
import {Tag} from 'constants/tag';
import {
    doesAnyoneHaveResourcesToSteal,
    doesPlayerHaveRequiredResourcesToRemove,
    isActiveRound,
    meetsProductionRequirements,
    meetsTerraformRequirements,
    meetsTilePlacementRequirements,
    milestoneQuantitySelectors,
    minMilestoneQuantity,
} from 'context/app-context';
import {Card} from 'models/card';
import {GameState} from 'reducer';
import {getTags} from 'selectors/variable-amount';

type CanPlayAndReason = [boolean, string];

export class ActionGuard {
    constructor(
        private readonly game: {
            state: GameState;
            queue: Array<{type: string; payload?: Object}>;
        },
        private readonly username: string
    ) {}

    get state() {
        return this.game.state;
    }

    getLoggedInPlayer() {
        return this.game.state.players.find(player => player.username === this.username)!;
    }

    canPlayCard(
        card: Card,
        // TODO check that the payment object as presented is something the user can afford
        payment?: PropertyCounter<Resource>
    ): CanPlayAndReason {
        const {state} = this;
        const player = this.getLoggedInPlayer();
        if (!this.canAffordCard(card)) {
            return [false, 'Cannot afford to play'];
        }

        if (!this.doesPlayerHaveRequiredTags(card)) {
            return [false, 'Required tags not met'];
        }

        if (!this.canPlayWithGlobalParameters(card)) {
            return [false, 'Global parameters not met'];
        }

        if (!this.canPlayWithTilePlacements(card)) {
            return [false, 'Tile placements not met'];
        }

        const {requiredProduction} = card;

        if (requiredProduction && player.productions[requiredProduction] < 1) {
            return [false, 'Required production not met.'];
        }

        if (card.minTerraformRating && player.terraformRating < card.minTerraformRating) {
            return [false, 'Terraform rating too low'];
        }

        return this.canPlayAction(card, state);
    }

    canPlayStandardProject(standardProjectAction: StandardProjectAction): CanPlayAndReason {
        const player = this.getLoggedInPlayer();
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
        const player = this.getLoggedInPlayer();
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
        const player = this.getLoggedInPlayer();
        const {state} = this;

        if (this.shouldDisableUI(state)) return [false, 'Cannot fund award right now'];

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

        let availableMoney = player.resources[Resource.MEGACREDIT];
        if (player.corporation.name === 'Helion') {
            availableMoney += player.resources[Resource.HEAT];
        }

        return [availableMoney >= cost, 'Cannot afford to fund award'];
    }

    canSkipAction(): CanPlayAndReason {
        const {state} = this;
        return [!this.shouldDisableUI(state), 'Cannot skip action right now'];
    }

    canAffordCard(card: Card) {
        const player = this.getLoggedInPlayer();
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
        return this.canPlayAction(conversion, state);
    }

    getDiscountedCardCost(card: Card) {
        let {cost = 0} = card;
        const player = this.getLoggedInPlayer();
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
        const player = this.getLoggedInPlayer();

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
        const player = this.getLoggedInPlayer();

        const {type, min = -Infinity, max = Infinity} = requiredGlobalParameter;

        const value = this.game.state.common.parameters[type];

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

    canPlayWithTilePlacements(card: Card) {
        const player = this.getLoggedInPlayer();
        let tiles = this.game.state.common.board
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

    canPlayAction(action: Action, state: GameState, parent?: Card): CanPlayAndReason {
        if (this.shouldDisableUI(state)) {
            return [false, ''];
        }

        return this.canPlayActionInSpiteOfUI(action, state, parent);
    }

    shouldDisableUI(state: GameState) {
        const player = this.getLoggedInPlayer();

        if (player.index !== state.common.currentPlayerIndex) {
            return true;
        }
        if (state.common.gameStage !== GameStage.ACTIVE_ROUND) {
            return true;
        }
        if (this.game.queue.length > 0) {
            return true;
        }

        return false;
    }

    canPlayActionInSpiteOfUI(action: Action, state: GameState, parent?: Card): CanPlayAndReason {
        if (
            !doesPlayerHaveRequiredResourcesToRemove(
                action,
                state,
                this.getLoggedInPlayer(),
                parent
            )
        ) {
            return [false, 'Not enough of required resource'];
        }

        if (!doesAnyoneHaveResourcesToSteal(action, state, this.getLoggedInPlayer(), parent)) {
            return [false, `There's no source to steal from`];
        }

        // Also accounts for opponent productions if applicable
        if (!meetsProductionRequirements(action, state, this.getLoggedInPlayer(), parent)) {
            return [false, 'Does not have required production'];
        }

        if (!meetsTilePlacementRequirements(action, state, this.getLoggedInPlayer(), parent)) {
            return [false, 'Cannot place tile'];
        }

        if (!meetsTerraformRequirements(action, state, parent)) {
            return [false, 'Not yet terraformed this generation'];
        }

        return [true, 'Good to go'];
    }
}
