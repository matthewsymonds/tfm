import {getOptionsForDuplicateProduction} from 'components/ask-user-to-confirm-duplicate-production';
import {
    canSkipResourceActionDetails,
    getPlayerOptionWrappers,
    ResourceActionOption,
} from 'components/ask-user-to-confirm-resource-action-details';
import {Action, Payment} from 'constants/action';
import {Award, Cell, Milestone, TilePlacement, TileType} from 'constants/board';
import {CardType, Deck} from 'constants/card-types';
import {COLONIES} from 'constants/colonies';
import {Conversion} from 'constants/conversion';
import {GameStage, PARAMETER_STEPS} from 'constants/game';
import {Resource} from 'constants/resource-enum';
import {StandardProjectAction, StandardProjectType} from 'constants/standard-project';
import {Tag} from 'constants/tag';
import {Delegate, RequiredChairman} from 'constants/turmoil';
import {Card} from 'models/card';
import {GameState, PlayerState} from 'reducer';
import {getValidPlacementsForRequirement} from 'selectors/board';
import {
    canTradeIgnoringPayment,
    canTradeWithSomeColonyIgnoringPayment,
} from 'selectors/can-trade-ignoring-payment';
import {convertAmountToNumber} from 'selectors/convert-amount-to-number';
import {doesAnyoneHaveResourcesToSteal} from 'selectors/does-anyone-have-resources-to-steal';
import {doesPlayerHaveRequiredResourcesToRemove} from 'selectors/does-player-have-required-resource-to-remove';
import {getCard} from 'selectors/get-card';
import {getConditionalPaymentWithResourceInfo} from 'selectors/get-conditional-payment-with-resource-info';
import {getIsPlayerMakingDecision} from 'selectors/get-is-player-making-decision';
import {getMoney} from 'selectors/get-money';
import {getPlayableCards} from 'selectors/get-playable-cards';
import {getPlayerResourceAmount} from 'selectors/get-player-resource-amount';
import {isActiveRound} from 'selectors/is-active-round';
import {meetsColonyPlacementRequirements} from 'selectors/meets-colony-placement-requirements';
import {meetsProductionRequirements} from 'selectors/meets-production-requirements';
import {meetsTerraformRequirements} from 'selectors/meets-terraform-requirements';
import {meetsTilePlacementRequirements} from 'selectors/meets-tile-placement-requirements';
import {milestoneQuantitySelectors, minMilestoneQuantity} from 'selectors/milestone-selectors';
import {getValidTradePayment} from 'selectors/valid-trade-payment';
import {getTags} from 'selectors/variable-amount';
import {SupplementalResources} from 'server/api-action-handler';
import {SerializedPlayerState} from 'state-serialization';

export type CanPlayAndReason = [boolean, string];

export class ActionGuard {
    constructor(public state: GameState, private readonly username: string) {
        this.state = state;
        this.username = username;
    }

    _getPlayerToConsider() {
        return this.state.players.find(player => player.username === this.username)!;
    }

