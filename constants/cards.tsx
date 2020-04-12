import {CardConfig, Deck, Tag, CardType} from './card-types';
import {Resource} from './resource';
import {TileType, Location, Parameter, t} from './board';
import {ActionType} from './action';

export const cardConfigs: CardConfig[] = [
    {
        cost: 8,
        deck: Deck.BASIC,
        name: 'Colonizer Training Camp',
        oneTimeText: 'Oxygen must be 5% or less.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 5
        },
        tags: [Tag.BUILDING, Tag.JOVIAN],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        cost: 13,
        deck: Deck.CORPORATE,
        name: 'Asteroid Mining Consortium',
        oneTimeText:
            'Requires that you have titanium production. Decrease any titanium production 1 step and increase your own 1 step.',
        tags: [Tag.JOVIAN],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        // TODO(multi): Add check to verify opponent has production to lose
        // canBePlayed: state => state.players[state.currentPlayerIndex].productions[Resource.TITANIUM] > 0,
        // requirementFailedMessage: 'You need titanium production to play',
        decreaseAnyProduction: [Resource.TITANIUM],
        increaseProduction: [Resource.TITANIUM],
        requiredProduction: Resource.TITANIUM
    },
    {
        cost: 13,
        deck: Deck.BASIC,
        name: 'Deep Well Heating',
        oneTimeText: 'Increase your energy production 1 step. Increase temperature 1 step.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.TITANIUM],
        increaseParameter: [Parameter.TEMPERATURE]
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Cloud Seeding',
        oneTimeText:
            'Requires 3 ocean tiles. Decrease your MC production 1 step and any heat production 1 step.  Increase your plant production 2 steps.',
        // TODO(multi): validate opponent production reduction
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 3
        },
        tags: [],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.MEGACREDIT],
        decreaseAnyProduction: [Resource.HEAT],
        increaseProduction: [Resource.PLANT, Resource.PLANT]
    },
    {
        // action: function(dispatch) {
        //     dispatch(revealAndDiscardTopCard());
        //     dispatch(addResourceIfRevealedCardHasTag(this.name, Resource.SCIENCE, Tag.MICROBE));
        // },
        actionOrEffectText:
            'Action: Spend 1 MC to reveal and discard the top card of the draw deck. If that card has a microbe tag, add a science resource here.',
        cost: 3,
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 6
        },
        deck: Deck.BASIC,
        storedResourceType: Resource.SCIENCE,
        name: 'Search For Life',
        oneTimeText:
            'Oxygen must be 6% or less. 3 VPs if you have one or more science resource here.',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        get victoryPoints() {
            return this.resources.length > 0 ? 3 : 0;
        }
    },
    {
        // action: dispatch => dispatch(goToGameStage(GameStage.BUY_OR_DISCARD)),
        actionOrEffectText: 'Action: Look at the top card and either buy it or discard it',
        cost: 9,
        deck: Deck.CORPORATE,
        name: "Inventors' Guild",
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE
    },
    {
        // action: dispatch => {
        //     dispatch(changeResource(Resource.ENERGY, -1));
        //     dispatch(gainOneMegacreditPerCityOnMars());
        // },
        actionOrEffectText: 'Action: Spend 1 energy to gain 1 MC for each city tile ON MARS.',
        cost: 13,
        deck: Deck.BASIC,
        name: 'Martian Rails',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
    },
    {
        cost: 26,
        deck: Deck.BASIC,
        name: 'Capital',
        oneTimeText:
            'Requires 4 ocean tiles. Place [the capital city] tile. Decrease your energy production 2 steps and increase your MC production 5 steps. 1 ADDITIONAL VP FOR EACH OCEAN TILE ADJACENT TO THIS CITY TILE.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 4
        },
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.CAPITAL)],
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: [
            Resource.MEGACREDIT,
            Resource.MEGACREDIT,
            Resource.MEGACREDIT,
            Resource.MEGACREDIT,
            Resource.MEGACREDIT
        ]
    },
    {
        cost: 14,
        deck: Deck.BASIC,
        name: 'Asteroid',
        oneTimeText:
            'Raise temperature 1 step and gain 2 titanium. Remove up to 3 plants from any player.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: [Parameter.TEMPERATURE],
        gainResource: [Resource.TITANIUM, Resource.TITANIUM],
        removeAnyResource: [Resource.PLANT]
    },
    {
        cost: 21,
        deck: Deck.BASIC,
        name: 'Comet',
        oneTimeText:
            'Raise temperature 1 step and place an ocean tile. Remove up to 3 plants from any player.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: [Parameter.TEMPERATURE],
        tilePlacements: [t(TileType.OCEAN)],
        removeAnyResource: [Resource.PLANT]
    },
    {
        cost: 27,
        deck: Deck.BASIC,
        name: 'Big Asteroid',
        oneTimeText:
            'Raise temperature 2 steps and gain 4 titanium. Remove up to 4 plants from any player.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: [Parameter.TEMPERATURE, Parameter.TEMPERATURE],
        gainResource: Array(4).fill(Resource.TITANIUM),
        removeAnyResource: Array(4).fill(Resource.PLANT)
    },
    {
        actionOrEffectText:
            'Action: Pay 12 MC to place an ocean tile. TITANIUM MAY BE USED as if playing a space card.',
        cost: 25,
        deck: Deck.BASIC,
        name: 'Water Import From Europa',
        oneTimeText: '1 VP for each Jovian tag you have.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.ACTIVE,
        get victoryPoints() {
            if (!this.state) return 0;
            return this.state.tags.filter(tag => tag === Tag.JOVIAN).length;
        }
    },
    {
        actionOrEffectText: 'Action: Spend 1 steel to gain 5 MC',
        cost: 27,
        deck: Deck.CORPORATE,
        name: 'Space Elevator',
        oneTimeText: 'Increase your titanium production 1 step.',
        tags: [Tag.BUILDING, Tag.SPACE],
        type: CardType.ACTIVE,
        victoryPoints: 2,
        increaseProduction: [Resource.TITANIUM]
    },
    {
        actionOrEffectText: 'Action: Spend 1 energy to draw a card.',
        cost: 11,
        deck: Deck.CORPORATE,
        name: 'Development Center',
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText:
            'Action: Decrease your energy production 1 step to increase your terraforming rating 1 step.',
        cost: 11,
        deck: Deck.BASIC,
        name: 'Equatorial Magnetizer',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
    },
    {
        cost: 24,
        deck: Deck.BASIC,
        name: 'Domed Crater',
        oneTimeText:
            'Oxygen must be 7% or less. Gain 3 plants and place a city tile. Decrease your energy production 1 step and increase MC production 3 steps.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 7
        },
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        gainResource: [Resource.PLANT, Resource.PLANT, Resource.PLANT],
        tilePlacements: [t(TileType.CITY)],
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT, Resource.MEGACREDIT]
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Noctis City',
        oneTimeText:
            'Decrease your energy production 1 step and increase your MC production 3 steps. Place a tile ON THE RESERVED AREA, disregarding normal placement restrictions.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.ENERGY],
        increaseParameter: Array(3).fill(Resource.MEGACREDIT),
        tilePlacements: [t(TileType.NOCTIS, Location.NOCTIS)]
    },
    {
        cost: 28,
        deck: Deck.BASIC,
        name: 'Methane From Titan',
        oneTimeText:
            'Requires 2% oxygen. Increase your heat production 2 steps and your plant production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 2
        },
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: [...Array(2).fill(Resource.HEAT), ...Array(2).fill(Resource.PLANT)]
    },
    {
        cost: 16,
        deck: Deck.BASIC,
        name: 'Imported Hydrogen',
        oneTimeText:
            'Gain 3 plants, or add 3 microbes or 2 animals to ANOTHER card. Place an ocean tile.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        gainResourceOption: [
            Array(3).fill(Resource.PLANT),
            Array(3).fill(Resource.MICROBE),
            Array(2).fill(Resource.ANIMAL)
        ]
    },
    {
        actionOrEffectText: 'Effect: When you play a card, you pay 1 MC less for it.',
        cost: 18,
        deck: Deck.BASIC,
        name: 'Research Outpost',
        oneTimeText: 'Place a city tile NEXT TO NO OTHER TILE.',
        tags: [Tag.BUILDING, Tag.CITY, Tag.SCIENCE],
        type: CardType.ACTIVE,
        tilePlacements: [t(TileType.CITY, Location.ISOLATED)]
    },
    {
        cost: 25,
        deck: Deck.BASIC,
        name: 'Phobos Space Haven',
        oneTimeText:
            'Increase your titanium production 1 step and place a city tile ON THE RESERVED AREA.',
        tags: [Tag.CITY, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 3,
        increaseProduction: [Resource.TITANIUM],
        tilePlacements: [t(TileType.CITY, Location.PHOBOS)]
    },
    {
        cost: 15,
        deck: Deck.BASIC,
        name: 'Black Polar Dust',
        oneTimeText:
            'Place an ocean tile. Decrease your MC production 2 steps and increase your heat production 3 steps.',
        tags: [],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.OCEAN)],
        decreaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT],
        increaseProduction: Array(3).fill(Resource.HEAT)
    },
    {
        actionOrEffectText: 'Effect: When anyone places an ocean tile, gain 2 plants.',
        cost: 12,
        deck: Deck.BASIC,
        name: 'Arctic Algae',
        oneTimeText: 'It must be -12°C or colder to play. Gain 1 plant.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            max: -12
        },
        tags: [Tag.PLANT],
        type: CardType.ACTIVE,
        condition: condition => condition.tileType === TileType.OCEAN,
        effect: effect => effect.gainResource(Resource.PLANT, 2),
        gainResource: [Resource.PLANT]
    },
    {
        actionOrEffectText: 'Action: Remove 1 animal from any card and add it to this card.',
        cost: 14,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Predators',
        oneTimeText: 'Requires 11% oxygen. 1 VP per animal on this card.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 11
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        get victoryPoints() {
            return this.resources.length;
        }
    },
    {
        actionOrEffectText: 'Effect: When you play a space card, you pay 2 MC less for it.',
        cost: 10,
        deck: Deck.CORPORATE,
        name: 'Space Station',
        tags: [Tag.SPACE],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        cost: 16,
        deck: Deck.BASIC,
        name: 'Eos Chasma National Park',
        oneTimeText:
            'Requires -12°C  or warmer. Add 1 animal TO ANY animal CARD. Gain 3 plants. Increase your MC production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -12
        },
        tags: [Tag.BUILDING, Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        gainResource: [Resource.ANIMAL, Resource.PLANT, Resource.PLANT, Resource.PLANT],
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT]
    },
    {
        cost: 24,
        deck: Deck.CORPORATE,
        name: 'Interstellar Colony Ship',
        oneTimeText: 'Requires 5 science tags.',
        requiredTags: {[Tag.SCIENCE]: 5},
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        victoryPoints: 4
    },
    {
        actionOrEffectText: 'Action: Spend 1 titanium to add 1 fighter resource to this card.',
        cost: 12,
        deck: Deck.CORPORATE,
        storedResourceType: Resource.FIGHTER,
        name: 'Security Fleet',
        oneTimeText: '1 VP for each fighter resource on this card.',
        tags: [Tag.SPACE],
        type: CardType.ACTIVE,
        get victoryPoints() {
            return this.resources.length;
        }
    },
    {
        cost: 16,
        deck: Deck.BASIC,
        name: 'Cupola City',
        oneTimeText:
            'Oxygen must be 9% or less. Place a city tile. Decrease your energy production 1 step and increase your MC production 3 steps.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 9
        },
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.CITY)],
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: Array(3).fill(Resource.MEGACREDIT)
    },
    {
        cost: 13,
        deck: Deck.BASIC,
        name: 'Lunar Beam',
        oneTimeText:
            'Decrease your MC production 2 steps and increase your heat production and energy production 2 steps each.',
        tags: [Tag.EARTH, Tag.POWER],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT],
        increaseProduction: [...Array(2).fill(Resource.HEAT), ...Array(2).fill(Resource.ENERGY)]
    },
    {
        actionOrEffectText: 'Effect: When you place a space event, you gain 3 MC and 3 heat.',
        cost: 7,
        deck: Deck.BASIC,
        name: 'Optimal Aerobraking',
        tags: [Tag.SPACE],
        type: CardType.ACTIVE,
        condition: condition =>
            (!!condition.samePlayer &&
                condition.card?.tags.includes(Tag.SPACE) &&
                condition.card?.tags.includes(Tag.EVENT)) ??
            false,
        effect: effect => {
            effect.gainResource(Resource.MEGACREDIT, 3);
            effect.gainResource(Resource.HEAT, 3);
        }
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Underground City',
        oneTimeText:
            'Place a city tile. Decrease your energy production 2 steps and increase your steel production 2 steps.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.CITY)],
        decreaseProduction: [Resource.ENERGY, Resource.ENERGY],
        increaseProduction: [Resource.STEEL, Resource.STEEL]
    },
    {
        actionOrEffectText:
            'Action: Add 1 microbe to this card, or remove 2 microbe from this card to raise oxygen level 1 step.',
        cost: 13,
        deck: Deck.BASIC,
        storedResourceType: Resource.MICROBE,
        name: 'Regolith Eaters',
        tags: [Tag.MICROBE, Tag.SCIENCE],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText:
            'Action: Add 1 microbe to this card, or remove 2 microbes to raise temperature 1 step.',
        cost: 8,
        deck: Deck.BASIC,
        storedResourceType: Resource.MICROBE,
        name: 'GHG Producing Bacteria',
        oneTimeText: 'Requires 4% oxygen.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 4
        },
        tags: [Tag.MICROBE, Tag.SCIENCE],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText: 'Action: Remove 1 microbe from any card to add 1 to this card.',
        cost: 9,
        deck: Deck.BASIC,
        storedResourceType: Resource.MICROBE,
        name: 'Ants',
        oneTimeText: 'Requires 4% oxygen. 1 VP per 2 microbes on this card.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 4
        },
        tags: [Tag.MICROBE],
        type: CardType.ACTIVE
    },
    {
        increaseTerraformRating: 2,
        cost: 14,
        deck: Deck.BASIC,
        name: 'Release of Inert Gases',
        oneTimeText: 'Raise your terraform rating 2 steps.',
        tags: [Tag.EVENT],
        type: CardType.EVENT
    },
    {
        increaseTerraformRating: 2,
        cost: 31,
        deck: Deck.BASIC,
        name: 'Nitrogen-Rich Asteroid',
        oneTimeText:
            'Raise your terraforming rating 2 steps and temperature 1 step. Increase your plant production 1 step, or 4 steps if you have 3 plant tags.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: [
            Parameter.TERRAFORM_RATING,
            Parameter.TEMPERATURE,
            Parameter.TEMPERATURE
        ],
        get increaseProduction() {
            if (!this.state) return [Resource.PLANT];

            if (this.state.tags.filter(tag => tag === Tag.PLANT).length < 3)
                return [Resource.PLANT];

            return [Resource.PLANT, Resource.PLANT, Resource.PLANT, Resource.PLANT];
        }
    },
    {
        actionOrEffectText: 'Effect: When any city tile is placed, gain 2 MC',
        cost: 8,
        deck: Deck.BASIC,
        name: 'Rover Construction',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE,
        victoryPoints: 1,
        condition: condition => condition.tileType === TileType.CITY,
        effect: effect => {
            effect.gainResource(Resource.MEGACREDIT, 2);
        }
    },
    {
        cost: 31,
        deck: Deck.BASIC,
        name: 'Deimos Down',
        oneTimeText:
            'Raise temperature 3 steps and gain 4 steel. Remove up to 8 plants from any player.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: Array(3).fill(Parameter.TEMPERATURE),
        removeAnyResource: Array(8).fill(Resource.PLANT)
    },
    {
        cost: 30,
        deck: Deck.BASIC,
        name: 'Asteroid Mining',
        oneTimeText: 'Increase your titanium production 2 steps.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: [Resource.TITANIUM, Resource.TITANIUM]
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Food Factory',
        oneTimeText:
            'Decrease your plant production 1 step and increase your MC production 4 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        decreaseProduction: [Resource.PLANT],
        increaseProduction: Array(4).fill(Resource.MEGACREDIT)
    },
    {
        cost: 6,
        deck: Deck.BASIC,
        name: 'Archaebacteria',
        oneTimeText: 'It must be -18°C or colder. Increase your plant production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            max: -18
        },
        tags: [Tag.MICROBE],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.PLANT]
    },
    {
        cost: 6,
        deck: Deck.BASIC,
        name: 'Carbonate Processing',
        oneTimeText:
            'Decrease your energy production 1 step and increase your heat production 3 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: Array(3).fill(Resource.HEAT)
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Natural Preserve',
        oneTimeText:
            'Oxygen must be 4% or less. Place this tile NEXT TO NO OTHER TILE. Increase your MC production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 4
        },
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        tilePlacements: [t(TileType.NATURAL_PRESERVE, Location.ISOLATED)],
        increaseProduction: [Resource.MEGACREDIT]
    },
    {
        cost: 10,
        deck: Deck.BASIC,
        name: 'Nuclear Power',
        oneTimeText:
            'Decrease your MC production 2 steps and increase your energy production 3 steps.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT],
        increaseProduction: [Resource.ENERGY, Resource.ENERGY]
    },
    {
        cost: 8,
        deck: Deck.CORPORATE,
        name: 'Lightning Harvest',
        oneTimeText:
            'Requires 3 science tags. Increase your energy production and your MC production 1 step each.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [Resource.ENERGY, Resource.MEGACREDIT]
    },
    {
        cost: 10,
        deck: Deck.BASIC,
        name: 'Algae',
        oneTimeText:
            'Requires 5 ocean tiles. Gain 1 plant and increase your plant production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 5
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        gainResource: [Resource.PLANT],
        increaseProduction: [Resource.PLANT, Resource.PLANT]
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Adapted Lichen',
        oneTimeText: 'Increase your plant production 1 step.',
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.PLANT]
    },
    {
        actionOrEffectText: 'Action: Add 1 microbe to this card.',
        cost: 4,
        deck: Deck.CORPORATE,
        storedResourceType: Resource.MICROBE,
        name: 'Tardigrades',
        oneTimeText: '1 VP per 4 microbes on this card.',
        tags: [Tag.MICROBE],
        type: CardType.ACTIVE,
        get victoryPoints() {
            return Math.floor(this.resources.length / 4);
        }
    },
    {
        cost: 1,
        deck: Deck.CORPORATE,
        name: 'Virus',
        oneTimeText: 'Remove up to 2 animals or 5 plants from any player.',
        tags: [Tag.EVENT, Tag.MICROBE],
        type: CardType.EVENT,
        removeAnyResourceOption: [Array(2).fill(Resource.ANIMAL), Array(5).fill(Resource.PLANT)]
    },
    {
        cost: 12,
        deck: Deck.CORPORATE,
        name: 'Miranda Resort',
        oneTimeText: 'Increase your MC production 1 step for each Earth tag you have.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        get increaseProduction() {
            if (!this.state) {
                return [];
            }
            return this.state.tags.filter(tag => tag === Tag.EARTH).fill(Resource.MEGACREDIT);
        }
    },
    {
        actionOrEffectText: 'Action: Add 1 animal to this card.',
        cost: 9,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Fish',
        oneTimeText:
            'Requires 2°C or warmer. Decrease any plant production 1 step. 1 VP for each animal on this card.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 2
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        decreaseAnyProduction: [Resource.ANIMAL],
        get victoryPoints() {
            return this.resources.length;
        }
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Lake Marineris',
        oneTimeText: 'Requires 0°C or warmer. Place 2 ocean tiles.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 0
        },
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        tilePlacements: [t(TileType.OCEAN), t(TileType.OCEAN)]
    },
    {
        actionOrEffectText: 'Action: Add 1 animal to this card.',
        cost: 6,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Small Animals',
        oneTimeText:
            'Requires 6% oxygen. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 6
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        decreaseAnyProduction: [Resource.PLANT],
        get victoryPoints() {
            return Math.floor(this.resources.length / 2);
        }
    },
    {
        cost: 17,
        deck: Deck.BASIC,
        name: 'Kelp Farming',
        oneTimeText:
            'Requires 6 ocean tiles. Increase your MC production 2 steps and your plant production 3 steps. Gain 2 plants.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 6
        },
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [
            ...Array(2).fill(Resource.MEGACREDIT),
            ...Array(3).fill(Resource.PLANT)
        ],
        gainResource: [Resource.PLANT, Resource.PLANT]
    },
    {
        cost: 4,
        deck: Deck.CORPORATE,
        name: 'Mine',
        oneTimeText: 'Increase your steel production 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.STEEL]
    },
    {
        cost: 15,
        deck: Deck.CORPORATE,
        name: 'Vesta Shipyard',
        oneTimeText: 'Increase your titanium production 1 step.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [Resource.TITANIUM]
    },
    {
        cost: 32,
        deck: Deck.BASIC,
        name: 'Beam From a Thorium Asteroid',
        oneTimeText:
            'Requires a Jovian tag. Increase your heat production and energy production 3 steps each.',
        requiredTags: {[Tag.JOVIAN]: 1},
        tags: [Tag.POWER, Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [...Array(3).fill(Resource.HEAT), ...Array(3).fill(Resource.ENERGY)]
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Mangrove',
        oneTimeText:
            'Requires +4°C or warmer. Place a Greenery tile ON AN AREA RESERVED FOR OCEAN and raise oxygen 1 step. Disregard normal placement restrictions for this.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 4
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        tilePlacements: [t(TileType.GREENERY, Location.RESERVED_FOR_OCEAN)]
    },
    {
        cost: 13,
        deck: Deck.BASIC,
        name: 'Trees',
        oneTimeText:
            'Requires -4°C or warmer. Increase your plant production 3 steps. Gain 1 plant.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -4
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [Resource.PLANT, Resource.PLANT, Resource.PLANT],
        gainResource: [Resource.PLANT]
    },
    {
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Great Escarpment Consortium',
        oneTimeText:
            'Requires that you have steel production. Decrease any steel production 1 step and increase your own 1 step',
        tags: [],
        type: CardType.AUTOMATED,
        decreaseAnyProduction: [Resource.STEEL],
        increaseProduction: [Resource.STEEL],
        requiredProduction: Resource.STEEL
    },
    {
        cost: 5,
        deck: Deck.CORPORATE,
        name: 'Mineral Deposit',
        oneTimeText: 'Gain 5 steel.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        gainResource: [Resource.STEEL]
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Mining Expedition',
        oneTimeText: 'Raise oxygen 1 step. Remove 2 plants from any player. Gain 2 steel.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        increaseParameter: [Parameter.OXYGEN],
        removeAnyResource: [Resource.PLANT, Resource.PLANT],
        gainResource: [Resource.STEEL, Resource.STEEL]
    },
    {
        cost: 4,
        deck: Deck.CORPORATE,
        name: 'Mining Area',
        oneTimeText:
            'Place [the mining] tile on an area with a steel or titanium placement bonus, adjacent to another of your tiles. Increase your production of that resource 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.MINING, Location.STEEL_OR_TITANIUM_PLAYER_ADJACENT)],
        get increaseProduction() {
            if (!this.state) return [];

            const tile = this.state.tiles.find(tile => tile.type === TileType.MINING);
            if (!tile) return [];

            const {bonus} = tile.cell;

            return bonus.includes(Resource.STEEL) ? [Resource.STEEL] : [Resource.TITANIUM];
        }
    },
    {
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Building Industries',
        oneTimeText:
            'Decrease your energy production 1 step and increase your steel production 2 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: [Resource.STEEL, Resource.STEEL]
    },
    {
        cost: 1,
        deck: Deck.CORPORATE,
        name: 'Land Claim',
        oneTimeText: 'Place your marker on a non-reserved area. Only you may place a tile here',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.LAND_CLAIM, Location.NON_RESERVED)]
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Mining Rights',
        oneTimeText:
            'Place [the mining] tile on an area with a steel or titanium placement bonus. Increase that production 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.MINING, Location.STEEL_OR_TITANIUM)]
    },
    {
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Sponsors',
        oneTimeText: 'Increase your MC production 2  steps.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT]
    },
    {
        actionOrEffectText: 'Action: Spend 1 plant or 1 steel to gain 7 MC',
        cost: 17,
        deck: Deck.CORPORATE,
        name: 'Electro Catapult',
        oneTimeText: 'Oxygen must be 8% or less. Decrease your energy production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 8
        },
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE,
        victoryPoints: 1,
        decreaseProduction: [Resource.ENERGY]
    },
    {
        actionOrEffectText: 'Effect: when you play a card, you pay 2 MC less for it.',
        cost: 23,
        deck: Deck.CORPORATE,
        name: 'Earth Catapult',
        tags: [Tag.EARTH],
        type: CardType.ACTIVE,
        victoryPoints: 2
    },
    {
        actionOrEffectText:
            'Effect: Each titanium you have is worth 1MC extra. Each steel you have is worth 1 MC extra.',
        cost: 9,
        deck: Deck.CORPORATE,
        name: 'Advanced Alloys',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText: 'Action: Add an animal to this card.',
        cost: 10,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Birds',
        oneTimeText:
            'Requires 13% oxygen. Decrease any plant production 2 steps. 1 VP for each animal on this card',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 13
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        decreaseAnyProduction: [Resource.PLANT],
        get victoryPoints() {
            return this.resources.length;
        }
    },
    {
        actionOrEffectText:
            'Effect: When you play a science tag, including this, you may discard a card from hand to draw a card.',
        cost: 8,
        deck: Deck.CORPORATE,
        name: 'Mars University',
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 1,
        condition: condition => condition.tag === Tag.SCIENCE,
        effect: effect => effect.discardThenDraw()
    },
    {
        actionOrEffectText:
            'Effect: When you play a plant, microbe, or an animal tag, including this, gain 1 plant or add 1 resource TO THAT CARD.',
        cost: 9,
        deck: Deck.CORPORATE,
        name: 'Viral Enhancers',
        tags: [Tag.MICROBE, Tag.SCIENCE],
        type: CardType.ACTIVE,
        condition: condition =>
            !!condition.tag && [Tag.PLANT, Tag.MICROBE, Tag.ANIMAL].includes(condition.tag),
        effect: effect =>
            effect.gainResourceOption([[Resource.PLANT], [Resource.MICROBE], [Resource.MICROBE]])
    },
    {
        cost: 23,
        deck: Deck.BASIC,
        name: 'Towing a Comet',
        oneTimeText: 'Gain 2 plants. Raise oxygen level 1 step and place an ocean tile.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        gainResource: [Resource.PLANT, Resource.PLANT],
        increaseParameter: [Parameter.OXYGEN],
        tilePlacements: [t(TileType.OCEAN)]
    },
    {
        actionOrEffectText: 'Action: Spend 7MC to increase your energy production 1 step.',
        cost: 3,
        deck: Deck.BASIC,
        name: 'Space Mirrors',
        tags: [Tag.POWER, Tag.SPACE],
        type: CardType.ACTIVE
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Solar Wind Power',
        oneTimeText: 'Increase your energy production 1 step and gain 2 titanium.',
        tags: [Tag.POWER, Tag.SCIENCE, Tag.SPACE],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.ENERGY],
        gainResource: [Resource.TITANIUM, Resource.TITANIUM]
    },
    {
        cost: 23,
        deck: Deck.BASIC,
        name: 'Ice Asteroid',
        oneTimeText: 'Place 2 ocean tiles.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.OCEAN), t(TileType.OCEAN)]
    },
    {
        actionOrEffectText: 'Effect: When you play a space card, you pay 2 MC less for it',
        cost: 13,
        deck: Deck.CORPORATE,
        name: 'Quantum Extractor',
        requiredTags: {[Tag.SCIENCE]: 4},
        tags: [Tag.POWER, Tag.SCIENCE],
        type: CardType.ACTIVE,
        oneTimeText: 'Increase your energy production 4 steps.',
        increaseProduction: Array(4).fill(Resource.ENERGY)
    },
    {
        cost: 36,
        deck: Deck.BASIC,
        name: 'Giant Ice Asteroid',
        oneTimeText:
            'Raise temperature 2 steps and place 2 ocean tiles. Remove up to 6 plants from any plyer.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.OCEAN), t(TileType.OCEAN)],
        increaseParameter: [Parameter.TEMPERATURE, Parameter.TEMPERATURE],
        removeAnyResource: Array(6).fill(Resource.PLANT)
    },
    {
        cost: 20,
        deck: Deck.BASIC,
        name: 'Ganymede Colony',
        oneTimeText:
            'Place a city tile ON THE RESERVED AREA [for Ganymede Colony]. 1 VP per Jovian tag you have.',
        tags: [Tag.CITY, Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.CITY, Location.GANYMEDE)],
        get victoryPoints() {
            if (!this.state) return [];
            return this.state.tags.filter(tag => tag === Tag.JOVIAN).length;
        }
    },
    {
        cost: 24,
        deck: Deck.CORPORATE,
        name: 'Callisto Penal Mines',
        oneTimeText: 'Increase your MC production 3 steps.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT, Resource.MEGACREDIT]
    },
    {
        cost: 17,
        deck: Deck.BASIC,
        name: 'Giant Space Mirror',
        oneTimeText: 'Increase your energy production 3 steps.',
        tags: [Tag.POWER, Tag.SPACE],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.ENERGY, Resource.ENERGY, Resource.ENERGY]
    },
    {
        actionOrEffectText: '',
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Trans-Neptune Probe',
        tags: [Tag.SCIENCE, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 16,
        deck: Deck.CORPORATE,
        name: 'Commercial District',
        oneTimeText:
            'Decrease your energy production 1 step and increase your MC production 4 steps. Place [the commercial district] tile. 1 VP PER ADJACENT CITY TILE.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: [
            Resource.MEGACREDIT,
            Resource.MEGACREDIT,
            Resource.MEGACREDIT,
            Resource.MEGACREDIT
        ]
    },
    {
        cost: 9,
        deck: Deck.CORPORATE,
        name: 'Robotic Workforce',
        oneTimeText: 'Duplicate only the production box of one of your building cards.',
        tags: [Tag.SCIENCE],
        type: CardType.AUTOMATED
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Grass',
        oneTimeText:
            'Requires -16°C or warmer. Increase your plant production 1 step. Gain 3 plants.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -16
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.PLANT],
        gainResource: [Resource.PLANT, Resource.PLANT, Resource.PLANT]
    },
    {
        cost: 6,
        deck: Deck.BASIC,
        name: 'Heather',
        oneTimeText:
            'Requires -14°C or warmer. Increase your plant production 1 step. Gain 1 plant.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -14
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.PLANT],
        gainResource: [Resource.PLANT]
    },
    {
        cost: 7,
        deck: Deck.BASIC,
        name: 'Peroxide Power',
        oneTimeText:
            'Decrease your MC production 1 step and increase your energy production 2 steps.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.MEGACREDIT],
        increaseProduction: [Resource.ENERGY, Resource.ENERGY]
    },
    {
        cost: 11,
        deck: Deck.CORPORATE,
        name: 'Research',
        oneTimeText: 'Counts as playing 2 science cards. Draw 2 cards.',
        tags: [Tag.SCIENCE, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        gainResource: [Resource.CARD, Resource.CARD]
    },
    {
        cost: 12,
        deck: Deck.CORPORATE,
        name: 'Gene Repair',
        oneTimeText: 'Requires 3 science tags. Increase your MC production 2 steps.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT]
    },
    {
        cost: 41,
        deck: Deck.CORPORATE,
        name: 'Io Mining Industries',
        oneTimeText:
            'Increase your titanium production 2 steps and your MC production 2 steps. 1 VP per Jovian tag you have.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        increaseProduction: [
            Resource.TITANIUM,
            Resource.TITANIUM,
            Resource.MEGACREDIT,
            Resource.MEGACREDIT
        ]
    },
    {
        cost: 10,
        deck: Deck.BASIC,
        name: 'Bushes',
        oneTimeText:
            'Requires -10°C or warmer. Increase your plant production 2 steps. Gain 2 plants.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -10
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.PLANT, Resource.PLANT],
        gainResource: [Resource.PLANT, Resource.PLANT]
    },
    {
        actionOrEffectText: 'Effect: When you play a space card, you pay 2 MC less for it.',
        cost: 8,
        deck: Deck.CORPORATE,
        name: 'Mass Converter',
        oneTimeText: 'Requires 5 science tags. Increase your energy production 6 steps.',
        requiredTags: {[Tag.SCIENCE]: 5},
        tags: [Tag.POWER, Tag.SCIENCE],
        type: CardType.ACTIVE,
        increaseProduction: Array(6).fill(Resource.ENERGY)
    },
    {
        actionOrEffectText: 'Action: Spend 6 energy to add a science resource to this card.',
        cost: 12,
        deck: Deck.CORPORATE,
        storedResourceType: Resource.SCIENCE,
        name: 'Physics Complex',
        oneTimeText: '2 VP for each science resource on this card.',
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.ACTIVE,
        get victoryPoints() {
            return this.resources.length * 2;
        }
    },
    {
        cost: 6,
        deck: Deck.BASIC,
        name: 'Greenhouses',
        oneTimeText: 'Gain 1 plant for each city tile in play.',
        tags: [Tag.BUILDING, Tag.PLANT],
        type: CardType.AUTOMATED,
        get gainResource() {
            if (!this.state) return [];
            return this.state.tiles
                .filter(tile => tile.type === TileType.CITY)
                .fill(Resource.PLANT);
        }
    },
    {
        cost: 10,
        deck: Deck.BASIC,
        name: 'Nuclear Zone',
        oneTimeText: 'Place [the nuclear zone] tile and raise the temperature 2 steps.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED,
        victoryPoints: -2,
        increaseParameter: [Parameter.TEMPERATURE, Parameter.TEMPERATURE]
    },
    {
        cost: 13,
        deck: Deck.CORPORATE,
        name: 'Tropical Resort',
        oneTimeText:
            'Decrease your heat production 2 steps and increase your MC production 3 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        decreaseProduction: [Resource.HEAT, Resource.HEAT],
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT, Resource.MEGACREDIT]
    },
    {
        cost: 12,
        deck: Deck.CORPORATE,
        name: 'Toll Station',
        oneTimeText: 'Increase your MC production 1 step for each space tag your OPPONENTS have.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED,
        get increaseProduction() {
            if (!this.state) return [];

            return this.state.cards
                .filter(
                    card =>
                        !this.state.players[this.state.common.currentPlayerIndex].cards.includes(
                            card
                        )
                )
                .filter(card => card.tags.includes(Tag.SPACE))
                .fill(Resource.MEGACREDIT);
        }
    },
    {
        cost: 1,
        deck: Deck.BASIC,
        name: 'Fueled Generators',
        oneTimeText:
            'Decrease your MC production 1 step and increase your energy production 1 step.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.MEGACREDIT],
        increaseProduction: [Resource.ENERGY]
    },
    {
        actionOrEffectText: 'Action: Spend 4 energy to gain 1 steel and increase oxygen 1 step.',
        cost: 11,
        deck: Deck.BASIC,
        name: 'Ironworks',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Power Grid',
        oneTimeText:
            'Increase your energy production 1 step for each power tag you have, including this.)',
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        get increaseProduction() {
            if (!this.state) return [];
            return this.state.tags.filter(tag => tag === Tag.POWER).fill(Resource.ENERGY);
        }
    },
    {
        actionOrEffectText: 'Action: Spend 4 energy to gain 2 steel and increase oxygen 1 step.',
        cost: 15,
        deck: Deck.BASIC,
        name: 'Steelworks',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText: 'Action: Spend 4 energy to gain 1 titanium and increase oxygen 1 step.',
        cost: 13,
        deck: Deck.BASIC,
        name: 'Ore Processor',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText: 'Effect: When you play an Earth tag, you pay 3 MC less for it.',
        cost: 1,
        deck: Deck.CORPORATE,
        name: 'Earth Office',
        tags: [Tag.EARTH],
        type: CardType.ACTIVE
    },
    {
        cost: 10,
        deck: Deck.CORPORATE,
        name: 'Acquired Company',
        oneTimeText: 'Increase your MC production 3 steps.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED
    },
    {
        cost: 8,
        deck: Deck.CORPORATE,
        name: 'Media Archives',
        oneTimeText: 'Gain 1 MC for each event EVER PLAYED by all players',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED,
        get gainResource() {
            if (!this.state) return [];

            return this.state.cards
                .filter(card => card.type === CardType.EVENT)
                .fill(Resource.MEGACREDIT);
        }
    },
    {
        cost: 23,
        deck: Deck.BASIC,
        name: 'Open City',
        oneTimeText:
            'Requires 12% oxygen. Decrease your energy production 1 step and increase your MC production 4 steps. Gain 2 plants and place a city tile.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 12
        },
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: Array(4).fill(Resource.ENERGY)
    },
    {
        actionOrEffectText: 'Effect: After you play an event card, you gain 3MC',
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Media Group',
        tags: [Tag.EARTH],
        type: CardType.ACTIVE,
        condition: condition =>
            condition.card && condition.card.type === CardType.EVENT ? true : false,
        effect: effect => effect.gainResource(Resource.MEGACREDIT, 3)
    },
    {
        actionOrEffectText: 'Action: Look at the top card and either buy it or discard it',
        cost: 4,
        deck: Deck.CORPORATE,
        name: 'Business Network',
        oneTimeText: 'Decrease your MC production 1 step.',
        tags: [Tag.EARTH],
        type: CardType.ACTIVE,
        decreaseProduction: [Resource.MEGACREDIT]
    },
    {
        cost: 7,
        deck: Deck.CORPORATE,
        name: 'Business Contacts',
        oneTimeText:
            'Look at the top 4 cards from the deck. Take 2 of them into hand and discard the other 2',
        tags: [Tag.EARTH, Tag.EVENT],
        type: CardType.EVENT
    },
    {
        increaseTerraformRating: 2,
        cost: 7,
        deck: Deck.CORPORATE,
        name: 'Bribed Committee',
        oneTimeText: 'Raise your terraform rating 2 steps.',
        tags: [Tag.EARTH, Tag.EVENT],
        type: CardType.EVENT,
        victoryPoints: -2,
        increaseParameter: [Parameter.TERRAFORM_RATING, Parameter.TERRAFORM_RATING]
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Solar Power',
        oneTimeText: 'Increase your energy production 1 step.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [Resource.ENERGY]
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Breathing Filters',
        oneTimeText: 'Requires 7% oxygen.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 7
        },
        tags: [Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Artificial Photosynthesis',
        oneTimeText: 'Increase your plant production 1 step or your energy production 2 steps.',
        tags: [Tag.SCIENCE],
        type: CardType.AUTOMATED,
        increaseProductionOption: [[Resource.PLANT], [Resource.ENERGY, Resource.ENERGY]]
    },
    {
        cost: 15,
        deck: Deck.BASIC,
        name: 'Artificial Lake',
        oneTimeText:
            'Requires -6°C or warmer. Place 1 ocean tile ON AN AREA NOT RESERVED FOR OCEAN.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -6
        },
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        tilePlacements: [t(TileType.OCEAN, Location.NOT_RESERVED_FOR_OCEAN)]
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Geothermal Power',
        oneTimeText: 'Increase your energy production 2 steps.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.ENERGY, Resource.ENERGY]
    },
    {
        cost: 16,
        deck: Deck.BASIC,
        name: 'Farming',
        oneTimeText:
            'Requires +4°C or warmer. Increase your MC production 2 steps and your plant production 2 steps. Gain 2 plants.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 4
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: [
            Resource.MEGACREDIT,
            Resource.MEGACREDIT,
            Resource.PLANT,
            Resource.PLANT
        ],
        gainResource: [Resource.PLANT, Resource.PLANT]
    },
    {
        cost: 2,
        deck: Deck.BASIC,
        name: 'Dust Seals',
        oneTimeText: 'Requires 3 or less ocean tiles.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            max: 3
        },
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 10,
        deck: Deck.BASIC,
        name: 'Urbanized Area',
        oneTimeText:
            'Decrease your energy production 1 step and increase your MC production 2 steps. Place a city tile ADJACENT TO AT LEAST 2 OTHER CITY TILES.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.CITY, Location.DOUBLE_CITY_ADJACENT)]
    },
    {
        cost: 1,
        deck: Deck.CORPORATE,
        name: 'Sabotage',
        oneTimeText: 'Remove up to 3 titanium from any player, or 4 steel, or 7 MC.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        removeAnyResource: [Resource.TITANIUM, Resource.TITANIUM, Resource.TITANIUM]
    },
    {
        cost: 4,
        deck: Deck.BASIC,
        name: 'Moss',
        oneTimeText:
            'Requires 3 ocean tiles and that you lose 1 plant. Increase your plant production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 3
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        removeResources: [Resource.PLANT]
    },
    {
        actionOrEffectText: 'Action: Spend 7 MC to increase your steel production 1 step.',
        cost: 4,
        deck: Deck.CORPORATE,
        name: 'Industrial Center',
        oneTimeText: 'Place [the Industrial Center] tile ADJACENT TO A CITY TILE.',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE,
        tilePlacements: [t(TileType.INDUSTRIAL_CENTER, Location.CITY_ADJACENT)]
    },
    {
        cost: 1,
        deck: Deck.CORPORATE,
        name: 'Hired Raiders',
        oneTimeText: 'Steal up to 2 steel, or 3MC from any player.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        removeAnyResourceOption: [
            [Resource.STEEL, Resource.STEEL],
            [Resource.MEGACREDIT, Resource.MEGACREDIT]
        ]
    },
    {
        cost: 3,
        deck: Deck.CORPORATE,
        name: 'Hackers',
        oneTimeText:
            'Decrease your energy production 1 step and any MC production 2 steps. Increase your MC production 2 steps.',
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: -1,
        decreaseProduction: [Resource.ENERGY],
        decreaseAnyProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT],
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT]
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'GHG Factories',
        oneTimeText:
            'Decrease your energy production 1 step and increase your heat production 4 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: [Resource.HEAT, Resource.HEAT, Resource.HEAT, Resource.HEAT]
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Subterranean Reservoir',
        oneTimeText: 'Place 1 ocean tile.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.OCEAN)]
    },
    {
        actionOrEffectText:
            'Effect: When you play an animal or a plant tag (including these 2), add an animal to this card.',
        cost: 12,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Ecological Zone',
        oneTimeText:
            'Requires that you have a greenery tile. Place [the Ecological Zone] tile ADJACENT TO ANY GREENERY TILE. 1 VP per 2 animals on this card.',
        tags: [Tag.ANIMAL, Tag.PLANT],
        type: CardType.ACTIVE,
        condition: condition =>
            !!condition.tag && [Tag.ANIMAL, Tag.PLANT].includes(condition.tag) ? true : false,
        effect(effect) {
            effect.gainResource(Resource.ANIMAL, 1, this);
        },
        tilePlacements: [t(TileType.ECOLOGICAL_ZONE, Location.GREENERY_ADJACENT)]
    },
    {
        cost: 13,
        deck: Deck.BASIC,
        name: 'Zeppelins',
        oneTimeText:
            'Requires 5% oxygen. Increase your MC production 1 step for each city tile ON MARS.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 5
        },
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        get increaseProduction() {
            if (!this.state) return [];

            return this.state.tiles
                .filter(tile => tile.type === TileType.CITY && tile.cell.onMars)
                .fill(Resource.MEGACREDIT);
        }
    },
    {
        cost: 8,
        deck: Deck.BASIC,
        name: 'Worms',
        oneTimeText:
            'Requires 4% oxygen. Increase your plant production 1 step for every 2 microbe tags you have, including this.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 4
        },
        tags: [Tag.MICROBE],
        type: CardType.AUTOMATED,
        get increaseProduction() {
            if (!this.state) return [];
            const numMicrobeTags = this.state.tags.filter(tag => tag === Tag.MICROBE).length;

            return Array(Math.floor(numMicrobeTags / 2)).fill(Resource.PLANT);
        }
    },
    {
        actionOrEffectText:
            'Effect: When you play an animal, plant, or microbe tag, including this, add a microbe to this card.',
        cost: 5,
        deck: Deck.BASIC,
        storedResourceType: Resource.MICROBE,
        name: 'Decomposers',
        oneTimeText: 'Requires 3% oxygen. 1 VP per 3 microbes on this card.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 3
        },
        tags: [Tag.MICROBE],
        type: CardType.ACTIVE,
        condition: condition =>
            condition.tag && [Tag.ANIMAL, Tag.PLANT, Tag.MICROBE].includes(condition.tag)
                ? true
                : false,
        effect(effect) {
            effect.gainResource(Resource.MICROBE, 1, this);
        },
        get victoryPoints() {
            return Math.floor(this.resources / 3);
        }
    },
    {
        cost: 14,
        deck: Deck.BASIC,
        name: 'Fusion Power',
        oneTimeText: 'Requires 2 power tags. Increase your energy production 3 steps.',
        requiredTags: {[Tag.POWER]: 2},
        tags: [Tag.BUILDING, Tag.POWER, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.ENERGY, Resource.ENERGY, Resource.ENERGY]
    },
    {
        actionOrEffectText: 'Action: Add a microbe to ANOTHER card.',
        cost: 4,
        deck: Deck.BASIC,
        name: 'Symbiotic Fungus',
        oneTimeText: 'Requires -14°C or warmer.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -14
        },
        tags: [Tag.MICROBE],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText: 'Action: Gain 1 plant or add 2 microbes to ANOTHER card.',
        cost: 13,
        deck: Deck.BASIC,
        name: 'Extreme-Cold Fungus',
        oneTimeText: 'It must be -10°C or colder.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            max: -10
        },
        tags: [Tag.MICROBE],
        type: CardType.ACTIVE
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Advanced Ecosystems',
        oneTimeText: 'Requires a plant tag, a microbe tag, and an animal tag.',
        requiredTags: {[Tag.PLANT]: 1, [Tag.MICROBE]: 1, [Tag.ANIMAL]: 1},
        tags: [Tag.ANIMAL, Tag.MICROBE, Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 3
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Great Dam',
        oneTimeText: 'Requires 4 ocean tiles. Increase your energy production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 4
        },
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [Resource.ENERGY, Resource.ENERGY]
    },
    {
        cost: 8,
        deck: Deck.CORPORATE,
        name: 'Cartel',
        oneTimeText:
            'Increase your MC production 1 step for each Earth tag you have, including this.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED
        // get increaseProduction() {
        //     return [];
        //     // return this.tags.filter(tag => tag === Tag.EARTH).fill(Resource.MEGACREDIT);
        // }
    },
    {
        cost: 25,
        deck: Deck.BASIC,
        name: 'Strip Mine',
        oneTimeText:
            'Decrease your energy production 2 steps. Increase your steel production 2 steps and your titanium production 1 step. Raise oxygen 2 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        increaseParameter: [Parameter.OXYGEN, Parameter.OXYGEN],
        increaseProduction: [Resource.STEEL, Resource.STEEL, Resource.TITANIUM],
        decreaseProduction: [Resource.ENERGY, Resource.ENERGY]
    },
    {
        cost: 8,
        deck: Deck.BASIC,
        name: 'Wave Power',
        oneTimeText: 'Requires 3 ocean tiles. Increase your energy production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 3
        },
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [Resource.ENERGY]
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Lava Flows',
        oneTimeText:
            'Raise the temperature 2 steps and place this [the Lava Flow] tile ON EITHER THARSIS THOLUS, ASCRAEUS MONS, PAVONIS MONS OR ARSIA MONS.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        increaseParameter: [Parameter.TEMPERATURE, Parameter.TEMPERATURE],
        tilePlacements: [t(TileType.LAVA_FLOW, Location.VOLCANIC)]
    },
    {
        cost: 4,
        deck: Deck.BASIC,
        name: 'Power Plant',
        oneTimeText: 'Increase your energy production 1 step.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.ENERGY]
    },
    {
        cost: 20,
        deck: Deck.BASIC,
        name: 'Mohole Area',
        oneTimeText:
            'Increase your heat production 4 steps. Place [the Mohole Area] tile ON AN AREA RESERVED FOR OCEAN.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.MOHOLE_AREA, Location.RESERVED_FOR_OCEAN)]
    },
    {
        cost: 36,
        deck: Deck.BASIC,
        name: 'Large Convoy',
        oneTimeText:
            'Place an ocean tile and draw 2 cards. Gain 5 plants, or add 4 animals to ANOTHER card.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        victoryPoints: 2,
        tilePlacements: [t(TileType.OCEAN)],
        gainResource: [Resource.CARD, Resource.CARD],
        gainResourceOption: [Array(5).fill(Resource.PLANT), Array(4).fill(Resource.ANIMAL)]
    },
    {
        cost: 7,
        deck: Deck.CORPORATE,
        name: 'Titanium Mine',
        oneTimeText: 'Increase your titanium production 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.TITANIUM]
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Tectonic Stress Power',
        oneTimeText: 'Requires 2 science tags. Increase your energy production 3 steps.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [Resource.ENERGY, Resource.ENERGY, Resource.ENERGY]
    },
    {
        cost: 8,
        deck: Deck.BASIC,
        name: 'Nitrophilic Moss',
        oneTimeText:
            'Requires 3 ocean tiles and that you lose 2 plants. Increase your plant production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 3
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        removeResources: [Resource.PLANT, Resource.PLANT],
        increaseProduction: [Resource.PLANT, Resource.PLANT]
    },
    {
        actionOrEffectText: 'Effect: When you place a greenery tile, add an animal to this card.',
        cost: 12,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Herbivores',
        oneTimeText:
            'Requires 8% oxygen. Add 1 animal to this card. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 8
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        condition: condition => condition.tileType === TileType.GREENERY,
        effect(effect) {
            effect.gainResource(Resource.ANIMAL, 1, this);
        },
        get victoryPoints() {
            return Math.floor(this.resources.length / 2);
        }
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Insects',
        oneTimeText:
            'Requires 6% oxygen. Increase your plant production 1 step for each plant tag you have.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 6
        },
        tags: [Tag.MICROBE],
        type: CardType.AUTOMATED,
        get increaseProduction() {
            if (!this.state) return [];

            return this.state.tags.filter(tag => tag === Tag.PLANT).fill(Resource.PLANT);
        }
    },
    {
        cost: 1,
        deck: Deck.CORPORATE,
        name: "CEO's Favourite Project",
        oneTimeText: 'Add 1 resource to a card with at least 1 resource on it.',
        tags: [Tag.EVENT],
        type: CardType.EVENT
    },
    {
        actionOrEffectText: 'Effect: when you play a card, you pay 2 MC less for it.',
        cost: 14,
        deck: Deck.CORPORATE,
        name: 'Anti-Gravity Technology',
        oneTimeText: 'Requires 7 science tags.',
        requiredTags: {[Tag.SCIENCE]: 7},
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 3
    },
    {
        cost: 3,
        deck: Deck.CORPORATE,
        name: 'Investment Loan',
        oneTimeText: 'Decrease your MC production 1 step. Gain 10 MC.',
        tags: [Tag.EARTH, Tag.EVENT],
        type: CardType.EVENT,
        decreaseProduction: [Resource.MEGACREDIT],
        gainResource: Array(10).fill(Resource.MEGACREDIT)
    },
    {
        cost: 2,
        deck: Deck.BASIC,
        name: 'Insulation',
        oneTimeText:
            'Decrease your heat production any number of steps and increase your MC production the same number of steps.',
        tags: [],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText:
            'Effect: Your global requirements are +2 or -2 steps, your choice in each case.',
        cost: 12,
        deck: Deck.BASIC,
        name: 'Adaptation Technology',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        actionOrEffectText: 'Action: Spend 8 heat to increase your terraforming rating 1 step.',
        cost: 3,
        deck: Deck.CORPORATE,
        name: 'Caretaker Contract',
        oneTimeText: 'Requires 0°C or warmer.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 0
        },
        tags: [],
        type: CardType.ACTIVE
    },
    {
        cost: 16,
        deck: Deck.BASIC,
        name: 'Designed Microorganisms',
        oneTimeText: 'It must be -14°C or colder. Increase your plant production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            max: -14
        },
        tags: [Tag.MICROBE, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.PLANT, Resource.PLANT]
    },
    {
        actionOrEffectText:
            'Effect: After you pay for a standard project, except selling patents, you gain 3 MC.',
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Standard Technology',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        condition: condition => condition.actionType === ActionType.STANDARD_PROJECT,
        effect: effect => effect.gainResource(Resource.MEGACREDIT, 3)
    },
    {
        actionOrEffectText:
            'Action: Add 1 microbe to this card, or remove 3 microbes to increase your TR 1 step.',
        cost: 11,
        deck: Deck.BASIC,
        storedResourceType: Resource.MICROBE,
        name: 'Nitrite Reducing Bacteria',
        oneTimeText: 'Add 3 microbes to this card.',
        tags: [Tag.MICROBE],
        type: CardType.ACTIVE
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Industrial Microbes',
        oneTimeText: 'Increase your energy production and your steel production 1 step each.',
        tags: [Tag.BUILDING, Tag.MICROBE],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.ENERGY, Resource.STEEL]
    },
    {
        cost: 7,
        deck: Deck.BASIC,
        name: 'Lichen',
        oneTimeText: 'Requires -24°C or warmer. Increase your plant production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -24
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.PLANT]
    },
    {
        cost: 5,
        deck: Deck.CORPORATE,
        name: 'Power Supply Consortium',
        oneTimeText:
            'Requires 2 power tags. Decrease any energy production 1 step and increase your own 1 step.',
        requiredTags: {[Tag.POWER]: 2},
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        decreaseAnyProduction: [Resource.ENERGY],
        increaseProduction: [Resource.ENERGY]
    },
    {
        cost: 15,
        deck: Deck.BASIC,
        name: 'Convoy From Europa',
        oneTimeText: 'Place 1 ocean tile and draw 1 card.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.OCEAN)],
        gainResource: [Resource.CARD]
    },
    {
        cost: 7,
        deck: Deck.BASIC,
        name: 'Imported GHG',
        oneTimeText: 'Increase your heat production 1 step and gain 3 heat.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseProduction: [Resource.HEAT],
        gainResource: [Resource.HEAT, Resource.HEAT, Resource.HEAT]
    },
    {
        increaseTerraformRating: 1,
        cost: 23,
        deck: Deck.BASIC,
        name: 'Imported Nitrogen',
        oneTimeText:
            'Raise your TR 1 step and gain 4 plants. Add 3 microbes to ANOTHER card and 2 animals to ANOTHER card.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: [Parameter.TERRAFORM_RATING],
        gainResource: [
            ...Array(4).fill(Resource.PLANT),
            ...Array(3).fill(Resource.MICROBE),
            ...Array(2).fill(Resource.ANIMAL)
        ]
    },
    {
        cost: 3,
        deck: Deck.BASIC,
        name: 'Micro-Mills',
        oneTimeText: 'Increase your heat production 1 step.',
        tags: [],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.HEAT]
    },
    {
        increaseTerraformRating: 3,
        cost: 20,
        deck: Deck.BASIC,
        name: 'Magnetic Field Generators',
        oneTimeText:
            'Decrease your energy production 4 steps and increase your plant production 2 steps. Raise your TR 3 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: Array(4).fill(Resource.ENERGY),
        increaseProduction: [Resource.PLANT, Resource.PLANT],
        increaseParameter: Array(3).fill(Parameter.TERRAFORM_RATING)
    },
    {
        actionOrEffectText: 'Effect: When you play a space card, you pay 2MC less for it.',
        cost: 10,
        deck: Deck.BASIC,
        name: 'Shuttles',
        oneTimeText:
            'Requires 5% oxygen. Decrease your energy production 1 step and increase your MC production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 5
        },
        tags: [Tag.SPACE],
        type: CardType.ACTIVE,
        victoryPoints: 1,
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT]
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Import of Advanced GHG',
        oneTimeText: 'Increase your heat production 2 steps.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseProduction: [Resource.HEAT, Resource.HEAT]
    },
    {
        cost: 6,
        deck: Deck.BASIC,
        name: 'Windmills',
        oneTimeText: 'Requires 7% oxygen. Increase your energy production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 7
        },
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [Resource.ENERGY]
    },
    {
        cost: 16,
        deck: Deck.BASIC,
        name: 'Tundra Farming',
        oneTimeText:
            'Requires -6°C or warmer. Increase your plant production 1 step and your MC production 2 steps. Gain 1 plant.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -6
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: [Resource.PLANT, Resource.MEGACREDIT, Resource.MEGACREDIT],
        gainResource: [Resource.PLANT]
    },
    {
        cost: 26,
        deck: Deck.BASIC,
        name: 'Aerobraked Ammonia Asteroid',
        oneTimeText:
            'Add 2 microbes to ANOTHER card. Increase your heat production 3 steps and your plant production 1 step.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        gainResource: [Resource.MICROBE, Resource.MICROBE],
        increaseProduction: [...Array(3).fill(Resource.HEAT), Resource.PLANT]
    },
    {
        increaseTerraformRating: 1,
        cost: 5,
        deck: Deck.BASIC,
        name: 'Magnetic Field Dome',
        oneTimeText:
            'Decrease your energy production 2 steps and increase your plant production 1 step. Raise your terraform rating 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.ENERGY, Resource.ENERGY],
        increaseProduction: [Resource.PLANT],
        increaseParameter: [Parameter.TERRAFORM_RATING]
    },
    {
        actionOrEffectText:
            'Effect: When any city tile is placed, add an animal to this card.\nAnimals may not be removed from this card.',
        cost: 10,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Pets',
        oneTimeText: 'Add 1 animal to this card. 1 VP per 2 animals here.',
        tags: [Tag.ANIMAL, Tag.EARTH],
        type: CardType.ACTIVE,
        condition: condition => condition.tileType === TileType.CITY,
        effect(effect) {
            effect.gainResource(Resource.ANIMAL, 1, this);
        }
    },
    {
        actionOrEffectText: '[Effect: ]Opponents may not remove your [plants, animals or microbes]',
        cost: 5,
        deck: Deck.CORPORATE,
        name: 'Protected Habitats',
        tags: [],
        type: CardType.ACTIVE
    },
    {
        cost: 23,
        deck: Deck.BASIC,
        name: 'Protected Valley',
        oneTimeText:
            'Increase your MC production 2 steps. Place a greenery tile ON AN AREA RESERVED FOR OCEAN, disregarding normal placement restrictions, and increase oxygen 1 step.',
        tags: [Tag.BUILDING, Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT],
        tilePlacements: [t(TileType.GREENERY, Location.RESERVED_FOR_OCEAN)]
    },
    {
        cost: 10,
        deck: Deck.CORPORATE,
        name: 'Satellites',
        oneTimeText:
            'Increase your MC production 1 step for each space tag you have, including this one.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED,
        get increaseProduction() {
            if (!this.state) return [];
            return this.state.tags.filter(tag => tag === Tag.SPACE).fill(Resource.MEGACREDIT);
        }
    },
    {
        cost: 10,
        deck: Deck.BASIC,
        name: 'Noctis Farming',
        oneTimeText:
            'Requires -20°C or warmer. Increase your MC production 1 step and gain 2 plants.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -20
        },
        tags: [Tag.BUILDING, Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: [Resource.MEGACREDIT],
        gainResource: [Resource.PLANT, Resource.PLANT]
    },
    {
        actionOrEffectText: 'Action: Spend 3 energy to raise oxygen 1 step.',
        cost: 12,
        deck: Deck.BASIC,
        name: 'Water Splitting Plant',
        oneTimeText: 'Requires 2 ocean tiles.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 2
        },
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
    },
    {
        cost: 6,
        deck: Deck.BASIC,
        name: 'Heat Trappers',
        oneTimeText:
            'Decrease any heat production 2 steps and increase your energy production 1 step.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: -1,
        decreaseAnyProduction: [Resource.HEAT, Resource.HEAT],
        increaseProduction: [Resource.ENERGY]
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Soil Factory',
        oneTimeText:
            'Decrease your energy production 1 step and increase your plant production 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: [Resource.PLANT]
    },
    {
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Fuel Factory',
        oneTimeText:
            'Decreases your energy production 1 step and increase your titanium and your MC production 1 step each.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: [Resource.TITANIUM, Resource.MEGACREDIT]
    },
    {
        cost: 5,
        deck: Deck.BASIC,
        name: 'Ice cap Melting',
        oneTimeText: 'Requires +2°C or warmer. Place 1 ocean tile.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 2
        },
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.OCEAN)]
    },
    {
        cost: 11,
        deck: Deck.CORPORATE,
        name: 'CORPORATE Stronghold',
        oneTimeText:
            'Decrease your energy production 1 step and increase your MC production 3 steps. Place a city tile.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        victoryPoints: -2,
        decreaseProduction: [Resource.ENERGY],
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT, Resource.MEGACREDIT],
        tilePlacements: [t(TileType.CITY)]
    },
    {
        cost: 4,
        deck: Deck.BASIC,
        name: 'Biomass Combustors',
        oneTimeText:
            'Requires 6% oxygen. Decrease any plant production 1 step and increase your energy production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 6
        },
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: -1,
        decreaseAnyProduction: [Resource.PLANT],
        increaseProduction: [Resource.ENERGY, Resource.ENERGY]
    },
    {
        actionOrEffectText: 'Action: Add 1 animal to this card.',
        cost: 13,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Livestock',
        oneTimeText:
            'Requires 9% oxygen. Decrease your plant production 1 step and increase your MC production 2 steps. 1 VP for each animal on this card.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 9
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        decreaseProduction: [Resource.PLANT],
        increaseProduction: [Resource.MEGACREDIT, Resource.MEGACREDIT],
        get victoryPoints() {
            return this.resources.length;
        }
    },
    {
        actionOrEffectText:
            'Effect: When you play a science tag, including this, either add a science resource to this card, or remove a science resource from this card to draw a card.',
        cost: 10,
        deck: Deck.CORPORATE,
        storedResourceType: Resource.SCIENCE,
        name: 'Olympus Conference',
        tags: [Tag.BUILDING, Tag.EARTH, Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 1,
        condition: condition => condition.tag === Tag.SCIENCE,
        effect: effect =>
            effect.addOrRemoveOneResource(Resource.SCIENCE, () => {
                effect.drawCard();
            })
    },
    {
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Rad-Suits',
        oneTimeText: 'Requires 2 cities in play. Increase your MC production 1 step.',
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        // canBePlayed: requirement =>
        //     requirement.tiles.filter(tile => tile.type === TileType.CITY).length > 2,
        // requirementFailedMessage: 'There must be two cities in play',
        increaseProduction: [Resource.MEGACREDIT]
    },
    {
        actionOrEffectText:
            'Action: Spend 8 MC to place 1 ocean tile. STEEL MAY BE USED as if you were playing a building card.',
        cost: 18,
        deck: Deck.BASIC,
        name: 'Aquifer Pumping',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
    },
    {
        cost: 7,
        deck: Deck.BASIC,
        name: 'Flooding',
        oneTimeText:
            'Place an ocean tile. IF THERE ARE TILES ADJACENT TO THIS OCEAN TILE, YOU MAY REMOVE 4 MC FROM THE OWNER OF ONE OF THOSE TILES.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        victoryPoints: -1
    },
    {
        cost: 15,
        deck: Deck.BASIC,
        name: 'Energy Saving',
        oneTimeText: 'Increase your energy production 1 step for each city tile in play.',
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        get increaseProduction() {
            if (!this.state) return [];
            return this.state.tiles
                .filter(tile => tile.type === TileType.CITY)
                .fill(Resource.MEGACREDIT);
        }
    },
    {
        cost: 1,
        deck: Deck.BASIC,
        name: 'Local Heat Trapping',
        oneTimeText: 'Spend 5 heat to either gain 4 plants, or to add 2 animals to ANOTHER card.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        removeResources: Array(5).fill(Resource.HEAT),
        gainResourceOption: [Array(4).fill(Resource.PLANT), Array(2).fill(Resource.ANIMAL)]
    },
    {
        cost: 8,
        deck: Deck.BASIC,
        name: 'Permafrost extraction',
        oneTimeText: 'Requires -8°C or warmer. Place 1 ocean tile.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -8
        },
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.OCEAN)]
    },
    {
        cost: 2,
        deck: Deck.CORPORATE,
        name: 'Invention Contest',
        oneTimeText:
            'Look at the top 3 cards from the deck. Take 1 of them into hand and discard the other 2',
        tags: [Tag.EVENT, Tag.SCIENCE],
        type: CardType.EVENT
    },
    {
        cost: 15,
        deck: Deck.BASIC,
        name: 'Plantation',
        oneTimeText: 'Requires 2 science tags. Place a greenery tile and raise oxygen 1 step.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.GREENERY)]
    },
    {
        actionOrEffectText: 'Action: Spend any amount of energy to gain that amount of MC.',
        cost: 4,
        deck: Deck.CORPORATE,
        name: 'Power Infrastructure',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.ACTIVE
    },
    {
        cost: 0,
        deck: Deck.CORPORATE,
        name: 'Indentured Workers',
        oneTimeText: 'The next card you play this generation costs 8MC less.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        victoryPoints: -1
    },
    {
        cost: 9,
        deck: Deck.CORPORATE,
        name: 'Lagrange Observatory',
        oneTimeText: 'Draw 1 card.',
        tags: [Tag.SCIENCE, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        gainResource: [Resource.CARD]
    },
    {
        cost: 33,
        deck: Deck.CORPORATE,
        name: 'Terraforming Ganymede',
        oneTimeText: 'Raise your TR 1 step for each Jovian tag you have, including this.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        get increaseParameter() {
            if (!this.state) return [];
            return this.state.tags
                .filter(tag => tag === Tag.JOVIAN)
                .fill(Parameter.TERRAFORM_RATING);
        }
    },
    {
        cost: 31,
        deck: Deck.BASIC,
        name: 'Immigration Shuttles',
        oneTimeText: 'Increase your MC production 5 steps. 1 VP for every 3rd city in play.',
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.AUTOMATED,
        increaseProduction: Array(5).fill(Resource.MEGACREDIT),
        get victoryPoints() {
            if (!this.state) return 0;
            const cities = this.state.tile.filter(tile => tile.type === TileType.CITY);

            return Math.floor(cities.length / 3);
        }
    },
    {
        actionOrEffectText: 'Action: Spend 2MC to draw a card.',
        cost: 11,
        deck: Deck.CORPORATE,
        name: 'Restricted Area',
        oneTimeText: 'Place [the restricted area] tile.',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        tilePlacements: [t(TileType.RESTRICTED_AREA)]
    },
    {
        actionOrEffectText:
            'Effect: Each time a city tile is placed, including this, increase your MC production 1 step.',
        cost: 13,
        deck: Deck.BASIC,
        name: 'Immigrant City',
        oneTimeText:
            'Decrease your energy production 1 step and decrease your MC production 2 steps. Place a city tile.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.ACTIVE,
        condition: condition => condition.tileType === TileType.CITY,
        effect: effect => effect.increaseProduction(Resource.MEGACREDIT, 1),
        decreaseProduction: [Resource.ENERGY, Resource.MEGACREDIT, Resource.MEGACREDIT],
        tilePlacements: [t(TileType.CITY)]
    },
    {
        cost: 3,
        deck: Deck.CORPORATE,
        name: 'Energy Tapping',
        oneTimeText: 'Decrease any energy production 1 step and increase your own 1 step.',
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: -1,
        decreaseAnyProduction: [Resource.ENERGY],
        increaseProduction: [Resource.ENERGY]
    },
    {
        actionOrEffectText: 'Action: Spend 10 MC to increase your heat production 2 steps.',
        cost: 6,
        deck: Deck.BASIC,
        name: 'Underground Detonations',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
    },
    {
        cost: 35,
        deck: Deck.BASIC,
        name: 'Soletta',
        oneTimeText: 'Increase your heat production 7 steps.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED,
        increaseProduction: Array(7).fill(Resource.HEAT)
    },
    {
        cost: 5,
        deck: Deck.CORPORATE,
        name: 'Technology Demonstration',
        oneTimeText: 'Draw 2 cards.',
        tags: [Tag.EVENT, Tag.SCIENCE, Tag.SPACE],
        type: CardType.EVENT,
        gainResource: [Resource.CARD, Resource.CARD]
    },
    {
        increaseTerraformRating: 2,
        cost: 8,
        deck: Deck.BASIC,
        name: 'Rad-Chem Factory',
        oneTimeText: 'Decrease your energy production 1 step. Raise your terraform rating 2 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: [Resource.ENERGY],
        increaseParameter: [Parameter.TERRAFORM_RATING, Parameter.TERRAFORM_RATING]
    },
    {
        cost: 4,
        deck: Deck.BASIC,
        name: 'Special Design',
        oneTimeText:
            'The next card you play this generation is +2 or -2 in global requirements, your choice.',
        tags: [Tag.EVENT, Tag.SCIENCE],
        type: CardType.EVENT
    },
    {
        cost: 13,
        deck: Deck.CORPORATE,
        name: 'Medical Lab',
        oneTimeText:
            'Increase your MC production 1 step for every 2 building tags you have, including this.',
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        get increaseProduction() {
            if (!this.state) return [];

            const buildingTags = this.state.tags(tag => tag === Tag.BUILDING);

            const half = Math.floor(buildingTags.length / 2);

            return Array(half).fill(Resource.MEGACREDIT);
        }
    },
    {
        actionOrEffectText: 'Action: Draw 2 cards.',
        cost: 21,
        deck: Deck.CORPORATE,
        name: 'AI Central',
        oneTimeText: 'Requires 3 science tags to play. Decrease your energy production 1 step.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 1,
        decreaseProduction: [Resource.ENERGY]
    },
    {
        cost: 10,
        deck: Deck.PROMO,
        name: 'Small Asteroid',
        oneTimeText:
            'Terraforming Mars PROMO. Increase temperature 1 step. Remove up to 2 plants from any player.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        actionOrEffectText:
            'Action: Reveal and place a SPACE OR BUILDING card here from hand, and place 2 resources on it, OR double the resources on a card here.\nEffect: Cards here may be played as if from hand with its cost reduced by the number of resources on it.',
        cost: 7,
        deck: Deck.PROMO,
        name: 'Self-Replicating Robots',
        oneTimeText: 'Requires 2 science tags.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [],
        type: CardType.ACTIVE
    },
    {
        cost: 12,
        deck: Deck.PROMO,
        name: 'Snow Algae',
        oneTimeText:
            'Requires 2 oceans. Increase your plant production and your heat production 1 step each.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 2
        },
        tags: [Tag.PLANT],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText: 'Action: Add 1 animal to this card.',
        cost: 7,
        deck: Deck.PROMO,
        storedResourceType: Resource.ANIMAL,
        name: 'Penguins',
        oneTimeText: 'Requires 8 Oceans. 1 VP per animal on this card.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 8
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText:
            'Action: Add 1 floater to ANY card, or spend 1 floater here to draw a card.',
        cost: 11,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Aerial Mappers',
        tags: [Tag.VENUS],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        cost: 7,
        deck: Deck.VENUS,
        name: 'Aerosport Tournament',
        requiredResources: [
            Resource.FLOATER,
            Resource.FLOATER,
            Resource.FLOATER,
            Resource.FLOATER,
            Resource.FLOATER
        ],
        oneTimeText: 'Requires that you have 5 floaters. Gain 1 MC for each city tile in play.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        victoryPoints: 1
    },
    {
        // venus: 1,
        // addsResourceToCards: Resource.FLOATER,
        cost: 13,
        deck: Deck.VENUS,
        name: 'Air-Scrapping Expedition',
        oneTimeText: 'Raise Venus 1 step. Add 3 floaters to ANY VENUS CARD.',
        tags: [Tag.EVENT, Tag.VENUS],
        type: CardType.EVENT
    },
    {
        cost: 10,
        deck: Deck.VENUS,
        name: 'Atalanta Planitia Lab',
        oneTimeText: 'Requires 3 science tags. Draw 2 cards.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.SCIENCE, Tag.VENUS],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        // addsResourceToCards: Resource.FLOATER,
        cost: 22,
        deck: Deck.VENUS,
        name: 'Atmoscoop',
        oneTimeText:
            'Requires 3 science tags. Either raise the temperature 2 steps, or raise Venus 2 steps. Add 2 floaters to ANY card.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        // venus: 1,
        cost: 11,
        deck: Deck.VENUS,
        name: 'Comet for Venus',
        oneTimeText:
            'Raise Venus 1 step. Remove up to 4 MC from a player WITH A VENUS TAG IN PLAY.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        cost: 8,
        deck: Deck.VENUS,
        name: 'Corroder Suits',
        oneTimeText: 'Increase your MC production 2 steps. Add 1 resource to ANY VENUS CARD.',
        tags: [Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        cost: 15,
        deck: Deck.VENUS,
        name: 'Dawn City',
        oneTimeText:
            'Requires 4 science tags. Decrease your energy production 1 step. Increase your titanium production 1 step. Place a city tile ON THE RESERVED AREA.',
        requiredTags: {[Tag.SCIENCE]: 4},
        tags: [Tag.CITY, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 3
    },
    {
        actionOrEffectText:
            'Action: Add 1 floater to this card, or spend 1 floater here to increase your energy production 1 step.',
        cost: 11,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Deuterium Export',
        tags: [Tag.POWER, Tag.SPACE, Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText:
            'Action: Add 1 floater to ANY card. Effect: When playing a Venus tag, floaters here may be used as payment, and are worth 3 MC each',
        cost: 11,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Dirigibles',
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText:
            'Action: Add 1 floater to this card, or remove 2 floaters here to raise Venus 1 step.',
        cost: 21,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Extractor Balloons',
        oneTimeText: 'Add 3 floaters to this card.',
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText: 'Action: Add 1 microbe to ANY card.',
        cost: 3,
        deck: Deck.VENUS,
        storedResourceType: Resource.MICROBE,
        name: 'Extremophiles',
        oneTimeText: 'Requires 2 science tags. 1 VP for per 3 microbes on this card.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [Tag.MICROBE, Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText: 'Action: Spend 2 MC to add 1 floater to ANY card.',
        cost: 5,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Floating Habs',
        oneTimeText: 'Requires 2 science tags. 1 VP per 2 floaters on this card.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText:
            'Action: Spend 2 MC to add a floater to this card, or spend 2 floaters here to increase Venus 1 step.',
        cost: 8,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Forced Precipitation',
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        cost: 14,
        deck: Deck.VENUS,
        name: 'Freyja Biodomes',
        oneTimeText:
            'Requires Venus 10%. Add 2 microbes or 2 animals TO ANOTHER VENUS CARD. Decrease your energy production 1 step, and increase your MC production by 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 10
        },
        tags: [Tag.PLANT, Tag.VENUS],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        // venus: 1,
        cost: 23,
        deck: Deck.VENUS,
        name: 'GHG Import from Venus',
        oneTimeText: 'Raise Venus 1 step. Increase your heat production 3 steps.',
        tags: [Tag.EVENT, Tag.SPACE, Tag.VENUS],
        type: CardType.EVENT
    },
    {
        // venus: 3,
        cost: 27,
        deck: Deck.VENUS,
        name: 'Giant Solar Shade',
        oneTimeText: 'Raise Venus 3 steps.',
        tags: [Tag.SPACE, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        cost: 20,
        deck: Deck.VENUS,
        name: 'Gyropolis',
        oneTimeText:
            'Decrease your energy production 2 steps. Increase your MC production 1  step for each Venus and Earth tag you have. Place a city tile.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED
    },
    {
        // venus: 1,
        // addsResourceToCards: Resource.FLOATER,
        cost: 11,
        deck: Deck.VENUS,
        name: 'Hydrogen to Venus',
        oneTimeText:
            'Raise Venus 1 step. Add 1 floater to A VENUS CARD for each Jovian tag you have.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        cost: 17,
        deck: Deck.VENUS,
        name: 'Io Sulphur Research',
        oneTimeText: 'Draw 1 card, or draw 3 cards if you have at least 3 Venus tags.',
        tags: [Tag.JOVIAN, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        cost: 5,
        deck: Deck.VENUS,
        name: 'Ishtar Mining',
        oneTimeText: 'Requires Venus 8%. Increase your titanium production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 8
        },
        tags: [Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText:
            'Action: Spend 1 titanium to add 2 floaters to this card, or remove 2 floaters here to raise Venus 1 step.',
        cost: 12,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Jet Stream Microscrappers',
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText:
            'Action: Add 1 floater to this card, or spend 1 floater here to raise your MC production 1 step.',
        cost: 4,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Local Shading',
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        cost: 21,
        deck: Deck.VENUS,
        name: 'Luna Metropolis',
        oneTimeText:
            'Increase your MC production 1 step for each Earth tag you have, including this. Place a city tile ON THE RESERVED AREA.',
        tags: [Tag.CITY, Tag.EARTH, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        cost: 8,
        deck: Deck.VENUS,
        name: 'Luxury Foods',
        oneTimeText: 'Requires Venus, Earth and Jovian tags.',
        requiredTags: {[Tag.VENUS]: 1, [Tag.EARTH]: 1, [Tag.JOVIAN]: 1},
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        actionOrEffectText: 'Action: Add 1 resource to ANOTHER VENUS CARD.',
        cost: 18,
        deck: Deck.VENUS,
        name: 'Maxwell Base',
        oneTimeText:
            'Requires Venus 12%. Decrease your energy production 1 step. Place a city tile ON THE RESERVED AREA.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 12
        },
        tags: [Tag.CITY, Tag.VENUS],
        type: CardType.ACTIVE,
        victoryPoints: 3
    },
    {
        cost: 5,
        deck: Deck.VENUS,
        name: 'Mining Quota',
        oneTimeText:
            'Requires Venus, Earth and Jovian tags. Increase your steel production 2 steps.',
        requiredTags: {[Tag.VENUS]: 1, [Tag.EARTH]: 1, [Tag.JOVIAN]: 1},
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED
    },
    {
        // venus: 1,
        cost: 7,
        deck: Deck.VENUS,
        name: 'Neutralizer Factory',
        oneTimeText: 'Requires Venus 10%. Increase Venus 1 step.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 10
        },
        tags: [Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        increaseTerraformRating: 2,
        cost: 11,
        deck: Deck.VENUS,
        name: 'Omnicourt',
        oneTimeText: 'Requires Venus, Earth, and Jovian tags. Increase your TR 2 steps.',
        requiredTags: {[Tag.VENUS]: 1, [Tag.EARTH]: 1, [Tag.JOVIAN]: 1},
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED
    },
    {
        // venus: 2,
        cost: 26,
        deck: Deck.VENUS,
        name: 'Orbital Reflectors',
        oneTimeText: 'Raise Venus 2 steps. Increase your heat production 2 steps.',
        tags: [Tag.SPACE, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText:
            'Action: Spend 6 MC to add an asteroid resource to this card (TITANIUM MAY BE USED), or spend 1 resource from this card to increase VENUS 1 step.',
        cost: 6,
        deck: Deck.VENUS,
        name: 'Rotator Impacts',
        oneTimeText: 'Venus must be 14% or lower.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            max: 14
        },
        tags: [Tag.SPACE],
        type: CardType.ACTIVE
    },
    {
        cost: 7,
        deck: Deck.VENUS,
        name: 'Sister Planet Support',
        oneTimeText: 'Requires Venus and Earth tag. Increase your MC production 3 steps.',
        requiredTags: {[Tag.VENUS]: 1, [Tag.EARTH]: 1},
        tags: [Tag.EARTH, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        cost: 7,
        deck: Deck.VENUS,
        name: 'Solarnet',
        oneTimeText: 'Requires Venus, Earth, and Jovian tags. Draw 2 cards.',
        requiredTags: {[Tag.VENUS]: 1, [Tag.EARTH]: 1, [Tag.JOVIAN]: 1},
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        // venus: 2,
        cost: 16,
        deck: Deck.VENUS,
        name: 'Spin-Inducing Asteroid',
        oneTimeText: 'Venus must be 10% or lower. Raise Venus 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            max: 10
        },
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        cost: 9,
        deck: Deck.VENUS,
        name: 'Sponsored Academies',
        oneTimeText: 'Discard 1 card from hand and THEN draw 3 cards. All OPPONENTS draw 1 card.',
        tags: [Tag.EARTH, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        actionOrEffectText: 'Action: Add 2 floaters to ANY VENUS CARD.',
        cost: 22,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Stratopolis',
        oneTimeText:
            'Requires 2 science tags. Increase your MC production 2 steps. Place a city tile on THE RESERVED AREA. 1 VP per 3 floaters on this card.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [Tag.CITY, Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText: 'Action: Add 1 animal to this card.',
        cost: 12,
        deck: Deck.VENUS,
        storedResourceType: Resource.ANIMAL,
        name: 'Stratospheric Birds',
        oneTimeText:
            'Requires Venus 12%, and that you spend 1 floater from any card. 1 VP for each animal on this card.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 12
        },
        tags: [Tag.ANIMAL, Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        // venus: 1,
        cost: 21,
        deck: Deck.VENUS,
        name: 'Sulphur Exports',
        oneTimeText:
            'Increase Venus 1 step. Increase your MC production 1 step for each Venus tag you have, including this.',
        tags: [Tag.SPACE, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText:
            'Action: Add 1 microbe to this card, or spend any number of microbes here to gain the triple amount of MC.',
        cost: 6,
        deck: Deck.VENUS,
        storedResourceType: Resource.MICROBE,
        name: 'Sulphur-Eating Bacteria',
        oneTimeText: 'Requires Venus 6%.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 6
        },
        tags: [Tag.MICROBE, Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        cost: 8,
        deck: Deck.VENUS,
        name: 'Terraforming Contract',
        oneTimeText: 'Requires that you have at least 25 TR. Increase your MC production 4 steps.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText:
            'Action: Add 1 microbe to ANY VENUS CARD, or spend 2 microbes here to raise Venus 1 step.',
        cost: 9,
        deck: Deck.VENUS,
        storedResourceType: Resource.MICROBE,
        name: 'Thermophiles',
        oneTimeText: 'Requires Venus 6%.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 6
        },
        tags: [Tag.MICROBE, Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        // venus: 1,
        cost: 9,
        deck: Deck.VENUS,
        name: 'Water to Venus',
        oneTimeText: 'Raise Venus 1 step.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        cost: 4,
        deck: Deck.VENUS,
        name: 'Venus Governor',
        oneTimeText: 'Requires 2 Venus tags. Increase your MC production 2 steps.',
        requiredTags: {[Tag.VENUS]: 2},
        tags: [Tag.VENUS, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText: 'Action: Decrease your energy production 1 step to raise Venus 1 step.',
        cost: 7,
        deck: Deck.VENUS,
        name: 'Venus Magnetizer',
        oneTimeText: 'Requires Venus 10%',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 10
        },
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        // venus: 1,
        cost: 20,
        deck: Deck.VENUS,
        name: 'Venus Soil',
        oneTimeText:
            'Raise Venus 1 step. Increase your plant production 1 step. Add 2 microbes to ANOTHER card.',
        tags: [Tag.PLANT, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText: 'Effect: When you play a Venus tag, you pay 2 MC less for it.',
        cost: 9,
        deck: Deck.VENUS,
        name: 'Venus Waystation',
        tags: [Tag.SPACE, Tag.VENUS],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        actionOrEffectText:
            'Effect: When you play a science tag, including this, add 1 animal to this card.',
        cost: 15,
        deck: Deck.VENUS,
        storedResourceType: Resource.ANIMAL,
        name: 'Venusian Animals',
        oneTimeText: 'Requires Venus 18%. 1 VP for each animal on this card.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 18
        },
        tags: [Tag.ANIMAL, Tag.SCIENCE, Tag.VENUS],
        type: CardType.ACTIVE,
        condition: condition => condition.tag === Tag.VENUS,
        effect(effect) {
            effect.gainResource(Resource.ANIMAL, 1, this);
        }
    },
    {
        actionOrEffectText: 'Action: Add 1 microbe to this card.',
        cost: 5,
        deck: Deck.VENUS,
        name: 'Venusian Insects',
        oneTimeText: 'Requires Venus 12%. 1 VP per 2 microbes on this card.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 12
        },
        tags: [Tag.MICROBE, Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        // venus: 1,
        cost: 13,
        deck: Deck.VENUS,
        name: 'Venusian Plants',
        oneTimeText:
            'Requires Venus 16%. Raise Venus 1 step. Add 1 microbe or 1 animal to ANOTHER VENUS CARD.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 16
        },
        tags: [Tag.MICROBE, Tag.VENUS],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        // addsResourceToCards: Resource.FLOATER,
        cost: 11,
        deck: Deck.COLONIES,
        name: 'Airliners',
        requiredResources: Array(3).fill(Resource.FLOATER),
        oneTimeText:
            'Requires that you have 3 floaters. Increase your MC production 2 steps. Add 2 floaters to ANOTHER card.',
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 0,
        deck: Deck.COLONIES,
        name: 'Air Raid',
        removeResources: [Resource.FLOATER],
        oneTimeText: 'Requires that you lose 1 floater. Steal 5 MC from any player.',
        tags: [Tag.EVENT],
        type: CardType.EVENT
    },
    {
        actionOrEffectText:
            'Action: Add 1 floater to this card, or spend 1 floater here to gain 2 titanium, or 3 energy, or 4 heat.',
        cost: 15,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Atmo Collectors',
        oneTimeText: 'Add 2 floaters to ANY card.',
        tags: [],
        type: CardType.ACTIVE
    },
    {
        cost: 13,
        deck: Deck.COLONIES,
        name: 'Community Services',
        oneTimeText: 'Increase your MC production 1 step per CARD WITH NO TAGS, including this.',
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 5,
        deck: Deck.COLONIES,
        name: 'Conscription',
        oneTimeText:
            'Requires 2 Earth tags. The next card you play this generation costs 16 MC less.',
        requiredTags: {[Tag.EARTH]: 2},
        tags: [Tag.EARTH, Tag.EVENT],
        type: CardType.EVENT,
        victoryPoints: -1
    },
    {
        cost: 10,
        deck: Deck.COLONIES,
        name: 'Corona Extractor',
        oneTimeText: 'Requires 4 science tags. Increase your energy production 4 steps.',
        requiredTags: {[Tag.SCIENCE]: 4},
        tags: [Tag.POWER, Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText: 'Effect: When you trade, you pay 1 less resource for it.',
        cost: 10,
        deck: Deck.COLONIES,
        name: 'Cryo-Sleep',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        cost: 43,
        deck: Deck.COLONIES,
        name: 'Earth Elevator',
        oneTimeText: 'Increase your titanium production 3 steps.',
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 4
    },
    {
        cost: 21,
        deck: Deck.COLONIES,
        name: 'Ecology Research',
        oneTimeText:
            'Increase your plant production 1 step for each colony you own. Add 1 animal to ANOTHER card and 2 microbes to ANOTHER card.',
        tags: [Tag.ANIMAL, Tag.MICROBE, Tag.PLANT, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 3,
        deck: Deck.COLONIES,
        name: 'Floater Leasing',
        oneTimeText: 'Increase your MC production 1 step per 3 floaters you have.',
        tags: [],
        type: CardType.AUTOMATED
    },
    {
        // addsResourceToCards: Resource.FLOATER,
        cost: 2,
        deck: Deck.COLONIES,
        name: 'Floater Prototypes',
        oneTimeText: 'Add 2 floaters to ANOTHER card',
        tags: [Tag.EVENT, Tag.SCIENCE],
        type: CardType.EVENT
    },
    {
        actionOrEffectText: 'Action: Add 1 floater to ANOTHER card.',
        cost: 7,
        deck: Deck.COLONIES,
        name: 'Floater Technology',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE
    },
    {
        cost: 15,
        deck: Deck.COLONIES,
        name: 'Gaillean Waystation',
        oneTimeText: 'Increase your MC production 1 step for every Jovian tags in play.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 3,
        deck: Deck.COLONIES,
        name: 'Heavy Taxation',
        oneTimeText: 'Requires 2 Earth tags. Increase your MC production 2 steps, and gain 4 MC.',
        requiredTags: {[Tag.EARTH]: 2},
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED,
        victoryPoints: -1
    },
    {
        cost: 23,
        deck: Deck.COLONIES,
        name: 'Ice Moon Colony',
        oneTimeText: 'Place 1 colony and 1 ocean tile.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        cost: 11,
        deck: Deck.COLONIES,
        name: 'Impactor Swarm',
        oneTimeText: 'Requires 2 Jovian tags. Gain 12 heat. Remove up to 2 plants from any player.',
        requiredTags: {[Tag.JOVIAN]: 2},
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        cost: 12,
        deck: Deck.COLONIES,
        name: 'Interplanetary Colony Ship',
        oneTimeText: 'Place a colony.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        increaseTerraformRating: 1,
        actionOrEffectText: 'Action: Spend 1 titanium to add 2 floaters here.',
        cost: 20,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Jovian Lanterns',
        oneTimeText:
            'Requires 1 Jovian tag. Increase your TR 1 step. Add 2 floaters to ANY card. 1 VP per 2 floaters here.',
        requiredTags: {[Tag.JOVIAN]: 1},
        tags: [Tag.JOVIAN],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText:
            'Action: Add 1 floater to a JOVIAN CARD, or gain 1 MC for every floater here (Max 4).',
        cost: 9,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Jupiter Floating Station',
        oneTimeText: 'Requires 3 science tags.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.JOVIAN],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        cost: 4,
        deck: Deck.COLONIES,
        name: 'Luna Governor',
        oneTimeText: 'Requires 3 Earch tags. Increase your MC production 2 steps.',
        requiredTags: {[Tag.EARTH]: 3},
        tags: [Tag.EARTH, Tag.EARTH],
        type: CardType.AUTOMATED
    },
    {
        cost: 19,
        deck: Deck.COLONIES,
        name: 'Lunar Exports',
        oneTimeText:
            'Increase your plant production 2 steps, or increase your MC production 5 steps.',
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        cost: 11,
        deck: Deck.COLONIES,
        name: 'Lunar Mining',
        oneTimeText:
            'Increase your titanium production. 1 step for every 2 Earth tags you have in play, including this.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED
    },
    {
        cost: 1,
        deck: Deck.COLONIES,
        name: 'Market Manipulation',
        oneTimeText:
            'Increase one colony tile track 1 step. Decrease another colony tile track 1 step',
        tags: [Tag.EARTH, Tag.EVENT],
        type: CardType.EVENT
    },
    {
        actionOrEffectText:
            'Effect: when you play an Earth tag, place an animal here. Action: Gain 1 MC per animal here.',
        cost: 12,
        deck: Deck.COLONIES,
        storedResourceType: Resource.ANIMAL,
        name: 'Martian Zoo',
        oneTimeText: 'Requires 2 city tiles in play.',
        tags: [Tag.ANIMAL, Tag.BUILDING],
        type: CardType.ACTIVE,
        victoryPoints: 1,
        condition: condition => condition.tag === Tag.EARTH,
        effect(effect) {
            effect.gainResource(Resource.ANIMAL, 1, this);
        }
    },
    {
        cost: 20,
        deck: Deck.COLONIES,
        name: 'Mining Colony',
        oneTimeText: 'Increase your titanium production 1 step. Place a colony.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        cost: 5,
        deck: Deck.COLONIES,
        name: 'Minority Refuge',
        oneTimeText: 'Decrese your MC production 2 steps. Place a colony.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        cost: 11,
        deck: Deck.COLONIES,
        name: 'Molecular Printing',
        oneTimeText: 'Gain 1 MC fo each city tile in play. Gain 1 MC for each colony in play.',
        tags: [Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        increaseTerraformRating: 2,
        // addsResourceToCards: Resource.FLOATER,
        cost: 25,
        deck: Deck.COLONIES,
        name: 'Nitrogen from Titan',
        oneTimeText: 'Raise your TR 2 steps. Add 2 floaters to a JOVIAN CARD.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 13,
        deck: Deck.COLONIES,
        name: 'Pioneer Settlement',
        oneTimeText:
            'Requires that you have no more than 1 colony. Decrease your MC production 2 steps. Place a colony.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        cost: 0,
        deck: Deck.COLONIES,
        name: 'Productive Outpost',
        oneTimeText: 'Gain all your colony bonuses',
        tags: [],
        type: CardType.AUTOMATED
    },
    {
        cost: 8,
        deck: Deck.COLONIES,
        name: 'Quantum Communications',
        oneTimeText:
            'Requires 4 science tags. Increase your MC production 1 step for each colony in play.',
        requiredTags: {[Tag.SCIENCE]: 4},
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        actionOrEffectText:
            'Action: Add 1 floater to this card, or spend 1 floater here to draw a card.',
        cost: 17,
        deck: Deck.COLONIES,
        name: 'Red Spot Observatory',
        oneTimeText: 'Requires 3 science tags. Draw 2 cards.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.JOVIAN, Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 2
    },
    {
        actionOrEffectText:
            'Action: Decrease your MC production 1 step to add a camp resource to this card.',
        cost: 10,
        deck: Deck.COLONIES,
        storedResourceType: Resource.CAMP,
        name: 'Refugee Camps',
        oneTimeText: '1 VP for each camp resource on this card.',
        tags: [Tag.EARTH],
        type: CardType.ACTIVE
    },
    {
        cost: 20,
        deck: Deck.COLONIES,
        name: 'Research Colony',
        oneTimeText: 'Place a colony. MAY BE PLACED WHERE YOU ALREADY HAVE A COLONY. Draw 2 cards.',
        tags: [Tag.SCIENCE, Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText: 'Effect: When you trade, you pay 1 less resource for it.',
        cost: 4,
        deck: Deck.COLONIES,
        name: 'Rim Freighters',
        tags: [Tag.SPACE],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText: 'Effect: When you play a card, you pay 1 MC less for it.',
        cost: 18,
        deck: Deck.COLONIES,
        name: 'Sky Docks',
        oneTimeText: 'Requires 2 Earth tags. Gain 1 Trade Fleet.',
        requiredTags: {[Tag.EARTH]: 2},
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.ACTIVE,
        victoryPoints: 2
    },
    {
        cost: 9,
        deck: Deck.COLONIES,
        name: 'Solar Probe',
        oneTimeText: 'Draw 1 card for every 3 science tags you have, including this.',
        tags: [Tag.EVENT, Tag.SCIENCE, Tag.SPACE],
        type: CardType.EVENT,
        victoryPoints: 1
    },
    {
        cost: 23,
        deck: Deck.COLONIES,
        name: 'Solar Reflectors',
        oneTimeText: 'Increase your heat production 5 steps.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        cost: 22,
        deck: Deck.COLONIES,
        name: 'Space Port',
        oneTimeText:
            'Requires 1 colony. Gain 1 Trade Fleet. Place a city tile. Decrease your energy production 1 step, and increase your MC production 4 steps.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED
    },
    {
        cost: 27,
        deck: Deck.COLONIES,
        name: 'Space Port Colony',
        oneTimeText:
            'Requires a colony. Place a colony. MAY BE PLACED ON A COLONY TILE WHERE YOU ALREADY HAVE A COLONY. Gain 1 Trade Fleet. 1 VP per 2 colonies in play.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText:
            'Effect: WHEN PLAYING A CARD WITH A BASIC COST OF 20 MC OR MORE, draw a card',
        cost: 10,
        deck: Deck.COLONIES,
        name: 'Spin-Off Department',
        oneTimeText: 'Increase your MC production 2 steps.',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE,
        condition: condition => (condition.card?.cost ?? 0 > 20 ? true : false),
        effect: effect => effect.drawCard()
    },
    {
        actionOrEffectText: 'Action: Add 1 animal to this card.',
        cost: 5,
        deck: Deck.COLONIES,
        storedResourceType: Resource.ANIMAL,
        name: 'Sub-Zero Salt Fish',
        oneTimeText:
            'Requires -6°C or warmer. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -6
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText:
            'Action: Spend 1 titanium to add 2 floaters to this card, or spend 2 floaters here to increase your TR 1 step.',
        cost: 21,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Titan Air-Scrapping',
        tags: [Tag.JOVIAN],
        type: CardType.ACTIVE,
        victoryPoints: 2
    },
    {
        actionOrEffectText:
            'Action: Add 1 floater to ANY JOVIAN CARD, or spend 1 floater here to trade for free',
        cost: 18,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Titan Floating Launch-Pad',
        oneTimeText: 'Add 2 foaters to ANY JOVIAN CARD.',
        tags: [Tag.JOVIAN],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        actionOrEffectText:
            'Action: Add 2 floaters to ANY JOVIAN CARD, or spend any number of floaters here to gain the same number of titanium.',
        cost: 23,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Titan Shuttles',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        actionOrEffectText:
            'Effect: When you trade, you may first increase that Colony Tile track 1 step.',
        cost: 6,
        deck: Deck.COLONIES,
        name: 'Trade Envoys',
        tags: [],
        type: CardType.ACTIVE
    },
    {
        actionOrEffectText:
            'Effect: When you trade, you may first increase that Colony Tile track 1 step.',
        cost: 18,
        deck: Deck.COLONIES,
        name: 'Trading Colony',
        oneTimeText: 'Place a colony.',
        tags: [Tag.SPACE],
        type: CardType.ACTIVE
    },
    {
        cost: 6,
        deck: Deck.COLONIES,
        name: 'Urban Decomposers',
        oneTimeText:
            'Requires that you have 1 city tile and 1 colony in play. Increase your plant production 1 step, and add 2 microbes to ANOTHER card.',
        requiredTags: {[Tag.SPACE]: 1},
        tags: [Tag.MICROBE],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText: 'Effect: When you play a space tag, you pay 4 MC less for it.',
        cost: 14,
        deck: Deck.COLONIES,
        name: 'Warp Drive',
        oneTimeText: 'Requires 5 science tags.',
        requiredTags: {[Tag.SCIENCE]: 5},
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 2
    },
    {
        deck: Deck.PRELUDE,
        name: 'Allied Bank',
        oneTimeText: 'Increase your MC production 4 steps. Gain 3 MC.',
        tags: [Tag.EARTH],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Aquifer Turbines',
        oneTimeText: 'Place an ocean tile. Increase your energy production 2 steps. Remove 3 MC.',
        tags: [Tag.POWER],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Biofuels',
        oneTimeText:
            'Increase your plant production and energy production 1 step each. Gain 2 plants.',
        tags: [Tag.MICROBE],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Biolabs',
        oneTimeText: 'Increase your plant production 1 step. Draw 3 cards.',
        tags: [Tag.SCIENCE],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Biosphere Support',
        oneTimeText: 'Decrease your MC production 1 step. Increase your plant production 2 steps.',
        tags: [Tag.PLANT],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Business Empire',
        oneTimeText: 'Increase your MC production 6 steps. Remove 6 MC.',
        tags: [Tag.EARTH],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Dome Farming',
        oneTimeText: 'Increase your plant production 1 step. Increase your MC production 2 steps.',
        tags: [Tag.BUILDING, Tag.PLANT],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Donation',
        oneTimeText: 'Gain 21 MC.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Early Settlement',
        oneTimeText: 'Place a city tile. Increase your plant production 1 step.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Ecology Experts',
        oneTimeText:
            'Increase your plant production 1 step. Play a card from Hand, ignoring global requirements',
        tags: [Tag.MICROBE, Tag.PLANT],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Excentric Sponsor',
        oneTimeText: 'Play a card from hand, reducing its costs by 25 MC',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Experimental Forest',
        oneTimeText:
            'Place a greenery tile and increase oxygen 1 step. Reveal cards from the deck until you have revealed 2 plant-tag cards. Take these into your hand, and discard the rest.',
        tags: [Tag.PLANT],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Galilean Mining',
        oneTimeText: 'Increase your titanium production 2 steps. Remove 5 MC.',
        tags: [Tag.JOVIAN],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Great Aquifer',
        oneTimeText: 'Place 2 ocean tiles.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Huge Asteroid',
        oneTimeText: 'Raise temperature 3 steps. Remove 5 MC.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Io Research Outpost',
        oneTimeText: 'Increase your titanium production 1 step. Draw 1 card.',
        tags: [Tag.JOVIAN, Tag.SCIENCE],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Loan',
        oneTimeText: 'Decrease your MC production 2 steps. Gain 30 MC.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Martian Industries',
        oneTimeText: 'Increase your energy production and steel production 1 step each. Gain 6 MC.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Metal-Rich Asteroid',
        oneTimeText: 'Raise temperature 1 step. Gain 4 titanium, and 4 steel.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Metals Company',
        oneTimeText:
            'Increase your MC production, steel production, and titanium production 1 step each.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Mining Operations',
        oneTimeText: 'Increase your steel production 2 steps. Gain 4 steel.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Mohole',
        oneTimeText: 'Increse your heat production 3 steps. Gain 3 heat.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Mohole Excavation',
        oneTimeText:
            'Increase your steel production 1 step, and your heat production 2 steps. Gain 2 heat.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        increaseTerraformRating: 1,
        deck: Deck.PRELUDE,
        name: 'Nitrogen Shipment',
        oneTimeText:
            'Raise your terraform rating 1 step. Increase your plant production 1 step. Gain 5 MC.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Orbital Construction Yard',
        oneTimeText: 'Increase your titanium produciton [sic] 1 step. Gain 4 titanium.',
        tags: [Tag.SPACE],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Polar Industries',
        oneTimeText: 'Place 1 ocean tile. Increase your heat production 2 steps.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Power Generation',
        oneTimeText: 'Increase your energy production 3 steps.',
        tags: [Tag.POWER],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Research Network',
        oneTimeText:
            'Draw 3 cards, and increase your MC production 1 step. After being played, when you perform an action, the wild tag is any tag of your choice.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Self-Sufficient Settlement',
        oneTimeText: 'Place a city tile. Increase your MC production 2 steps.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Smelting Plant',
        oneTimeText: 'Raise oxygen 2 steps. Gain 5 steel.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Society Support',
        oneTimeText:
            'Decrease your MC production  1 step. Increase your plant production, energy production, and heat production 1 step each.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Supplier',
        oneTimeText: 'Increase your energy production 2 steps. Gain 4 steel.',
        tags: [Tag.POWER],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Supply Drop',
        oneTimeText: 'Gain 3 titanium, 8 steeel, and 3 plants.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        increaseTerraformRating: 3,
        deck: Deck.PRELUDE,
        name: 'UNMI Contractor',
        oneTimeText: 'Raise your terraform rating 3 steps. Draw 1 card.',
        tags: [Tag.VENUS],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Acquired Space Agency',
        oneTimeText:
            'Gain 6 titanium. Reveal cards from the deck until you have revealed 2 space cards. Take those into hand, and discard the rest.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        cost: 10,
        deck: Deck.PRELUDE,
        name: 'House Printing',
        oneTimeText: 'Increase your steel production 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 15,
        deck: Deck.PRELUDE,
        name: 'Lava Tube Settlement',
        oneTimeText:
            'Decrease your energy production 1 step. Increase your MC production 2 steps. Place a city tile ON A VOLCANIC AREA, same as Lava Flows, regardless of adjacent cities.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED
    },
    {
        cost: 9,
        deck: Deck.PRELUDE,
        name: 'Martian Survey',
        oneTimeText: 'Oxygen must be 4% or lower. Draw 2 cards.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 4
        },
        tags: [Tag.EVENT, Tag.SCIENCE],
        type: CardType.EVENT,
        victoryPoints: 1
    },
    {
        actionOrEffectText:
            'Action: Add a microbe to this card. Effect: When paying for a plant card, microbes here may be used as 2 MC each.',
        cost: 2,
        deck: Deck.PRELUDE,
        storedResourceType: Resource.MICROBE,
        name: 'Psychrophiles',
        oneTimeText: 'Requires temperature -20°C or colder.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            max: -20
        },
        tags: [Tag.MICROBE],
        type: CardType.ACTIVE
    },
    {
        cost: 4,
        deck: Deck.PRELUDE,
        name: 'Research Coordination',
        oneTimeText:
            'After being played, when you perform an action, the wild tag counts as any tag of your choice.',
        tags: [],
        type: CardType.AUTOMATED
    },
    {
        cost: 7,
        deck: Deck.PRELUDE,
        name: 'SF Memorial',
        oneTimeText: 'Draw 1 card.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 12,
        deck: Deck.PRELUDE,
        name: 'Space Hotels',
        oneTimeText: 'Requires 2 Earth tags. Increase your MC production 4 steps.',
        requiredTags: {[Tag.EARTH]: 2},
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        actionOrEffectText:
            'Effect: After you pay for a card or standard project with a basic cost of 20 MC or more, you gain 4 MC.',
        deck: Deck.BASIC,
        name: 'CrediCor',
        oneTimeText: 'You start with 57 MC.',
        tags: [],
        type: CardType.CORPORATION,
        condition: condition => (condition.cost && condition.cost >= 20 ? true : false),
        effect: effect => effect.gainResource(Resource.MEGACREDIT, 4),
        gainResource: Array(57).fill(Resource.MEGACREDIT)
    },
    {
        actionOrEffectText:
            'Effect: You may always pay 7 plants, instead of 8, to place 1 greenery.',
        deck: Deck.BASIC,
        name: 'Ecoline',
        oneTimeText: 'You start with 2 plant production, 3 plants, and 36 MC.',
        tags: [Tag.PLANT],
        type: CardType.CORPORATION,
        gainResource: [...Array(36).fill(Resource.MEGACREDIT), ...Array(3).fill(Resource.PLANT)],
        increaseProduction: [Resource.PLANT, Resource.PLANT]
    },
    {
        actionOrEffectText: 'Effect: You may use heat as MC. You may not use MC as heat.',
        deck: Deck.BASIC,
        name: 'Helion',
        oneTimeText: 'You start with 3 heat production and 42 MC.',
        tags: [Tag.SPACE],
        type: CardType.CORPORATION,
        increaseProduction: [Resource.HEAT, Resource.HEAT, Resource.HEAT],
        gainResource: Array(42).fill(Resource.MEGACREDIT)
    },
    {
        actionOrEffectText: 'Effect: Each time you play an event, you gain 2 MC.',
        deck: Deck.BASIC,
        name: 'Interplanetary Cinematics',
        oneTimeText: 'You start with 20 steel and 30 MC.',
        tags: [Tag.BUILDING],
        type: CardType.CORPORATION,
        condition: condition =>
            condition.card && condition.card.tags.includes(Tag.EVENT) ? true : false,
        effect: effect => effect.gainResource(Resource.MEGACREDIT, 2),
        gainResource: [...Array(30).fill(Resource.MEGACREDIT), ...Array(20).fill(Resource.STEEL)]
    },
    {
        actionOrEffectText:
            'Effect: Your temperature, oxygen, and ocean requirements are +2 or -2 steps, your choice in each case.',
        deck: Deck.BASIC,
        name: 'Inventrix',
        oneTimeText: 'As your first action in the game, draw 3 cards. You start with 45 MC.',
        tags: [Tag.SCIENCE],
        type: CardType.CORPORATION,
        gainResource: Array(45).fill(Resource.MEGACREDIT)
    },
    {
        actionOrEffectText:
            'Effect: Each time you get any steel or titanium as a placement bonus on the map, increase your steel production 1 step.',
        deck: Deck.BASIC,
        name: 'Mining Guild',
        oneTimeText: 'You start with 30 MC, 5 steel, and 1 steel production.',
        tags: [Tag.BUILDING, Tag.BUILDING],
        type: CardType.CORPORATION,
        gainResource: [...Array(30).fill(Resource.MEGACREDIT), ...Array(5).fill(Resource.STEEL)],
        increaseProduction: [Resource.STEEL]
    },
    {
        actionOrEffectText:
            'Effect: Each time any Jovian tag is put into play, including this, increase your MC production 1 step.',
        deck: Deck.CORPORATE,
        name: 'Saturn Systems',
        oneTimeText: 'You start with 1 titanium production and 42 MC.',
        tags: [Tag.JOVIAN],
        type: CardType.CORPORATION,
        condition: condition => condition.tag === Tag.JOVIAN,
        effect: effect => effect.increaseProduction(Resource.MEGACREDIT, 1),
        increaseProduction: [Resource.TITANIUM],
        gainResource: Array(42).fill(Resource.MEGACREDIT)
    },
    {
        actionOrEffectText: 'Effect: Your titanium resources are each worth 1 MC extra.',
        deck: Deck.BASIC,
        name: 'PhoboLog',
        oneTimeText: 'You start with 10 titanium and 23 MC',
        tags: [Tag.SPACE],
        type: CardType.CORPORATION,
        gainResource: [...Array(10).fill(Resource.TITANIUM), ...Array(23).fill(Resource.MEGACREDIT)]
    },
    {
        actionOrEffectText: 'Effect: When playing an Earth card, you pay 3 MC less for it.',
        deck: Deck.CORPORATE,
        name: 'Teractor',
        oneTimeText: 'You start with 60 MC.',
        tags: [Tag.EARTH],
        type: CardType.CORPORATION,
        gainResource: Array(60).fill(Resource.MEGACREDIT)
    },
    {
        actionOrEffectText:
            'Effect: When any city tile is placed ON MARS, increase your MC production 1 step. When you place a city tile, gain 3 MC.',
        deck: Deck.BASIC,
        name: 'Tharsis Republic',
        oneTimeText: 'You start with 40 MC. As your first action in the game, place a city tile.',
        tags: [Tag.BUILDING],
        type: CardType.CORPORATION,
        condition: condition =>
            condition.tileType === TileType.CITY && (condition.onMars || condition.samePlayer)
                ? true
                : false,
        effect: effect => {
            if (effect.condition.onMars) {
                effect.increaseProduction(Resource.MEGACREDIT, 1);
            }
            if (effect.condition.samePlayer) {
                effect.gainResource(Resource.MEGACREDIT, 3);
            }
        },
        gainResource: Array(40).fill(Resource.MEGACREDIT)
    },
    {
        actionOrEffectText:
            'Effect: When playing a power card OR THE STANDARD PROJECT POWER PLANT, you pay 3 MC less for it.',
        deck: Deck.BASIC,
        name: 'ThorGate',
        oneTimeText: 'You start with 1 energy production and 48 MC.',
        tags: [Tag.POWER],
        type: CardType.CORPORATION,
        increaseProduction: [Resource.ENERGY],
        gainResource: Array(48).fill(Resource.MEGACREDIT)
    },
    {
        actionOrEffectText:
            'Action: If your Terraform Rating was raised this generation, you may pay 3 MC to raise it 1 step more.',
        deck: Deck.BASIC,
        name: 'United Nations Mars Initiative',
        oneTimeText: 'You start with 40 MC.',
        tags: [Tag.EARTH],
        type: CardType.CORPORATION,
        gainResource: Array(40).fill(Resource.MEGACREDIT)
    },
    {
        actionOrEffectText: 'Effect: Whenever Venus is terraformed 1 step, you gain 2 MC.',
        deck: Deck.VENUS,
        name: 'Aphrodite',
        oneTimeText: 'You start with 47 MC and 1 plant production.',
        tags: [Tag.PLANT, Tag.VENUS],
        type: CardType.CORPORATION
    },
    {
        actionOrEffectText: 'Action: Add a floater to ANY card.',
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Celestic',
        oneTimeText:
            'You start with 42 MC. As your first action, reveal cards from the deck until you have revealed 2 cards with a floater icon on it. Take those 2 cards into hand, and discard the rest. 1 VP per 3 floaters on this card.',
        tags: [Tag.VENUS],
        type: CardType.CORPORATION
    },
    {
        actionOrEffectText:
            'Effect: For each step you increase the production of a resource, including this, you also gain that ',
        deck: Deck.VENUS,
        name: 'Manutech',
        oneTimeText: 'You start with 1 steel production and 35 MC.',
        tags: [Tag.BUILDING],
        type: CardType.CORPORATION
    },
    {
        actionOrEffectText:
            'Effect: Your Venus requirements are +/- 2 steps, your choice in each case.',
        deck: Deck.VENUS,
        name: 'Morning Star Inc.',
        oneTimeText:
            'You start with 50 MC. As your first action, reveal cards from the deck until you have revealed 3 Venus-tag cards. Take those into hand and discard the rest.',
        tags: [Tag.VENUS],
        type: CardType.CORPORATION
    },
    {
        actionOrEffectText:
            'Action: Use a blue card action that has already been used this generation.',
        deck: Deck.VENUS,
        name: 'Viron',
        oneTimeText: 'You start with 48 MC.',
        tags: [Tag.MICROBE],
        type: CardType.CORPORATION
    },
    {
        actionOrEffectText: 'Effect: When you play a building tag, you pay 2 MC less for it.',
        deck: Deck.PRELUDE,
        name: 'Cheung Shing Mars',
        oneTimeText: 'You start with 44 MC and 3 MC production.',
        tags: [Tag.BUILDING],
        type: CardType.CORPORATION
    },
    {
        actionOrEffectText: 'Effect: When you play a Earth tag, including this, draw a card.',
        deck: Deck.PRELUDE,
        name: 'Point Luna',
        oneTimeText: 'You start with 38 MC and 1 titanium production.',
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.CORPORATION,
        condition: condition => condition.tag === Tag.EARTH,
        effect: effect => effect.drawCard()
    },
    {
        actionOrEffectText:
            'Action: Spend 4 MC to increase (one of) your LOWEST PRODUCTION 1 step.',
        deck: Deck.PRELUDE,
        name: 'Robinson Industries',
        oneTimeText: 'You start with 47 MC.',
        tags: [],
        type: CardType.CORPORATION
    },
    {
        actionOrEffectText: 'Effect: When you play a science tag, you pay 2 MC less for it.',
        deck: Deck.PRELUDE,
        name: 'Valley Trust',
        oneTimeText:
            'You start with 37 MC. As your first action, draw 3 Prelude cards, and play one of them. Discard the other two.',
        tags: [Tag.EARTH],
        type: CardType.CORPORATION
    },
    {
        actionOrEffectText:
            'Effect: When you play a card with a NON-NEGATIVE VP icon, including this, gain 3 MC.',
        deck: Deck.PRELUDE,
        name: 'Vitor',
        oneTimeText: 'You start with 45 MC. As your first action, fund an award for free.',
        tags: [Tag.EARTH],
        type: CardType.CORPORATION,
        condition: condition => {
            if (!condition.card) return false;
            if (!condition.card.victoryPoints) return false;
            return condition.card.victoryPoints > 0;
        }
    },
    {
        actionOrEffectText:
            'Effect: When you get a new type of tag in play (event cards do not count), increase your MC production 1 step.',
        deck: Deck.COLONIES,
        name: 'Aridor',
        oneTimeText:
            'You start with 40 MC. As your first action, put an additional Colony Tile of your choice into play.',
        tags: [],
        type: CardType.CORPORATION,
        condition: condition => condition.newTag ?? false,
        effect: effect => effect.increaseProduction(Resource.MEGACREDIT, 1)
    },
    {
        actionOrEffectText:
            'Effect: When you play an animal or plant tag, including this, add 1 animal to this card.',
        deck: Deck.COLONIES,
        storedResourceType: Resource.ANIMAL,
        name: 'Arklight',
        oneTimeText:
            'You start with 45 MC. Increase your MC production 2 steps. 1 VP per 2 animals on this card.',
        tags: [Tag.ANIMAL],
        type: CardType.CORPORATION,
        condition: condition => !!condition.tag && [Tag.ANIMAL, Tag.PLANT].includes(condition.tag),
        effect(effect) {
            effect.gainResource(Resource.ANIMAL, 1, this);
        }
    },
    {
        actionOrEffectText:
            'Effect: When you buy a card to hand, pay 5 MC instead of 3 MC, including the starting hand.',
        deck: Deck.COLONIES,
        name: 'Polyphemos',
        oneTimeText: 'You start with 50 MC. Increase your MC production 5 steps. Gain 5 titanium.',
        tags: [],
        type: CardType.CORPORATION
    },
    {
        actionOrEffectText:
            'Effect: When any colony is placed, including this, raise your MC production 1 step.',
        deck: Deck.COLONIES,
        name: 'Poseidon',
        oneTimeText: 'You start with 45 MC. As your first action, place a colony.',
        tags: [],
        type: CardType.CORPORATION
    },
    {
        actionOrEffectText:
            'Action: Add 1 floater to ANY card. Effect: Floaters on this card may be used as 2 heat each',
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Stormcraft Incorporated',
        oneTimeText: 'You start with 48 MC.',
        tags: [Tag.JOVIAN],
        type: CardType.CORPORATION
    }
];