    canPlayCard(
        card: Card,
        player = this._getPlayerToConsider(),
        payment: Payment = player.resources,
        conditionalPayments: number[] = getConditionalPaymentWithResourceInfo(player, card).map(
            payment => payment.resourceAmount
        ),
        supplementalResources?: SupplementalResources
    ): CanPlayAndReason {
        const {state} = this;
        const isPrelude =
            card.type === CardType.PRELUDE &&
            player.preludes.map(prelude => prelude.name).includes(card.name);

        if (isPrelude && !this.canPlayPrelude(card, player, state)) {
            return [false, 'Cannot play prelude'];
        }
        if (
            !this.canPlayCorporation(card) &&
            !player.cards.some(playerCard => playerCard?.name === card.name) &&
            !isPrelude
        ) {
            return [false, 'User cannot play this card at this time'];
        }
        if (
            state.common.gameStage === GameStage.CORPORATION_SELECTION &&
            card.type === CardType.CORPORATION
        ) {
            return [true, 'Good to go'];
        }
        // If the user has been prompted "play a card from hand"
        // Then they should be able to play a card even though the rest of the UI is disabled!
        const canPlayAction = (player.pendingPlayCardFromHand || isPrelude
            ? this.canPlayActionInSpiteOfUI
            : this.canPlayAction
        ).bind(this);

        const [canPlay, reason] = canPlayAction(
            card,
            state,
            /* parent = */ undefined,
            /* supplementalResources = */ undefined,
            /* sourceCard = */ card
        );

        if (!canPlay) {
            return [canPlay, reason];
        }

        for (const step of card.steps ?? []) {
            const [canPlay, reason] = canPlayAction(
                step,
                state,
                /* parent = */ undefined,
                /* supplementalResources = */ undefined,
                /* sourceCard = */ card
            );
            if (!canPlay) {
                return [canPlay, reason];
            }
        }

        // Check if the amount the user is trying to pay with is sufficient (or if they're cheating?).
        const cappedConditionalPayments = getConditionalPaymentWithResourceInfo(player, card);
        for (let i = 0; i < cappedConditionalPayments.length; i++) {
            cappedConditionalPayments[i].resourceAmount = conditionalPayments[i];
        }
        if (!this.canAffordCard(card, player, payment, cappedConditionalPayments)) {
            return [false, 'Cannot afford to play'];
        }

        if (!this.doesPlayerHaveRequiredTags(card)) {
            return [false, 'Required tags not met'];
        }

        const meetsTurmoilRequirements = this.doesCardMeetTurmoilRequirements(card);

        if (!meetsTurmoilRequirements[0]) {
            return meetsTurmoilRequirements;
        }

        const ignoreGlobalRequirements =
            player?.pendingPlayCardFromHand?.ignoreGlobalRequirements ?? false;

        if (!ignoreGlobalRequirements && !this.canPlayWithGlobalParameters(card)) {
            return [false, 'Global parameters not met'];
        }

        if (!this.canPlayWithRequiredTilePlacements(card)) {
            return [false, 'Tile placements not met'];
        }

        if (!this.canSatisfyTilePlacements(card)) {
            return [false, 'No valid tile placements'];
        }

        if (!this.canSatisfyColonyRequirements(card)) {
            return [false, 'Colony requirements not met'];
        }

        const {requiredProduction} = card;

        if (requiredProduction && player.productions[requiredProduction] < 1) {
            return [false, 'Required production not met'];
        }

        if (card.minTerraformRating && player.terraformRating < card.minTerraformRating) {
            return [false, 'Terraform rating too low'];
        }

        if (!isActiveRound(state)) {
            return [false, 'Cannot play card outside active round'];
        }

        for (const resource in card.requiredResources) {
            if (
                getPlayerResourceAmount(player, resource as Resource) <
                card.requiredResources[resource]
            ) {
                return [false, 'Not enough of required resource'];
            }
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

        if (this.shouldDisableUI()) return [false, 'Cannot claim milestone right now'];

        // Is it availiable?
        if (state.common.claimedMilestones.length === 3) {
            return [false, '3 milestones already claimed'];
        }

        if (this.isMilestoneClaimed(milestone)) {
            return [false, 'Milestone already claimed'];
        }

        if (!isActiveRound(state)) {
            return [false, 'Cannot claim milestone right now'];
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
            'Milestone not reached',
        ];
    }

    isMilestoneClaimed(milestone: Milestone): boolean {
        return this.state.common.claimedMilestones.some(claim => claim.milestone === milestone);
    }

    canFundAward(award: Award): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        const {state} = this;

        if (!isActiveRound(state)) {
            return [false, 'Cannot fund award when it is not active round'];
        }

        if (player.fundAward && state.common.currentPlayerIndex === player.index) {
            return [true, 'Can fund an award'];
        }

        if (this.shouldDisableUI()) return [false, 'Cannot fund award right now'];

        // Is it available?
        if (state.common.fundedAwards.length === 3) {
            return [false, 'No more awards available'];
        }
        if (this.isAwardFunded(award)) {
            return [false, 'Award has already been funded'];
        }

        // Can they afford it?
        const cost = [8, 14, 20][state.common.fundedAwards.length];

        const megacredits = player.resources[Resource.MEGACREDIT];
        const heat = player.corporation.name === 'Helion' ? player.resources[Resource.HEAT] : 0;
        return [cost <= megacredits + heat, 'Cannot afford to fund award'];
    }

    isAwardFunded(award: Award) {
        return this.state.common.fundedAwards.some(claim => claim.award === award);
    }

    canSkipAction(): CanPlayAndReason {
        const {state} = this;
        const player = this._getPlayerToConsider();

        if (
            !player.action ||
            state.common.currentPlayerIndex !== player.index ||
            (state.common.controllingPlayerIndex !== undefined &&
                state.common.controllingPlayerIndex !== player.index)
        ) {
            return [false, 'It is not your turn right now'];
        }
        if (player.pendingPlayCardFromHand && getPlayableCards(player, this).length === 0) {
            return [true, 'Has no cards to play'];
        }
        const {gameStage} = state.common;

        if (
            gameStage === GameStage.ACTIVE_ROUND &&
            player.preludes?.length > 0 &&
            player.preludes?.every(preludeCard => !this.canPlayCard(getCard(preludeCard))[0])
        ) {
            return [true, 'Out of playable prelude cards'];
        }
        if (getIsPlayerMakingDecision(state, player)) {
            return [false, 'Player cannot skip while making decision'];
        }
        if (gameStage === GameStage.ACTIVE_ROUND) {
            if (this.shouldDisableUI()) {
                return [false, 'Cannot play game right now'];
            }
            return [player.action === 2, 'Cannot skip 1st action'];
        }
        return [false, 'Cannot skip action right now'];
    }

    canPassGeneration(): CanPlayAndReason {
        const {state} = this;
        const player = this._getPlayerToConsider();

        if (
            !player.action ||
            state.common.currentPlayerIndex !== player.index ||
            (state.common.controllingPlayerIndex !== undefined &&
                state.common.controllingPlayerIndex !== player.index)
        ) {
            return [false, 'It is not your turn right now'];
        }

        if (getIsPlayerMakingDecision(state, player)) {
            return [false, 'Player cannot skip while making decision'];
        }

        const {gameStage} = state.common;
        if (gameStage === GameStage.ACTIVE_ROUND) {
            if (this.shouldDisableUI()) {
                return [false, 'Cannot play game right now'];
            }
            return [player.action === 1, 'Cannot pass 2nd action'];
        }
        if (gameStage === GameStage.GREENERY_PLACEMENT) {
            return [true, 'Good to go'];
        }
        return [false, 'Cannot pass right now'];
    }

    canAffordActionCost(
        action: Action,
        player = this._getPlayerToConsider(),
        payment: Payment = player.resources
    ) {
        let {cost, acceptedPayment = []} = action;
        if (!cost) {
            return true;
        }

        for (const acceptedPaymentType of acceptedPayment) {
            cost -=
                player.exchangeRates[acceptedPaymentType] * (payment?.[acceptedPaymentType] ?? 0);
        }

        if (player.corporation.name === 'Helion') {
            cost -= player.exchangeRates[Resource.HEAT] * (payment?.[Resource.HEAT] ?? 0);
        }

        return cost <= (payment?.[Resource.MEGACREDIT] ?? 0);
    }

    canAffordCard(
        card: Card,
        player = this._getPlayerToConsider(),
        payment: Payment = player.resources,
        conditionalPayment = getConditionalPaymentWithResourceInfo(player, card)
    ) {
        let cost = this.getDiscountedCardCost(card);

        const isBuildingCard = card.tags.some(tag => tag === Tag.BUILDING);
        if (isBuildingCard) {
            cost -= player.exchangeRates[Resource.STEEL] * (payment?.[Resource.STEEL] ?? 0);
        }

        const isSpaceCard = card.tags.some(tag => tag === Tag.SPACE);
        if (isSpaceCard) {
            cost -= player.exchangeRates[Resource.TITANIUM] * (payment?.[Resource.TITANIUM] ?? 0);
        }

        const playerIsHelion = player.corporation.name === 'Helion';
        if (playerIsHelion) {
            cost -= player.exchangeRates[Resource.HEAT] * (payment?.[Resource.HEAT] ?? 0);
        }
        for (const payment of conditionalPayment) {
            cost -= payment.resourceAmount * payment.rate;
        }

        return cost <= (payment?.[Resource.MEGACREDIT] ?? 0);
    }

    canDoConversion(
        conversion: Conversion | undefined,
        supplementalResources?: SupplementalResources
    ): CanPlayAndReason {
        if (!conversion) return [false, 'No conversion available'];
        const parent: Card | undefined = undefined;
        return this.canPlayAction(conversion, this.state, parent, supplementalResources);
    }

    canDoConversionInSpiteOfUI(
        conversion: Conversion,
        supplementalResources?: SupplementalResources
    ): CanPlayAndReason {
        const {state} = this;
        const {gameStage} = state.common;
        if (gameStage === GameStage.GREENERY_PLACEMENT) {
            if (conversion.resourceToRemove !== Resource.PLANT) {
                return [false, 'May only convert plants in greenery placement phase'];
            }
        }
        const parent: Card | undefined = undefined;
        return this.canPlayActionInSpiteOfUI(conversion, state, parent, supplementalResources);
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
        const playerTags = getTags(player);
        let remainingWildTags = playerTags.filter(tag => tag === Tag.WILD).length;

        for (const tag in card.requiredTags) {
            const requiredAmount = card.requiredTags[tag];

            let numberOfRequiredTag = playerTags.filter(t => t === tag).length;
            // While we are short of a tag, allocate wild tags to make up difference.
            while (numberOfRequiredTag < requiredAmount && remainingWildTags) {
                numberOfRequiredTag += 1;
                remainingWildTags -= 1;
            }
            if (numberOfRequiredTag < requiredAmount) {
                return false;
            }
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

        for (const tilePlacement of card.tilePlacements ?? []) {
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

    canSatisfyColonyRequirements(card: Card) {
        const colonies = this.getPlayerColonies();

        if (card.minColonies != null) {
            if (colonies.length < card.minColonies) {
                return false;
            }
        }
        if (card.maxColonies != null) {
            if (colonies.length > card.maxColonies) {
                return false;
            }
        }

        return true;
    }

    private getPlayerColonies() {
        const player = this._getPlayerToConsider();
        const colonies = this.state.common.colonies ?? [];
        return colonies.flatMap(colony =>
            colony.colonies.filter(colony => colony === player.index)
        );
    }

    canPlayWithRequiredTilePlacements(card: Card) {
        const player = this._getPlayerToConsider();
        let tiles = this.state.common.board
            .flat()
            .filter(cell => cell.tile)
            .map(cell => cell.tile);

        for (const placement of card.requiredTilePlacements ?? []) {
            const match = tiles.find(tile => {
                if (!tile) return false;

                if (placement.currentPlayer && tile.ownerPlayerIndex !== player.index) {
                    return false;
                }

                // Special case! Capital is a city.
                if (tile.type === TileType.CAPITAL && placement.type === TileType.CITY) {
                    return true;
                }

                return tile.type === placement.type;
            });

            if (!match) return false;

            tiles = tiles.filter(tile => tile !== match);
        }

        return true;
    }

    canPlayCardAction(
        action: Action,
        parent: Card,
        player: SerializedPlayerState | undefined,
        state: GameState = this.state,
        payment: Payment | undefined = player?.resources,
        supplementalResources?: SupplementalResources,
        actionReplay: boolean = !!player?.pendingActionReplay
    ): CanPlayAndReason {
        const canPlayCardActionPrologue = this.canPlayCardActionPrologue(
            action,
            parent,
            player,
            state,
            payment,
            supplementalResources,
            actionReplay
        );
        if (!canPlayCardActionPrologue[0]) {
            return canPlayCardActionPrologue;
        }

        return this.canPlayAction(action, state, parent, supplementalResources);
    }

    canPlayCardActionInSpiteOfUI(
        action: Action,
        parent: Card,
        player: SerializedPlayerState | undefined,
        state: GameState = this.state,
        payment: Payment | undefined = player?.resources,
        supplementalResources?: SupplementalResources,
        actionReplay: boolean = !!player?.pendingActionReplay
    ): CanPlayAndReason {
        const canPlayCardActionPrologue = this.canPlayCardActionPrologue(
            action,
            parent,
            player,
            state,
            payment,
            supplementalResources,
            actionReplay
        );
        if (!canPlayCardActionPrologue[0]) {
            return canPlayCardActionPrologue;
        }
        return this.canPlayActionInSpiteOfUI(action, state, parent, supplementalResources);
    }

    private canPlayCardActionPrologue(
        action: Action,
        parent: Card,
        player: SerializedPlayerState | undefined,
        state: GameState = this.state,
        payment: Payment | undefined = player?.resources,
        supplementalResources?: SupplementalResources,
        actionReplay?: boolean
    ): CanPlayAndReason {
        if (!this.canAffordActionCost(action, player, payment)) {
            return [false, 'Cannot afford action cost'];
        }

        if (!isActiveRound(state)) {
            return [false, 'Cannot play card action outside active round'];
        }

        if (parent.lastRoundUsedAction === state.common.generation && !actionReplay) {
            return [false, 'Already used this generation'];
        }

        if (player && action.useBlueCardActionAlreadyUsedThisGeneration) {
            const candidates = player.playedCards.filter(card => {
                const fullCard = getCard(card);
                if (!fullCard.action) {
                    // Card does not have an action to replay.
                    return false;
                }

                if (fullCard.action.useBlueCardActionAlreadyUsedThisGeneration) {
                    // Prevent infinite loop
                    return false;
                }

                if (card.lastRoundUsedAction !== state.common.generation) {
                    // Haven't used this card's action this round, so cannot "re-use" it.
                    return false;
                }

                if (fullCard?.action?.choice) {
                    return fullCard.action.choice.some(
                        choiceAction =>
                            this.canPlayCardAction(
                                choiceAction,
                                fullCard,
                                player,
                                state,
                                payment,
                                supplementalResources,
                                /* actionReplay = */ true
                            )[0]
                    );
                }

                // Finally, check, if we can replay the card action.
                return this.canPlayCardAction(
                    fullCard.action,
                    fullCard,
                    player,
                    state,
                    payment,
                    supplementalResources,
                    /* actionreplay */ true
                )[0];
            });
            if (candidates.length === 0) {
                return [false, 'No actions can be replayed'];
            }
        }
        return [true, 'Good to go'];
    }

    canPlayAction(
        action: Action,
        state: GameState,
        parent?: Card,
        supplementalResources?: SupplementalResources,
        sourceCard?: Card
    ): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        if (this.shouldDisableUI()) {
            if (
                (state.common.controllingPlayerIndex ?? state.common.currentPlayerIndex) ===
                player.index
            ) {
                return [false, 'Cannot play action before finalizing other choices'];
            }
            return [false, 'Cannot play out of turn'];
        }

        return this.canPlayActionInSpiteOfUI(
            action,
            state,
            parent,
            supplementalResources,
            sourceCard
        );
    }

    canCompletePlaceTile(
        cell: Cell,
        pendingTilePlacement: TilePlacement | undefined = this._getPlayerToConsider()
            .pendingTilePlacement
    ): CanPlayAndReason {
        if (!pendingTilePlacement) {
            return [false, 'Player cannot place a tile'];
        }
        return [
            !!this.getMatchingCell(cell, pendingTilePlacement),
            'Not a valid placement location',
        ];
    }

    getMatchingCell(cell: Cell, pendingTilePlacement: TilePlacement): Cell | undefined {
        const player = this._getPlayerToConsider();
        const validPlacements = getValidPlacementsForRequirement(
            this.state,
            pendingTilePlacement,
            player
        );

        return validPlacements.find(candidate => {
            if (candidate.specialName) {
                return candidate.specialName === cell.specialName;
            }
            return candidate.coords?.every((coord, index) => coord === cell.coords?.[index]);
        });
    }

    canCompletePutAdditionalColonyTileIntoPlay(colony: string): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        if (!player.putAdditionalColonyTileIntoPlay) {
            return [false, 'Player cannot put an additional colony tile into play'];
        }

        const coloniesAlreadyInPlay = this.state.common.colonies ?? [];
        const colonyNames = coloniesAlreadyInPlay.map(colony => colony.name);
        if (colonyNames.includes(colony)) {
            return [false, 'Colony is already in play'];
        }

        if (!COLONIES.some(colonyObject => colonyObject.name === colony)) {
            return [false, 'Colony does not exist'];
        }

        return [true, 'Good to go'];
    }

    canCompleteIncreaseAndDecreaseColonyTileTracks(
        increase: string,
        decrease: string
    ): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        if (!player.increaseAndDecreaseColonyTileTracks) {
            return [false, 'You cannot increase and decrease colony tile tracks'];
        }

        const {state} = this;
        const {colonies} = state.common;
        if (colonies?.filter(colony => [increase, decrease].includes(colony.name)).length !== 2) {
            return [false, 'Not selecting valid colonies for action'];
        }

        return [true, 'Good to go'];
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

    get isSyncing() {
        return this.state.syncing;
    }

    public ignoreSyncing = false;

    shouldDisableUI(state: GameState = this.state) {
        if (state.syncing && !this.ignoreSyncing) {
            return true;
        }
        const {gameStage} = state.common;
        const player = this._getPlayerToConsider();
        if (
            player.index !==
            (state.common.controllingPlayerIndex ?? state.common.currentPlayerIndex)
        ) {
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

    canPlayActionInSpiteOfUI(
        action: Action,
        state: GameState = this.state,
        parent?: Card,
        supplementalResources?: SupplementalResources,
        sourceCard?: Card
    ): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        return canPlayActionInSpiteOfUI(
            action,
            state,
            player,
            parent,
            supplementalResources,
            sourceCard
        );
    }

    canConfirmCardSelection(
        selectedCards: Array<Card>,
        state: GameState,
        corporation?: Card,
        selectedPreludes?: Card[]
    ) {
        const loggedInPlayer = this._getPlayerToConsider();
        const numCards = selectedCards.length;

        const playerMoney = getMoney(state, loggedInPlayer, corporation);
        const totalCardCost = numCards * loggedInPlayer.cardCost;

        // trying to draft a card not in their list (or discard a card they don't own)
        const possibleCards =
            loggedInPlayer.pendingCardSelection?.possibleCards ?? loggedInPlayer.cards;
        for (const selectedCard of selectedCards) {
            if (!possibleCards?.some(possibleCard => possibleCard.name === selectedCard.name)) {
                return false;
            }
        }

        if (state.common.gameStage === GameStage.DRAFTING) {
            // trying to draft more than one card
            if (numCards !== 1) {
                return false;
            }
        }

        const discardAmount = loggedInPlayer.pendingDiscard?.amount;
        if (discardAmount) {
            const discardQuantity = convertAmountToNumber(discardAmount, state, loggedInPlayer);
            // User doesnt have enough cards to discard
            if (discardQuantity > numCards) {
                return false;
            }
        }

        // user doesn't have money to buy cards
        if (loggedInPlayer.pendingCardSelection?.isBuyingCards && totalCardCost > playerMoney) {
            return false;
        }

        // user trying to take the wrong number of cards
        if (
            loggedInPlayer.pendingCardSelection?.numCardsToTake &&
            loggedInPlayer.pendingCardSelection?.numCardsToTake !== numCards
        ) {
            return false;
        }

        if (
            selectedPreludes &&
            state.options.decks.includes(Deck.PRELUDE) &&
            !this.arePreludesCorrect(selectedPreludes)
        ) {
            return false;
        }
        return true;
    }

    canPlayCorporation(card: Card) {
        const {possibleCorporations} = this._getPlayerToConsider();

        return possibleCorporations.some(
            possibleCorporation => possibleCorporation.name === card.name
        );
    }

    canTrade(
        payment: Resource,
        name: string,
        numHeat = this._getPlayerToConsider()?.resources?.[Resource.HEAT] ?? 0
    ): CanPlayAndReason {
        if (this.shouldDisableUI()) {
            return [false, 'Cannot trade right now'];
        }
        const player = this._getPlayerToConsider();

        const validPayment = getValidTradePayment(player);

        const withResource = validPayment.find(validPayment => validPayment.resource === payment);

        if (!withResource) {
            return [false, 'Cannot pay with that resource'];
        }

        let resourceQuantity = player.resources[payment];
        if (numHeat) {
            const isValidToPayWithHeat =
                player.corporation.name === 'Helion' && payment === Resource.MEGACREDIT;
            if (isValidToPayWithHeat) {
                resourceQuantity += numHeat;
                if (numHeat > this._getPlayerToConsider()?.resources?.[Resource.HEAT] ?? 0) {
                    return [false, 'Trying to pay with too much heat'];
                }
            }
        }

        if (withResource.quantity > resourceQuantity) {
            return [false, 'Cannot afford to trade with that resource'];
        }

        return canTradeIgnoringPayment(player, name, this.state);
    }

    canTradeForFree(name: string): CanPlayAndReason {
        const player = this._getPlayerToConsider();

        if (!player.tradeForFree) {
            return [false, 'Player cannot trade for free'];
        }

        return canTradeIgnoringPayment(player, name, this.state);
    }

    private arePreludesCorrect(selectedPreludes: Card[]) {
        const {state} = this;
        const loggedInPlayer = this._getPlayerToConsider();

        if (
            !selectedPreludes.every(prelude =>
                loggedInPlayer.possiblePreludes.some(
                    possiblePrelude => possiblePrelude.name === prelude.name
                )
            )
        ) {
            return false;
        }
        let expectedLength = 0;
        if (
            state.common.gameStage === GameStage.CORPORATION_SELECTION &&
            state.options?.decks.includes(Deck.PRELUDE)
        ) {
            expectedLength = 2;
        }
        if (selectedPreludes.length !== expectedLength) {
            return false;
        }
        return true;
    }

    private canPlayPrelude(card: Card, player: PlayerState, state: GameState): boolean {
        if (state.common.gameStage !== GameStage.ACTIVE_ROUND) {
            return false;
        }

        if (!player.preludes.map(prelude => prelude.name).includes(card.name)) {
            return false;
        }

        return true;
    }

    private doesCardMeetTurmoilRequirements(card: Card): CanPlayAndReason {
        const player = this._getPlayerToConsider();
        const {state} = this;
        const {turmoil} = state.common;
        if (!turmoil) {
            return [true, 'Turmoil is not enabled in this game'];
        }

        if (card.requiredChairman) {
            if (
                card.requiredChairman === RequiredChairman.NEUTRAL &&
                turmoil.chairperson.playerIndex !== undefined
            ) {
                return [false, 'Sitting chairperson is not neutral'];
            }
            if (
                card.requiredChairman === RequiredChairman.YOU &&
                turmoil.chairperson.playerIndex !== player.index
            ) {
                return [false, 'You are not chairperson'];
            }
        }
        if (card.requiredPartyLeader) {
            let partyLeaderFound = false;
            for (const delegation in turmoil.delegations) {
                const delegates: Delegate[] = turmoil.delegations[delegation];
                // First delegate is the party chairperson.
                // We'll enforce this through the game engine.
                const [partyLeader] = delegates;
                if (partyLeader?.playerIndex === player.index) {
                    partyLeaderFound = true;
                    break;
                }
            }
            if (!partyLeaderFound) {
                return [false, 'You are not a party leader'];
            }
        }

        if (card.requiredPartyOrTwoDelegates) {
            if (card.requiredPartyOrTwoDelegates !== turmoil.rulingParty) {
                if (
                    turmoil.delegations[card.requiredPartyOrTwoDelegates].filter(
                        delegate => delegate.playerIndex === player.index
                    ).length < 2
                ) {
                    return [false, 'Party is not ruling and you do not have 2 delegates there'];
                }
            }
        }

        if (card.exchangeNeutralNonLeaderDelegate) {
            const remainingDelegates = turmoil.delegateReserve[player.index];
            if (remainingDelegates.length === 0) {
                return [false, 'No more delegates in reserve'];
            }
            let foundNeutralNonLeaderDelegate = false;
            for (const delegation in turmoil.delegations) {
                const delegates: Delegate[] = turmoil.delegations[delegation];
                const [leader, ...rest] = delegates;
                for (const delegate of rest) {
                    if (delegate.playerIndex === undefined) {
                        foundNeutralNonLeaderDelegate = true;
                        break;
                    }
                }
            }
            if (!foundNeutralNonLeaderDelegate) {
                return [false, 'No neutral non leader delegate available'];
            }
        }

        if (card.exchangeChairman) {
            const remainingDelegates = turmoil.delegateReserve[player.index];
            if (remainingDelegates.length === 0) {
                return [false, 'No more delegates in reserve'];
            }
        }

        return [true, 'Good to go'];
    }
}

export function canPlayActionInSpiteOfUI(
    action: Action,
    state: GameState,
    player: PlayerState,
    parent?: Card,
    supplementalResources?: SupplementalResources,
    sourceCard?: Card
): CanPlayAndReason {
    if (
        !doesPlayerHaveRequiredResourcesToRemove(
            action,
            state,
            player,
            parent,
            supplementalResources,
            sourceCard
        )
    ) {
        return [false, 'Not enough of required resource'];
    }

    if (!doesAnyoneHaveResourcesToSteal(action, state, player, parent)) {
        return [false, `There's no source to steal from`];
    }

    // Also accounts for opponent productions if applicable
    if (!meetsProductionRequirements(action, state, player, parent, sourceCard)) {
        return [false, 'Does not have required production'];
    }

    if (!meetsTilePlacementRequirements(action, state, player, parent)) {
        return [false, 'Cannot place tile'];
    }

    if (!meetsColonyPlacementRequirements(action, state, player)) {
        return [false, 'Cannot place colony'];
    }

    if (!meetsTerraformRequirements(action, player)) {
        return [false, 'Not yet terraformed this generation'];
    }

    if (action.tradeForFree && !canTradeWithSomeColonyIgnoringPayment(player, state)) {
        return [false, 'Cannot trade with any colony right now'];
    }

    if (action.steps) {
        for (const step of action.steps) {
            const [canPlay, reason] = canPlayActionInSpiteOfUI(
                step,
                state,
                player,
                parent,
                supplementalResources
            );
            if (!canPlay) {
                return [canPlay, reason];
            }
        }
    }

    return [true, 'Good to go'];
}
