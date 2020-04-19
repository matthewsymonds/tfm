import {CardConfig, Deck, CardType} from './card-types';
import {Tag} from './tag';
import {Resource} from './resource';
import {TileType, PlacementRequirement, Parameter, t} from './board';
import {MoveType} from './moves';

export const cardConfigs: CardConfig[] = [
    {
        cost: 8,
        deck: Deck.BASIC,
        name: 'Colonizer Training Camp',
        text: 'Oxygen must be 5% or less.',
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
        text:
            'Requires that you have titanium production. Decrease any titanium production 1 step and increase your own 1 step.',
        tags: [Tag.JOVIAN],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        // TODO(multi): Add check to verify opponent has production to lose
        // canBePlayed: state => state.players[state.currentPlayerIndex].productions[Resource.TITANIUM] > 0,
        // requirementFailedMessage: 'You need titanium production to play',
        decreaseAnyProduction: {[Resource.TITANIUM]: 1},
        increaseProduction: {[Resource.TITANIUM]: 1},
        requiredProduction: Resource.TITANIUM
    },
    {
        cost: 13,
        deck: Deck.BASIC,
        name: 'Deep Well Heating',
        text: 'Increase your energy production 1 step. Increase temperature 1 step.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.TITANIUM]: 1},
        increaseParameter: {[Parameter.TEMPERATURE]: 1}
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Cloud Seeding',
        text:
            'Requires 3 ocean tiles. Decrease your MC production 1 step and any heat production 1 step.  Increase your plant production 2 steps.',
        // TODO(multi): validate opponent production reduction
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 3
        },
        tags: [],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.MEGACREDIT]: 1},
        decreaseAnyProduction: {[Resource.HEAT]: 1},
        increaseProduction: {[Resource.PLANT]: 2}
    },
    {
        // action: function(dispatch) {
        //     dispatch(revealAndDiscardTopCard());
        //     dispatch(addResourceIfRevealedCardHasTag(this.name, Resource.SCIENCE, Tag.MICROBE));
        // },
        action: {
            text:
                'Action: Spend 1 MC to reveal and discard the top card of the draw deck. If that card has a microbe tag, add a science resource here.'
        },
        cost: 3,
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 6
        },
        deck: Deck.BASIC,
        storedResourceType: Resource.SCIENCE,
        name: 'Search For Life',
        text: 'Oxygen must be 6% or less. 3 VPs if you have one or more science resource here.',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        get victoryPoints() {
            return this.resources.length > 0 ? 3 : 0;
        }
    },
    {
        // action: dispatch => dispatch(goToGameStage(GameStage.BUY_OR_DISCARD)),
        action: {text: 'Action: Look at the top card and either buy it or discard it'},
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
        action: {text: 'Action: Spend 1 energy to gain 1 MC for each city tile ON MARS.'},
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
        text:
            'Requires 4 ocean tiles. Place [the capital city] tile. Decrease your energy production 2 steps and increase your MC production 5 steps. 1 ADDITIONAL VP FOR EACH OCEAN TILE ADJACENT TO THIS CITY TILE.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 4
        },
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.CAPITAL, PlacementRequirement.CITY)],
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.MEGACREDIT]: 4}
    },
    {
        cost: 14,
        deck: Deck.BASIC,
        name: 'Asteroid',
        text:
            'Raise temperature 1 step and gain 2 titanium. Remove up to 3 plants from any player.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: {[Parameter.TEMPERATURE]: 1},
        gainResource: {[Resource.TITANIUM]: 2},
        removeAnyResource: {[Resource.PLANT]: 3}
    },
    {
        cost: 21,
        deck: Deck.BASIC,
        name: 'Comet',
        text:
            'Raise temperature 1 step and place an ocean tile. Remove up to 3 plants from any player.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: {[Parameter.TEMPERATURE]: 1},
        tilePlacements: [t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)],
        removeAnyResource: {[Resource.PLANT]: 1}
    },
    {
        cost: 27,
        deck: Deck.BASIC,
        name: 'Big Asteroid',
        text:
            'Raise temperature 2 steps and gain 4 titanium. Remove up to 4 plants from any player.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: {[Parameter.TEMPERATURE]: 2},
        gainResource: {[Resource.TITANIUM]: 4},
        removeAnyResource: {[Resource.PLANT]: 4}
    },
    {
        action: {
            text:
                'Action: Pay 12 MC to place an ocean tile. TITANIUM MAY BE USED as if playing a space card.'
        },
        cost: 25,
        deck: Deck.BASIC,
        name: 'Water Import From Europa',
        text: '1 VP for each Jovian tag you have.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.ACTIVE,
        get victoryPoints() {
            if (!this.state) return 0;
            return this.state.tags.filter(tag => tag === Tag.JOVIAN).length;
        }
    },
    {
        action: {text: 'Action: Spend 1 steel to gain 5 MC'},
        cost: 27,
        deck: Deck.CORPORATE,
        name: 'Space Elevator',
        text: 'Increase your titanium production 1 step.',
        tags: [Tag.BUILDING, Tag.SPACE],
        type: CardType.ACTIVE,
        victoryPoints: 2,
        increaseProduction: {[Resource.TITANIUM]: 1}
    },
    {
        action: {text: 'Action: Spend 1 energy to draw a card.'},
        cost: 11,
        deck: Deck.CORPORATE,
        name: 'Development Center',
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.ACTIVE
    },
    {
        action: {
            text:
                'Action: Decrease your energy production 1 step to increase your terraforming rating 1 step.'
        },
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
        text:
            'Oxygen must be 7% or less. Gain 3 plants and place a city tile. Decrease your energy production 1 step and increase MC production 3 steps.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 7
        },
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        gainResource: {[Resource.PLANT]: 3},
        tilePlacements: [t(TileType.CITY, PlacementRequirement.CITY)],
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.MEGACREDIT]: 3}
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Noctis City',
        text:
            'Decrease your energy production 1 step and increase your MC production 3 steps. Place a tile ON THE RESERVED AREA, disregarding normal placement restrictions.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.MEGACREDIT]: 3},
        tilePlacements: [t(TileType.CITY, PlacementRequirement.NOCTIS, true)]
    },
    {
        cost: 28,
        deck: Deck.BASIC,
        name: 'Methane From Titan',
        text:
            'Requires 2% oxygen. Increase your heat production 2 steps and your plant production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 2
        },
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: {[Resource.HEAT]: 2, [Resource.PLANT]: 2}
    },
    {
        cost: 16,
        deck: Deck.BASIC,
        name: 'Imported Hydrogen',
        text: 'Gain 3 plants, or add 3 microbes or 2 animals to ANOTHER card. Place an ocean tile.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        gainResourceOption: {[Resource.PLANT]: 3, [Resource.MICROBE]: 3, [Resource.ANIMAL]: 3}
    },
    {
        effect: {text: 'Effect: When you play a card, you pay 1 MC less for it.'},
        cost: 18,
        deck: Deck.BASIC,
        name: 'Research Outpost',
        text: 'Place a city tile NEXT TO NO OTHER TILE.',
        tags: [Tag.BUILDING, Tag.CITY, Tag.SCIENCE],
        type: CardType.ACTIVE,
        tilePlacements: [t(TileType.CITY, PlacementRequirement.ISOLATED, true)]
    },
    {
        cost: 25,
        deck: Deck.BASIC,
        name: 'Phobos Space Haven',
        text:
            'Increase your titanium production 1 step and place a city tile ON THE RESERVED AREA.',
        tags: [Tag.CITY, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 3,
        increaseProduction: {[Resource.TITANIUM]: 1},
        tilePlacements: [t(TileType.CITY, PlacementRequirement.PHOBOS, true)]
    },
    {
        cost: 15,
        deck: Deck.BASIC,
        name: 'Black Polar Dust',
        text:
            'Place an ocean tile. Decrease your MC production 2 steps and increase your heat production 3 steps.',
        tags: [],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)],
        decreaseProduction: {[Resource.MEGACREDIT]: 2},
        increaseProduction: {[Resource.HEAT]: 3}
    },
    {
        effect: {text: 'Effect: When anyone places an ocean tile, gain 2 plants.'},
        cost: 12,
        deck: Deck.BASIC,
        name: 'Arctic Algae',
        text: 'It must be -12°C or colder to play. Gain 1 plant.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            max: -12
        },
        tags: [Tag.PLANT],
        type: CardType.ACTIVE,
        // condition: condition => condition.tileType === TileType.OCEAN,
        // effect: effect => effect.gainResource(Resource.PLANT, 2),
        gainResource: {[Resource.PLANT]: 1}
    },
    {
        action: {text: 'Action: Remove 1 animal from any card and add it to this card.'},
        cost: 14,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Predators',
        text: 'Requires 11% oxygen. 1 VP per animal on this card.',
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
        effect: {text: 'Effect: When you play a space card, you pay 2 MC less for it.'},
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
        text:
            'Requires -12°C  or warmer. Add 1 animal TO ANY animal CARD. Gain 3 plants. Increase your MC production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -12
        },
        tags: [Tag.BUILDING, Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        gainResource: {[Resource.ANIMAL]: 1, [Resource.PLANT]: 3},
        increaseProduction: {[Resource.MEGACREDIT]: 2}
    },
    {
        cost: 24,
        deck: Deck.CORPORATE,
        name: 'Interstellar Colony Ship',
        text: 'Requires 5 science tags.',
        requiredTags: {[Tag.SCIENCE]: 5},
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        victoryPoints: 4
    },
    {
        action: {text: 'Action: Spend 1 titanium to add 1 fighter resource to this card.'},
        cost: 12,
        deck: Deck.CORPORATE,
        storedResourceType: Resource.FIGHTER,
        name: 'Security Fleet',
        text: '1 VP for each fighter resource on this card.',
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
        text:
            'Oxygen must be 9% or less. Place a city tile. Decrease your energy production 1 step and increase your MC production 3 steps.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 9
        },
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.CITY, PlacementRequirement.CITY)],
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.MEGACREDIT]: 3}
    },
    {
        cost: 13,
        deck: Deck.BASIC,
        name: 'Lunar Beam',
        text:
            'Decrease your MC production 2 steps and increase your heat production and energy production 2 steps each.',
        tags: [Tag.EARTH, Tag.POWER],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.MEGACREDIT]: 2},
        increaseProduction: {[Resource.HEAT]: 2, [Resource.ENERGY]: 2}
    },
    {
        effect: {text: 'Effect: When you place a space event, you gain 3 MC and 3 heat.'},
        cost: 7,
        deck: Deck.BASIC,
        name: 'Optimal Aerobraking',
        tags: [Tag.SPACE],
        type: CardType.ACTIVE
        // condition: condition =>
        //     (!!condition.samePlayer &&
        //         condition.card?.tags.includes(Tag.SPACE) &&
        //         condition.card?.tags.includes(Tag.EVENT)) ??
        //     false,
        // effect: effect => {
        //     effect.gainResource(Resource.MEGACREDIT, 3);
        //     effect.gainResource(Resource.HEAT, 3);
        // }
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Underground City',
        text:
            'Place a city tile. Decrease your energy production 2 steps and increase your steel production 2 steps.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.CITY, PlacementRequirement.CITY)],
        decreaseProduction: {[Resource.ENERGY]: 2},
        increaseProduction: {[Resource.STEEL]: 2}
    },
    {
        action: {
            text:
                'Action: Add 1 microbe to this card, or remove 2 microbe from this card to raise oxygen level 1 step.'
        },
        cost: 13,
        deck: Deck.BASIC,
        storedResourceType: Resource.MICROBE,
        name: 'Regolith Eaters',
        tags: [Tag.MICROBE, Tag.SCIENCE],
        type: CardType.ACTIVE
    },
    {
        action: {
            text:
                'Action: Add 1 microbe to this card, or remove 2 microbes to raise temperature 1 step.'
        },
        cost: 8,
        deck: Deck.BASIC,
        storedResourceType: Resource.MICROBE,
        name: 'GHG Producing Bacteria',
        text: 'Requires 4% oxygen.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 4
        },
        tags: [Tag.MICROBE, Tag.SCIENCE],
        type: CardType.ACTIVE
    },
    {
        action: {text: 'Action: Remove 1 microbe from any card to add 1 to this card.'},
        cost: 9,
        deck: Deck.BASIC,
        storedResourceType: Resource.MICROBE,
        name: 'Ants',
        text: 'Requires 4% oxygen. 1 VP per 2 microbes on this card.',
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
        text: 'Raise your terraform rating 2 steps.',
        tags: [Tag.EVENT],
        type: CardType.EVENT
    },
    {
        increaseTerraformRating: 2,
        cost: 31,
        deck: Deck.BASIC,
        name: 'Nitrogen-Rich Asteroid',
        text:
            'Raise your terraforming rating 2 steps and temperature 1 step. Increase your plant production 1 step, or 4 steps if you have 3 plant tags.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: {[Parameter.TEMPERATURE]: 1, [Parameter.TERRAFORM_RATING]: 2}
        // get increaseProduction() {
        //     if (!this.state) return [Resource.PLANT];

        //     if (this.state.tags.filter(tag => tag === Tag.PLANT).length < 3)
        //         return [Resource.PLANT];

        //     return [Resource.PLANT, Resource.PLANT, Resource.PLANT, Resource.PLANT];
        // }
    },
    {
        effect: {text: 'Effect: When any city tile is placed, gain 2 MC'},
        cost: 8,
        deck: Deck.BASIC,
        name: 'Rover Construction',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE,
        victoryPoints: 1
        // condition: condition => condition.tileType === TileType.CITY,
        // effect: effect => {
        //     effect.gainResource(Resource.MEGACREDIT, 2);
        // }
    },
    {
        cost: 31,
        deck: Deck.BASIC,
        name: 'Deimos Down',
        text: 'Raise temperature 3 steps and gain 4 steel. Remove up to 8 plants from any player.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: {[Parameter.TEMPERATURE]: 3},
        removeAnyResource: {[Resource.PLANT]: 8}
    },
    {
        cost: 30,
        deck: Deck.BASIC,
        name: 'Asteroid Mining',
        text: 'Increase your titanium production 2 steps.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: {[Resource.TITANIUM]: 2}
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Food Factory',
        text: 'Decrease your plant production 1 step and increase your MC production 4 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        decreaseProduction: {[Resource.PLANT]: 1},
        increaseProduction: {[Resource.MEGACREDIT]: 4}
    },
    {
        cost: 6,
        deck: Deck.BASIC,
        name: 'Archaebacteria',
        text: 'It must be -18°C or colder. Increase your plant production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            max: -18
        },
        tags: [Tag.MICROBE],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.PLANT]: 1}
    },
    {
        cost: 6,
        deck: Deck.BASIC,
        name: 'Carbonate Processing',
        text: 'Decrease your energy production 1 step and increase your heat production 3 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.HEAT]: 3}
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Natural Preserve',
        text:
            'Oxygen must be 4% or less. Place this tile NEXT TO NO OTHER TILE. Increase your MC production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 4
        },
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        tilePlacements: [t(TileType.NATURAL_PRESERVE, PlacementRequirement.ISOLATED, true)],
        increaseProduction: {[Resource.MEGACREDIT]: 1}
    },
    {
        cost: 10,
        deck: Deck.BASIC,
        name: 'Nuclear Power',
        text: 'Decrease your MC production 2 steps and increase your energy production 3 steps.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.MEGACREDIT]: 2},
        increaseProduction: {[Resource.ENERGY]: 2}
    },
    {
        cost: 8,
        deck: Deck.CORPORATE,
        name: 'Lightning Harvest',
        text:
            'Requires 3 science tags. Increase your energy production and your MC production 1 step each.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.ENERGY]: 1, [Resource.MEGACREDIT]: 1}
    },
    {
        cost: 10,
        deck: Deck.BASIC,
        name: 'Algae',
        text: 'Requires 5 ocean tiles. Gain 1 plant and increase your plant production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 5
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        gainResource: {[Resource.PLANT]: 1},
        increaseProduction: {[Resource.PLANT]: 2}
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Adapted Lichen',
        text: 'Increase your plant production 1 step.',
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.PLANT]: 1}
    },
    {
        action: {text: 'Action: Add 1 microbe to this card.'},
        cost: 4,
        deck: Deck.CORPORATE,
        storedResourceType: Resource.MICROBE,
        name: 'Tardigrades',
        text: '1 VP per 4 microbes on this card.',
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
        text: 'Remove up to 2 animals or 5 plants from any player.',
        tags: [Tag.EVENT, Tag.MICROBE],
        type: CardType.EVENT,
        removeAnyResourceOption: {[Resource.ANIMAL]: 2, [Resource.PLANT]: 5}
    },
    {
        cost: 12,
        deck: Deck.CORPORATE,
        name: 'Miranda Resort',
        text: 'Increase your MC production 1 step for each Earth tag you have.',
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
        action: {text: 'Action: Add 1 animal to this card.'},
        cost: 9,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Fish',
        text:
            'Requires 2°C or warmer. Decrease any plant production 1 step. 1 VP for each animal on this card.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 2
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        decreaseAnyProduction: {[Resource.ANIMAL]: 1},
        get victoryPoints() {
            return this.resources.length;
        }
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Lake Marineris',
        text: 'Requires 0°C or warmer. Place 2 ocean tiles.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 0
        },
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        tilePlacements: [
            t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN),
            t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)
        ]
    },
    {
        action: {text: 'Action: Add 1 animal to this card.'},
        cost: 6,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Small Animals',
        text:
            'Requires 6% oxygen. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 6
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        decreaseAnyProduction: {[Resource.PLANT]: 1},
        get victoryPoints() {
            return Math.floor(this.resources.length / 2);
        }
    },
    {
        cost: 17,
        deck: Deck.BASIC,
        name: 'Kelp Farming',
        text:
            'Requires 6 ocean tiles. Increase your MC production 2 steps and your plant production 3 steps. Gain 2 plants.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 6
        },
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.MEGACREDIT]: 2, [Resource.PLANT]: 3},
        gainResource: {[Resource.PLANT]: 2}
    },
    {
        cost: 4,
        deck: Deck.CORPORATE,
        name: 'Mine',
        text: 'Increase your steel production 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.STEEL]: 1}
    },
    {
        cost: 15,
        deck: Deck.CORPORATE,
        name: 'Vesta Shipyard',
        text: 'Increase your titanium production 1 step.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.TITANIUM]: 1}
    },
    {
        cost: 32,
        deck: Deck.BASIC,
        name: 'Beam From a Thorium Asteroid',
        text:
            'Requires a Jovian tag. Increase your heat production and energy production 3 steps each.',
        requiredTags: {[Tag.JOVIAN]: 1},
        tags: [Tag.POWER, Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.HEAT]: 3, [Resource.ENERGY]: 3}
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Mangrove',
        text:
            'Requires +4°C or warmer. Place a Greenery tile ON AN AREA RESERVED FOR OCEAN and raise oxygen 1 step. Disregard normal placement restrictions for this.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 4
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        tilePlacements: [t(TileType.GREENERY, PlacementRequirement.RESERVED_FOR_OCEAN, true)]
    },
    {
        cost: 13,
        deck: Deck.BASIC,
        name: 'Trees',
        text: 'Requires -4°C or warmer. Increase your plant production 3 steps. Gain 1 plant.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -4
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.PLANT]: 3},
        gainResource: {[Resource.PLANT]: 1}
    },
    {
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Great Escarpment Consortium',
        text:
            'Requires that you have steel production. Decrease any steel production 1 step and increase your own 1 step',
        tags: [],
        type: CardType.AUTOMATED,
        decreaseAnyProduction: {[Resource.STEEL]: 1},
        increaseProduction: {[Resource.STEEL]: 1},
        requiredProduction: Resource.STEEL
    },
    {
        cost: 5,
        deck: Deck.CORPORATE,
        name: 'Mineral Deposit',
        text: 'Gain 5 steel.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        gainResource: {[Resource.STEEL]: 5}
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Mining Expedition',
        text: 'Raise oxygen 1 step. Remove 2 plants from any player. Gain 2 steel.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        increaseParameter: {[Parameter.OXYGEN]: 1},
        removeAnyResource: {[Resource.PLANT]: 2},
        gainResource: {[Resource.STEEL]: 2}
    },
    {
        cost: 4,
        deck: Deck.CORPORATE,
        name: 'Mining Area',
        text:
            'Place [the mining] tile on an area with a steel or titanium placement bonus, adjacent to another of your tiles. Increase your production of that resource 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        tilePlacements: [
            t(TileType.MINING, PlacementRequirement.STEEL_OR_TITANIUM_PLAYER_ADJACENT, true)
        ]
        // get increaseProduction() {
        //     if (!this.state) return [];

        //     const tile = this.state.tiles.find(tile => tile.type === TileType.MINING);
        //     if (!tile) return [];

        //     const {bonus} = tile.cell;

        //     return bonus.includes(Resource.STEEL)
        //         ? {[Resource.STEEL]: 1}
        //         : {[Resource.TITANIUM]: 1};
        // }
    },
    {
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Building Industries',
        text: 'Decrease your energy production 1 step and increase your steel production 2 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.STEEL]: 2}
    },
    {
        cost: 1,
        deck: Deck.CORPORATE,
        name: 'Land Claim',
        text: 'Place your marker on a non-reserved area. Only you may place a tile here',
        tags: [Tag.EVENT],
        type: CardType.EVENT
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Mining Rights',
        text:
            'Place [the mining] tile on an area with a steel or titanium placement bonus. Increase that production 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.MINING, PlacementRequirement.STEEL_OR_TITANIUM, true)]
    },
    {
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Sponsors',
        text: 'Increase your MC production 2  steps.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.MEGACREDIT]: 2}
    },
    {
        action: {text: 'Action: Spend 1 plant or 1 steel to gain 7 MC'},
        cost: 17,
        deck: Deck.CORPORATE,
        name: 'Electro Catapult',
        text: 'Oxygen must be 8% or less. Decrease your energy production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 8
        },
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE,
        victoryPoints: 1,
        decreaseProduction: {[Resource.ENERGY]: 1}
    },
    {
        effect: {text: 'Effect: when you play a card, you pay 2 MC less for it.'},
        cost: 23,
        deck: Deck.CORPORATE,
        name: 'Earth Catapult',
        tags: [Tag.EARTH],
        type: CardType.ACTIVE,
        victoryPoints: 2
    },
    {
        effect: {
            text:
                'Effect: Each titanium you have is worth 1MC extra. Each steel you have is worth 1 MC extra.'
        },
        cost: 9,
        deck: Deck.CORPORATE,
        name: 'Advanced Alloys',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE
    },
    {
        action: {text: 'Action: Add an animal to this card.'},
        cost: 10,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Birds',
        text:
            'Requires 13% oxygen. Decrease any plant production 2 steps. 1 VP for each animal on this card',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 13
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        decreaseAnyProduction: {[Resource.PLANT]: 1},
        get victoryPoints() {
            return this.resources.length;
        }
    },
    {
        effect: {
            text:
                'Effect: When you play a science tag, including this, you may discard a card from hand to draw a card.'
        },
        cost: 8,
        deck: Deck.CORPORATE,
        name: 'Mars University',
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 1
        // condition: condition => condition.tag === Tag.SCIENCE,
        // effect: effect => effect.discardThenDraw()
    },
    {
        effect: {
            text:
                'Effect: When you play a plant, microbe, or an animal tag, including this, gain 1 plant or add 1 resource TO THAT CARD.'
        },
        cost: 9,
        deck: Deck.CORPORATE,
        name: 'Viral Enhancers',
        tags: [Tag.MICROBE, Tag.SCIENCE],
        type: CardType.ACTIVE
        // condition: condition =>
        //     !!condition.tag && [Tag.PLANT, Tag.MICROBE, Tag.ANIMAL].includes(condition.tag),
        // effect: effect =>
        //     effect.gainResourceOption([[Resource.PLANT], [Resource.MICROBE], [Resource.MICROBE]])
    },
    {
        cost: 23,
        deck: Deck.BASIC,
        name: 'Towing a Comet',
        text: 'Gain 2 plants. Raise oxygen level 1 step and place an ocean tile.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        gainResource: {[Resource.PLANT]: 2},
        increaseParameter: {[Parameter.OXYGEN]: 1},
        tilePlacements: [t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)]
    },
    {
        action: {text: 'Action: Spend 7MC to increase your energy production 1 step.'},
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
        text: 'Increase your energy production 1 step and gain 2 titanium.',
        tags: [Tag.POWER, Tag.SCIENCE, Tag.SPACE],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.ENERGY]: 1},
        gainResource: {[Resource.TITANIUM]: 2}
    },
    {
        cost: 23,
        deck: Deck.BASIC,
        name: 'Ice Asteroid',
        text: 'Place 2 ocean tiles.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        tilePlacements: [
            t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN),
            t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)
        ]
    },
    {
        effect: {text: 'Effect: When you play a space card, you pay 2 MC less for it'},
        cost: 13,
        deck: Deck.CORPORATE,
        name: 'Quantum Extractor',
        requiredTags: {[Tag.SCIENCE]: 4},
        tags: [Tag.POWER, Tag.SCIENCE],
        type: CardType.ACTIVE,
        text: 'Increase your energy production 4 steps.',
        increaseProduction: {[Resource.ENERGY]: 4}
    },
    {
        cost: 36,
        deck: Deck.BASIC,
        name: 'Giant Ice Asteroid',
        text:
            'Raise temperature 2 steps and place 2 ocean tiles. Remove up to 6 plants from any plyer.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        tilePlacements: [
            t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN),
            t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)
        ],
        increaseParameter: {[Parameter.TEMPERATURE]: 2},
        removeAnyResource: {[Resource.PLANT]: 6}
    },
    {
        cost: 20,
        deck: Deck.BASIC,
        name: 'Ganymede Colony',
        text:
            'Place a city tile ON THE RESERVED AREA [for Ganymede Colony]. 1 VP per Jovian tag you have.',
        tags: [Tag.CITY, Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.CITY, PlacementRequirement.GANYMEDE, true)],
        get victoryPoints() {
            if (!this.state) return [];
            return this.state.tags.filter(tag => tag === Tag.JOVIAN).length;
        }
    },
    {
        cost: 24,
        deck: Deck.CORPORATE,
        name: 'Callisto Penal Mines',
        text: 'Increase your MC production 3 steps.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: {[Resource.MEGACREDIT]: 3}
    },
    {
        cost: 17,
        deck: Deck.BASIC,
        name: 'Giant Space Mirror',
        text: 'Increase your energy production 3 steps.',
        tags: [Tag.POWER, Tag.SPACE],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.ENERGY]: 3}
    },
    {
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
        text:
            'Decrease your energy production 1 step and increase your MC production 4 steps. Place [the commercial district] tile. 1 VP PER ADJACENT CITY TILE.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.MEGACREDIT]: 4}
    },
    {
        cost: 9,
        deck: Deck.CORPORATE,
        name: 'Robotic Workforce',
        text: 'Duplicate only the production box of one of your building cards.',
        tags: [Tag.SCIENCE],
        type: CardType.AUTOMATED
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Grass',
        text: 'Requires -16°C or warmer. Increase your plant production 1 step. Gain 3 plants.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -16
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.PLANT]: 1},
        gainResource: {[Resource.PLANT]: 3}
    },
    {
        cost: 6,
        deck: Deck.BASIC,
        name: 'Heather',
        text: 'Requires -14°C or warmer. Increase your plant production 1 step. Gain 1 plant.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -14
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.PLANT]: 1},
        gainResource: {[Resource.PLANT]: 1}
    },
    {
        cost: 7,
        deck: Deck.BASIC,
        name: 'Peroxide Power',
        text: 'Decrease your MC production 1 step and increase your energy production 2 steps.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.MEGACREDIT]: 1},
        increaseProduction: {[Resource.ENERGY]: 2}
    },
    {
        cost: 11,
        deck: Deck.CORPORATE,
        name: 'Research',
        text: 'Counts as playing 2 science cards. Draw 2 cards.',
        tags: [Tag.SCIENCE, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        gainResource: {[Resource.CARD]: 2}
    },
    {
        cost: 12,
        deck: Deck.CORPORATE,
        name: 'Gene Repair',
        text: 'Requires 3 science tags. Increase your MC production 2 steps.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: {[Resource.MEGACREDIT]: 2}
    },
    {
        cost: 41,
        deck: Deck.CORPORATE,
        name: 'Io Mining Industries',
        text:
            'Increase your titanium production 2 steps and your MC production 2 steps. 1 VP per Jovian tag you have.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.TITANIUM]: 2, [Resource.MEGACREDIT]: 2}
    },
    {
        cost: 10,
        deck: Deck.BASIC,
        name: 'Bushes',
        text: 'Requires -10°C or warmer. Increase your plant production 2 steps. Gain 2 plants.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -10
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.PLANT]: 2},
        gainResource: {[Resource.PLANT]: 2}
    },
    {
        effect: {text: 'Effect: When you play a space card, you pay 2 MC less for it.'},
        cost: 8,
        deck: Deck.CORPORATE,
        name: 'Mass Converter',
        text: 'Requires 5 science tags. Increase your energy production 6 steps.',
        requiredTags: {[Tag.SCIENCE]: 5},
        tags: [Tag.POWER, Tag.SCIENCE],
        type: CardType.ACTIVE,
        increaseProduction: {[Resource.ENERGY]: 6}
    },
    {
        action: {text: 'Action: Spend 6 energy to add a science resource to this card.'},
        cost: 12,
        deck: Deck.CORPORATE,
        storedResourceType: Resource.SCIENCE,
        name: 'Physics Complex',
        text: '2 VP for each science resource on this card.',
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
        text: 'Gain 1 plant for each city tile in play.',
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
        text: 'Place [the nuclear zone] tile and raise the temperature 2 steps.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED,
        victoryPoints: -2,
        increaseParameter: {[Parameter.TEMPERATURE]: 2}
    },
    {
        cost: 13,
        deck: Deck.CORPORATE,
        name: 'Tropical Resort',
        text: 'Decrease your heat production 2 steps and increase your MC production 3 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        decreaseProduction: {[Resource.HEAT]: 2},
        increaseProduction: {[Resource.MEGACREDIT]: 3}
    },
    {
        cost: 12,
        deck: Deck.CORPORATE,
        name: 'Toll Station',
        text: 'Increase your MC production 1 step for each space tag your OPPONENTS have.',
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
        text: 'Decrease your MC production 1 step and increase your energy production 1 step.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.MEGACREDIT]: 1},
        increaseProduction: {[Resource.ENERGY]: 1}
    },
    {
        action: {text: 'Action: Spend 4 energy to gain 1 steel and increase oxygen 1 step.'},
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
        text:
            'Increase your energy production 1 step for each power tag you have, including this.)',
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        get increaseProduction() {
            if (!this.state) return [];
            return this.state.tags.filter(tag => tag === Tag.POWER).fill(Resource.ENERGY);
        }
    },
    {
        action: {text: 'Action: Spend 4 energy to gain 2 steel and increase oxygen 1 step.'},
        cost: 15,
        deck: Deck.BASIC,
        name: 'Steelworks',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
    },
    {
        action: {text: 'Action: Spend 4 energy to gain 1 titanium and increase oxygen 1 step.'},
        cost: 13,
        deck: Deck.BASIC,
        name: 'Ore Processor',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
    },
    {
        effect: {text: 'Effect: When you play an Earth tag, you pay 3 MC less for it.'},
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
        text: 'Increase your MC production 3 steps.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED
    },
    {
        cost: 8,
        deck: Deck.CORPORATE,
        name: 'Media Archives',
        text: 'Gain 1 MC for each event EVER PLAYED by all players',
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
        text:
            'Requires 12% oxygen. Decrease your energy production 1 step and increase your MC production 4 steps. Gain 2 plants and place a city tile.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 12
        },
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.ENERGY]: 4}
    },
    {
        effect: {text: 'Effect: After you play an event card, you gain 3MC'},
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Media Group',
        tags: [Tag.EARTH],
        type: CardType.ACTIVE
        // condition: condition =>
        //     condition.card && condition.card.type === CardType.EVENT ? true : false,
        // effect: effect => effect.gainResource(Resource.MEGACREDIT, 3)
    },
    {
        action: {text: 'Action: Look at the top card and either buy it or discard it'},
        cost: 4,
        deck: Deck.CORPORATE,
        name: 'Business Network',
        text: 'Decrease your MC production 1 step.',
        tags: [Tag.EARTH],
        type: CardType.ACTIVE,
        decreaseProduction: {[Resource.MEGACREDIT]: 1}
    },
    {
        cost: 7,
        deck: Deck.CORPORATE,
        name: 'Business Contacts',
        text:
            'Look at the top 4 cards from the deck. Take 2 of them into hand and discard the other 2',
        tags: [Tag.EARTH, Tag.EVENT],
        type: CardType.EVENT
    },
    {
        increaseTerraformRating: 2,
        cost: 7,
        deck: Deck.CORPORATE,
        name: 'Bribed Committee',
        text: 'Raise your terraform rating 2 steps.',
        tags: [Tag.EARTH, Tag.EVENT],
        type: CardType.EVENT,
        victoryPoints: -2,
        increaseParameter: {[Parameter.TERRAFORM_RATING]: 2}
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Solar Power',
        text: 'Increase your energy production 1 step.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.ENERGY]: 1}
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Breathing Filters',
        text: 'Requires 7% oxygen.',
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
        text: 'Increase your plant production 1 step or your energy production 2 steps.',
        tags: [Tag.SCIENCE],
        type: CardType.AUTOMATED,
        increaseProductionOption: {[Resource.PLANT]: 1, [Resource.ENERGY]: 2}
    },
    {
        cost: 15,
        deck: Deck.BASIC,
        name: 'Artificial Lake',
        text: 'Requires -6°C or warmer. Place 1 ocean tile ON AN AREA NOT RESERVED FOR OCEAN.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -6
        },
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        tilePlacements: [t(TileType.OCEAN, PlacementRequirement.NOT_RESERVED_FOR_OCEAN, true)]
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Geothermal Power',
        text: 'Increase your energy production 2 steps.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.ENERGY]: 2}
    },
    {
        cost: 16,
        deck: Deck.BASIC,
        name: 'Farming',
        text:
            'Requires +4°C or warmer. Increase your MC production 2 steps and your plant production 2 steps. Gain 2 plants.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 4
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: {[Resource.MEGACREDIT]: 2, [Resource.PLANT]: 2},
        gainResource: {[Resource.PLANT]: 2}
    },
    {
        cost: 2,
        deck: Deck.BASIC,
        name: 'Dust Seals',
        text: 'Requires 3 or less ocean tiles.',
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
        text:
            'Decrease your energy production 1 step and increase your MC production 2 steps. Place a city tile ADJACENT TO AT LEAST 2 OTHER CITY TILES.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.CITY, PlacementRequirement.DOUBLE_CITY_ADJACENT, true)]
    },
    {
        cost: 1,
        deck: Deck.CORPORATE,
        name: 'Sabotage',
        text: 'Remove up to 3 titanium from any player, or 4 steel, or 7 MC.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        removeAnyResource: {[Resource.TITANIUM]: 3}
    },
    {
        cost: 4,
        deck: Deck.BASIC,
        name: 'Moss',
        text:
            'Requires 3 ocean tiles and that you lose 1 plant. Increase your plant production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 3
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        removeResources: {[Resource.PLANT]: 1}
    },
    {
        action: {text: 'Action: Spend 7 MC to increase your steel production 1 step.'},
        cost: 4,
        deck: Deck.CORPORATE,
        name: 'Industrial Center',
        text: 'Place [the Industrial Center] tile ADJACENT TO A CITY TILE.',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE,
        tilePlacements: [t(TileType.INDUSTRIAL_CENTER, PlacementRequirement.CITY_ADJACENT, true)]
    },
    {
        cost: 1,
        deck: Deck.CORPORATE,
        name: 'Hired Raiders',
        text: 'Steal up to 2 steel, or 3MC from any player.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        removeAnyResourceOption: {[Resource.STEEL]: 2, [Resource.MEGACREDIT]: 3}
    },
    {
        cost: 3,
        deck: Deck.CORPORATE,
        name: 'Hackers',
        text:
            'Decrease your energy production 1 step and any MC production 2 steps. Increase your MC production 2 steps.',
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: -1,
        decreaseProduction: {[Resource.ENERGY]: 1},
        decreaseAnyProduction: {[Resource.MEGACREDIT]: 2},
        increaseProduction: {[Resource.MEGACREDIT]: 2}
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'GHG Factories',
        text: 'Decrease your energy production 1 step and increase your heat production 4 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.HEAT]: 4}
    },
    {
        cost: 11,
        deck: Deck.BASIC,
        name: 'Subterranean Reservoir',
        text: 'Place 1 ocean tile.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)]
    },
    {
        effect: {
            text:
                'Effect: When you play an animal or a plant tag (including these 2), add an animal to this card.'
        },
        cost: 12,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Ecological Zone',
        text:
            'Requires that you have a greenery tile. Place [the Ecological Zone] tile ADJACENT TO ANY GREENERY TILE. 1 VP per 2 animals on this card.',
        tags: [Tag.ANIMAL, Tag.PLANT],
        type: CardType.ACTIVE,
        // condition: condition =>
        //     !!condition.tag && [Tag.ANIMAL, Tag.PLANT].includes(condition.tag) ? true : false,
        // effect(effect) {
        //     effect.gainResource(Resource.ANIMAL, 1, this);
        // },
        tilePlacements: [t(TileType.ECOLOGICAL_ZONE, PlacementRequirement.GREENERY_ADJACENT, true)]
    },
    {
        cost: 13,
        deck: Deck.BASIC,
        name: 'Zeppelins',
        text: 'Requires 5% oxygen. Increase your MC production 1 step for each city tile ON MARS.',
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
        text:
            'Requires 4% oxygen. Increase your plant production 1 step for every 2 microbe tags you have, including this.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 4
        },
        tags: [Tag.MICROBE],
        type: CardType.AUTOMATED
        // get increaseProduction() {
        //     if (!this.state) return [];
        //     const numMicrobeTags = this.state.tags.filter(tag => tag === Tag.MICROBE).length;

        //     return Array(Math.floor(numMicrobeTags / 2)).fill(Resource.PLANT);
        // }
    },
    {
        effect: {
            text:
                'Effect: When you play an animal, plant, or microbe tag, including this, add a microbe to this card.'
        },
        cost: 5,
        deck: Deck.BASIC,
        storedResourceType: Resource.MICROBE,
        name: 'Decomposers',
        text: 'Requires 3% oxygen. 1 VP per 3 microbes on this card.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 3
        },
        tags: [Tag.MICROBE],
        type: CardType.ACTIVE,
        // condition: condition =>
        //     condition.tag && [Tag.ANIMAL, Tag.PLANT, Tag.MICROBE].includes(condition.tag)
        //         ? true
        //         : false,
        // effect(effect) {
        //     effect.gainResource(Resource.MICROBE, 1, this);
        // },
        get victoryPoints() {
            return Math.floor(this.resources / 3);
        }
    },
    {
        cost: 14,
        deck: Deck.BASIC,
        name: 'Fusion Power',
        text: 'Requires 2 power tags. Increase your energy production 3 steps.',
        requiredTags: {[Tag.POWER]: 2},
        tags: [Tag.BUILDING, Tag.POWER, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.ENERGY]: 3}
    },
    {
        action: {text: 'Action: Add a microbe to ANOTHER card.'},
        cost: 4,
        deck: Deck.BASIC,
        name: 'Symbiotic Fungus',
        text: 'Requires -14°C or warmer.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -14
        },
        tags: [Tag.MICROBE],
        type: CardType.ACTIVE
    },
    {
        action: {text: 'Action: Gain 1 plant or add 2 microbes to ANOTHER card.'},
        cost: 13,
        deck: Deck.BASIC,
        name: 'Extreme-Cold Fungus',
        text: 'It must be -10°C or colder.',
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
        text: 'Requires a plant tag, a microbe tag, and an animal tag.',
        requiredTags: {[Tag.PLANT]: 1, [Tag.MICROBE]: 1, [Tag.ANIMAL]: 1},
        tags: [Tag.ANIMAL, Tag.MICROBE, Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 3
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Great Dam',
        text: 'Requires 4 ocean tiles. Increase your energy production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 4
        },
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.ENERGY]: 2}
    },
    {
        cost: 8,
        deck: Deck.CORPORATE,
        name: 'Cartel',
        text: 'Increase your MC production 1 step for each Earth tag you have, including this.',
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
        text:
            'Decrease your energy production 2 steps. Increase your steel production 2 steps and your titanium production 1 step. Raise oxygen 2 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        increaseParameter: {[Parameter.OXYGEN]: 2},
        increaseProduction: {[Resource.STEEL]: 2, [Resource.TITANIUM]: 1},
        decreaseProduction: {[Resource.ENERGY]: 2}
    },
    {
        cost: 8,
        deck: Deck.BASIC,
        name: 'Wave Power',
        text: 'Requires 3 ocean tiles. Increase your energy production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 3
        },
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.ENERGY]: 1}
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Lava Flows',
        text:
            'Raise the temperature 2 steps and place this [the Lava Flow] tile ON EITHER THARSIS THOLUS, ASCRAEUS MONS, PAVONIS MONS OR ARSIA MONS.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        increaseParameter: {[Parameter.TEMPERATURE]: 2},
        tilePlacements: [t(TileType.LAVA_FLOW, PlacementRequirement.VOLCANIC, true)]
    },
    {
        cost: 4,
        deck: Deck.BASIC,
        name: 'Power Plant',
        text: 'Increase your energy production 1 step.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.ENERGY]: 1}
    },
    {
        cost: 20,
        deck: Deck.BASIC,
        name: 'Mohole Area',
        text:
            'Increase your heat production 4 steps. Place [the Mohole Area] tile ON AN AREA RESERVED FOR OCEAN.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.MOHOLE_AREA, PlacementRequirement.RESERVED_FOR_OCEAN, true)]
    },
    {
        cost: 36,
        deck: Deck.BASIC,
        name: 'Large Convoy',
        text:
            'Place an ocean tile and draw 2 cards. Gain 5 plants, or add 4 animals to ANOTHER card.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        victoryPoints: 2,
        tilePlacements: [t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)],
        gainResource: {[Resource.CARD]: 2},
        gainResourceOption: {[Resource.PLANT]: 5, [Resource.ANIMAL]: 4}
    },
    {
        cost: 7,
        deck: Deck.CORPORATE,
        name: 'Titanium Mine',
        text: 'Increase your titanium production 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.TITANIUM]: 1}
    },
    {
        cost: 18,
        deck: Deck.BASIC,
        name: 'Tectonic Stress Power',
        text: 'Requires 2 science tags. Increase your energy production 3 steps.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.ENERGY]: 3}
    },
    {
        cost: 8,
        deck: Deck.BASIC,
        name: 'Nitrophilic Moss',
        text:
            'Requires 3 ocean tiles and that you lose 2 plants. Increase your plant production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 3
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        removeResources: {[Resource.PLANT]: 2},
        increaseProduction: {[Resource.PLANT]: 2}
    },
    {
        effect: {text: 'Effect: When you place a greenery tile, add an animal to this card.'},
        cost: 12,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Herbivores',
        text:
            'Requires 8% oxygen. Add 1 animal to this card. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 8
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        // condition: condition => condition.tileType === TileType.GREENERY,
        // effect(effect) {
        //     effect.gainResource(Resource.ANIMAL, 1, this);
        // },
        get victoryPoints() {
            return Math.floor(this.resources.length / 2);
        }
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Insects',
        text:
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
        text: 'Add 1 resource to a card with at least 1 resource on it.',
        tags: [Tag.EVENT],
        type: CardType.EVENT
    },
    {
        effect: {text: 'Effect: when you play a card, you pay 2 MC less for it.'},
        cost: 14,
        deck: Deck.CORPORATE,
        name: 'Anti-Gravity Technology',
        text: 'Requires 7 science tags.',
        requiredTags: {[Tag.SCIENCE]: 7},
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 3
    },
    {
        cost: 3,
        deck: Deck.CORPORATE,
        name: 'Investment Loan',
        text: 'Decrease your MC production 1 step. Gain 10 MC.',
        tags: [Tag.EARTH, Tag.EVENT],
        type: CardType.EVENT,
        decreaseProduction: {[Resource.MEGACREDIT]: 1},
        gainResource: {[Resource.MEGACREDIT]: 10}
    },
    {
        cost: 2,
        deck: Deck.BASIC,
        name: 'Insulation',
        text:
            'Decrease your heat production any number of steps and increase your MC production the same number of steps.',
        tags: [],
        type: CardType.AUTOMATED
    },
    {
        effect: {
            text: 'Effect: Your global requirements are +2 or -2 steps, your choice in each case.'
        },
        cost: 12,
        deck: Deck.BASIC,
        name: 'Adaptation Technology',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        action: {text: 'Action: Spend 8 heat to increase your terraforming rating 1 step.'},
        cost: 3,
        deck: Deck.CORPORATE,
        name: 'Caretaker Contract',
        text: 'Requires 0°C or warmer.',
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
        text: 'It must be -14°C or colder. Increase your plant production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            max: -14
        },
        tags: [Tag.MICROBE, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.PLANT]: 2}
    },
    {
        effect: {
            text:
                'Effect: After you pay for a standard project, except selling patents, you gain 3 MC.'
        },
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Standard Technology',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE
        // condition: condition => condition.moveType === MoveType.STANDARD_PROJECT,
        // effect: effect => effect.gainResource(Resource.MEGACREDIT, 3)
    },
    {
        action: {
            text:
                'Action: Add 1 microbe to this card, or remove 3 microbes to increase your TR 1 step.'
        },
        cost: 11,
        deck: Deck.BASIC,
        storedResourceType: Resource.MICROBE,
        name: 'Nitrite Reducing Bacteria',
        text: 'Add 3 microbes to this card.',
        tags: [Tag.MICROBE],
        type: CardType.ACTIVE
    },
    {
        cost: 12,
        deck: Deck.BASIC,
        name: 'Industrial Microbes',
        text: 'Increase your energy production and your steel production 1 step each.',
        tags: [Tag.BUILDING, Tag.MICROBE],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.ENERGY]: 1, [Resource.STEEL]: 1}
    },
    {
        cost: 7,
        deck: Deck.BASIC,
        name: 'Lichen',
        text: 'Requires -24°C or warmer. Increase your plant production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -24
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.PLANT]: 1}
    },
    {
        cost: 5,
        deck: Deck.CORPORATE,
        name: 'Power Supply Consortium',
        text:
            'Requires 2 power tags. Decrease any energy production 1 step and increase your own 1 step.',
        requiredTags: {[Tag.POWER]: 2},
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        decreaseAnyProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.ENERGY]: 1}
    },
    {
        cost: 15,
        deck: Deck.BASIC,
        name: 'Convoy From Europa',
        text: 'Place 1 ocean tile and draw 1 card.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)],
        gainResource: {[Resource.CARD]: 1}
    },
    {
        cost: 7,
        deck: Deck.BASIC,
        name: 'Imported GHG',
        text: 'Increase your heat production 1 step and gain 3 heat.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseProduction: {[Resource.HEAT]: 1},
        gainResource: {[Resource.HEAT]: 3}
    },
    {
        increaseTerraformRating: 1,
        cost: 23,
        deck: Deck.BASIC,
        name: 'Imported Nitrogen',
        text:
            'Raise your TR 1 step and gain 4 plants. Add 3 microbes to ANOTHER card and 2 animals to ANOTHER card.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseParameter: {[Parameter.TERRAFORM_RATING]: 1},
        gainResource: {[Resource.PLANT]: 4, [Resource.MICROBE]: 3, [Resource.ANIMAL]: 2}
    },
    {
        cost: 3,
        deck: Deck.BASIC,
        name: 'Micro-Mills',
        text: 'Increase your heat production 1 step.',
        tags: [],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.HEAT]: 1}
    },
    {
        increaseTerraformRating: 3,
        cost: 20,
        deck: Deck.BASIC,
        name: 'Magnetic Field Generators',
        text:
            'Decrease your energy production 4 steps and increase your plant production 2 steps. Raise your TR 3 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.ENERGY]: 4},
        increaseProduction: {[Resource.PLANT]: 2},
        increaseParameter: {[Parameter.TERRAFORM_RATING]: 3}
    },
    {
        effect: {text: 'Effect: When you play a space card, you pay 2MC less for it.'},
        cost: 10,
        deck: Deck.BASIC,
        name: 'Shuttles',
        text:
            'Requires 5% oxygen. Decrease your energy production 1 step and increase your MC production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 5
        },
        tags: [Tag.SPACE],
        type: CardType.ACTIVE,
        victoryPoints: 1,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.MEGACREDIT]: 2}
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Import of Advanced GHG',
        text: 'Increase your heat production 2 steps.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        increaseProduction: {[Resource.HEAT]: 2}
    },
    {
        cost: 6,
        deck: Deck.BASIC,
        name: 'Windmills',
        text: 'Requires 7% oxygen. Increase your energy production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 7
        },
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.ENERGY]: 1}
    },
    {
        cost: 16,
        deck: Deck.BASIC,
        name: 'Tundra Farming',
        text:
            'Requires -6°C or warmer. Increase your plant production 1 step and your MC production 2 steps. Gain 1 plant.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -6
        },
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 2,
        increaseProduction: {[Resource.PLANT]: 1, [Resource.MEGACREDIT]: 2},
        gainResource: {[Resource.PLANT]: 1}
    },
    {
        cost: 26,
        deck: Deck.BASIC,
        name: 'Aerobraked Ammonia Asteroid',
        text:
            'Add 2 microbes to ANOTHER card. Increase your heat production 3 steps and your plant production 1 step.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT,
        gainResource: {[Resource.MICROBE]: 2},
        increaseProduction: {[Resource.HEAT]: 3, [Resource.PLANT]: 1}
    },
    {
        increaseTerraformRating: 1,
        cost: 5,
        deck: Deck.BASIC,
        name: 'Magnetic Field Dome',
        text:
            'Decrease your energy production 2 steps and increase your plant production 1 step. Raise your terraform rating 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.ENERGY]: 2},
        increaseProduction: {[Resource.PLANT]: 1},
        increaseParameter: {[Parameter.TERRAFORM_RATING]: 1}
    },
    {
        effect: {
            text:
                'Effect: When any city tile is placed, add an animal to this card.\nAnimals may not be removed from this card.'
        },
        cost: 10,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Pets',
        text: 'Add 1 animal to this card. 1 VP per 2 animals here.',
        tags: [Tag.ANIMAL, Tag.EARTH],
        type: CardType.ACTIVE
        // condition: condition => condition.tileType === TileType.CITY,
        // effect(effect) {
        //     effect.gainResource(Resource.ANIMAL, 1, this);
        // }
    },
    {
        text: 'Opponents may not remove your [plants, animals or microbes]',
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
        text:
            'Increase your MC production 2 steps. Place a greenery tile ON AN AREA RESERVED FOR OCEAN, disregarding normal placement restrictions, and increase oxygen 1 step.',
        tags: [Tag.BUILDING, Tag.PLANT],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.MEGACREDIT]: 2},
        tilePlacements: [t(TileType.GREENERY, PlacementRequirement.RESERVED_FOR_OCEAN)]
    },
    {
        cost: 10,
        deck: Deck.CORPORATE,
        name: 'Satellites',
        text: 'Increase your MC production 1 step for each space tag you have, including this one.',
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
        text: 'Requires -20°C or warmer. Increase your MC production 1 step and gain 2 plants.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -20
        },
        tags: [Tag.BUILDING, Tag.PLANT],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        increaseProduction: {[Resource.MEGACREDIT]: 1},
        gainResource: {[Resource.PLANT]: 2}
    },
    {
        action: {text: 'Action: Spend 3 energy to raise oxygen 1 step.'},
        cost: 12,
        deck: Deck.BASIC,
        name: 'Water Splitting Plant',
        text: 'Requires 2 ocean tiles.',
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
        text: 'Decrease any heat production 2 steps and increase your energy production 1 step.',
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: -1,
        decreaseAnyProduction: {[Resource.HEAT]: 2},
        increaseProduction: {[Resource.ENERGY]: 1}
    },
    {
        cost: 9,
        deck: Deck.BASIC,
        name: 'Soil Factory',
        text: 'Decrease your energy production 1 step and increase your plant production 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.PLANT]: 1}
    },
    {
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Fuel Factory',
        text:
            'Decreases your energy production 1 step and increase your titanium and your MC production 1 step each.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.TITANIUM]: 1, [Resource.MEGACREDIT]: 1}
    },
    {
        cost: 5,
        deck: Deck.BASIC,
        name: 'Ice cap Melting',
        text: 'Requires +2°C or warmer. Place 1 ocean tile.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: 2
        },
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)]
    },
    {
        cost: 11,
        deck: Deck.CORPORATE,
        name: 'Corporate Stronghold',
        text:
            'Decrease your energy production 1 step and increase your MC production 3 steps. Place a city tile.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED,
        victoryPoints: -2,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.MEGACREDIT]: 3},
        tilePlacements: [t(TileType.CITY, PlacementRequirement.CITY)]
    },
    {
        cost: 4,
        deck: Deck.BASIC,
        name: 'Biomass Combustors',
        text:
            'Requires 6% oxygen. Decrease any plant production 1 step and increase your energy production 2 steps.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 6
        },
        tags: [Tag.BUILDING, Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: -1,
        decreaseAnyProduction: {[Resource.PLANT]: 1},
        increaseProduction: {[Resource.ENERGY]: 2}
    },
    {
        action: {text: 'Action: Add 1 animal to this card.'},
        cost: 13,
        deck: Deck.BASIC,
        storedResourceType: Resource.ANIMAL,
        name: 'Livestock',
        text:
            'Requires 9% oxygen. Decrease your plant production 1 step and increase your MC production 2 steps. 1 VP for each animal on this card.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            min: 9
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE,
        decreaseProduction: {[Resource.PLANT]: 1},
        increaseProduction: {[Resource.MEGACREDIT]: 2},
        get victoryPoints() {
            return this.resources.length;
        }
    },
    {
        effect: {
            text:
                'Effect: When you play a science tag, including this, either add a science resource to this card, or remove a science resource from this card to draw a card.'
        },
        cost: 10,
        deck: Deck.CORPORATE,
        storedResourceType: Resource.SCIENCE,
        name: 'Olympus Conference',
        tags: [Tag.BUILDING, Tag.EARTH, Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 1
        // condition: condition => condition.tag === Tag.SCIENCE,
        // effect: effect =>
        //     effect.addOrRemoveOneResource(Resource.SCIENCE, () => {
        //         effect.drawCard();
        //     })
    },
    {
        cost: 6,
        deck: Deck.CORPORATE,
        name: 'Rad-Suits',
        text: 'Requires 2 cities in play. Increase your MC production 1 step.',
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        // canBePlayed: requirement =>
        //     requirement.tiles.filter(tile => tile.type === TileType.CITY).length > 2,
        // requirementFailedMessage: 'There must be two cities in play',
        increaseProduction: {[Resource.MEGACREDIT]: 1}
    },
    {
        action: {
            text:
                'Action: Spend 8 MC to place 1 ocean tile. STEEL MAY BE USED as if you were playing a building card.'
        },
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
        text:
            'Place an ocean tile. IF THERE ARE TILES ADJACENT TO THIS OCEAN TILE, YOU MAY REMOVE 4 MC FROM THE OWNER OF ONE OF THOSE TILES.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        victoryPoints: -1
    },
    {
        cost: 15,
        deck: Deck.BASIC,
        name: 'Energy Saving',
        text: 'Increase your energy production 1 step for each city tile in play.',
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
        text: 'Spend 5 heat to either gain 4 plants, or to add 2 animals to ANOTHER card.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        removeResources: {[Resource.HEAT]: 5},
        gainResourceOption: {[Resource.PLANT]: 4, [Resource.ANIMAL]: 2}
    },
    {
        cost: 8,
        deck: Deck.BASIC,
        name: 'Permafrost extraction',
        text: 'Requires -8°C or warmer. Place 1 ocean tile.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -8
        },
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        tilePlacements: [t(TileType.OCEAN, PlacementRequirement.RESERVED_FOR_OCEAN)]
    },
    {
        cost: 2,
        deck: Deck.CORPORATE,
        name: 'Invention Contest',
        text:
            'Look at the top 3 cards from the deck. Take 1 of them into hand and discard the other 2',
        tags: [Tag.EVENT, Tag.SCIENCE],
        type: CardType.EVENT
    },
    {
        cost: 15,
        deck: Deck.BASIC,
        name: 'Plantation',
        text: 'Requires 2 science tags. Place a greenery tile and raise oxygen 1 step.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [Tag.PLANT],
        type: CardType.AUTOMATED,
        tilePlacements: [t(TileType.GREENERY, PlacementRequirement.GREENERY)]
    },
    {
        action: {text: 'Action: Spend any amount of energy to gain that amount of MC.'},
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
        text: 'The next card you play this generation costs 8MC less.',
        tags: [Tag.EVENT],
        type: CardType.EVENT,
        victoryPoints: -1
    },
    {
        cost: 9,
        deck: Deck.CORPORATE,
        name: 'Lagrange Observatory',
        text: 'Draw 1 card.',
        tags: [Tag.SCIENCE, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1,
        gainResource: {[Resource.CARD]: 1}
    },
    {
        cost: 33,
        deck: Deck.CORPORATE,
        name: 'Terraforming Ganymede',
        text: 'Raise your TR 1 step for each Jovian tag you have, including this.',
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
        text: 'Increase your MC production 5 steps. 1 VP for every 3rd city in play.',
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.MEGACREDIT]: 5},
        get victoryPoints() {
            if (!this.state) return 0;
            const cities = this.state.tile.filter(tile => tile.type === TileType.CITY);

            return Math.floor(cities.length / 3);
        }
    },
    {
        action: {text: 'Action: Spend 2MC to draw a card.'},
        cost: 11,
        deck: Deck.CORPORATE,
        name: 'Restricted Area',
        text: 'Place [the restricted area] tile.',
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        tilePlacements: [t(TileType.RESTRICTED_AREA, PlacementRequirement.NON_RESERVED)]
    },
    {
        effect: {
            text:
                'Effect: Each time a city tile is placed, including this, increase your MC production 1 step.'
        },
        cost: 13,
        deck: Deck.BASIC,
        name: 'Immigrant City',
        text:
            'Decrease your energy production 1 step and decrease your MC production 2 steps. Place a city tile.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.ACTIVE,
        // condition: condition => condition.tileType === TileType.CITY,
        // effect: effect => effect.increaseProduction(Resource.MEGACREDIT, 1),
        decreaseProduction: {[Resource.ENERGY]: 1, [Resource.MEGACREDIT]: 2},
        tilePlacements: [t(TileType.CITY, PlacementRequirement.CITY)]
    },
    {
        cost: 3,
        deck: Deck.CORPORATE,
        name: 'Energy Tapping',
        text: 'Decrease any energy production 1 step and increase your own 1 step.',
        tags: [Tag.POWER],
        type: CardType.AUTOMATED,
        victoryPoints: -1,
        decreaseAnyProduction: {[Resource.ENERGY]: 1},
        increaseProduction: {[Resource.ENERGY]: 1}
    },
    {
        action: {
            removeResources: {[Resource.MEGACREDIT]: 10},
            increaseProduction: {[Resource.HEAT]: 2},
            text: 'Action: Spend 10 MC to increase your heat production 2 steps.'
        },
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
        text: 'Increase your heat production 7 steps.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED,
        increaseProduction: {[Resource.HEAT]: 7}
    },
    {
        cost: 5,
        deck: Deck.CORPORATE,
        name: 'Technology Demonstration',
        text: 'Draw 2 cards.',
        tags: [Tag.EVENT, Tag.SCIENCE, Tag.SPACE],
        type: CardType.EVENT,
        gainResource: {[Resource.CARD]: 2}
    },
    {
        increaseTerraformRating: 2,
        cost: 8,
        deck: Deck.BASIC,
        name: 'Rad-Chem Factory',
        text: 'Decrease your energy production 1 step. Raise your terraform rating 2 steps.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        decreaseProduction: {[Resource.ENERGY]: 1},
        increaseParameter: {[Parameter.TERRAFORM_RATING]: 2}
    },
    {
        cost: 4,
        deck: Deck.BASIC,
        name: 'Special Design',
        text:
            'The next card you play this generation is +2 or -2 in global requirements, your choice.',
        tags: [Tag.EVENT, Tag.SCIENCE],
        type: CardType.EVENT
    },
    {
        cost: 13,
        deck: Deck.CORPORATE,
        name: 'Medical Lab',
        text:
            'Increase your MC production 1 step for every 2 building tags you have, including this.',
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
        // get increaseProduction() {
        //     if (!this.state) return [];

        //     const buildingTags = this.state.tags(tag => tag === Tag.BUILDING);

        //     const half = Math.floor(buildingTags.length / 2);

        //     return Array(half).fill(Resource.MEGACREDIT);
        // }
    },
    {
        action: {text: 'Action: Draw 2 cards.'},
        cost: 21,
        deck: Deck.CORPORATE,
        name: 'AI Central',
        text: 'Requires 3 science tags to play. Decrease your energy production 1 step.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.BUILDING, Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 1,
        decreaseProduction: {[Resource.ENERGY]: 1}
    },
    {
        cost: 10,
        deck: Deck.PROMO,
        name: 'Small Asteroid',
        text:
            'Terraforming Mars PROMO. Increase temperature 1 step. Remove up to 2 plants from any player.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        action: {
            text:
                'Action: Reveal and place a SPACE OR BUILDING card here from hand, and place 2 resources on it, OR double the resources on a card here.\nEffect: Cards here may be played as if from hand with its cost reduced by the number of resources on it.'
        },
        cost: 7,
        deck: Deck.PROMO,
        name: 'Self-Replicating Robots',
        text: 'Requires 2 science tags.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [],
        type: CardType.ACTIVE
    },
    {
        cost: 12,
        deck: Deck.PROMO,
        name: 'Snow Algae',
        text:
            'Requires 2 oceans. Increase your plant production and your heat production 1 step each.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 2
        },
        tags: [Tag.PLANT],
        type: CardType.ACTIVE
    },
    {
        action: {text: 'Action: Add 1 animal to this card.'},
        cost: 7,
        deck: Deck.PROMO,
        storedResourceType: Resource.ANIMAL,
        name: 'Penguins',
        text: 'Requires 8 Oceans. 1 VP per animal on this card.',
        requiredGlobalParameter: {
            type: Parameter.OCEAN,
            min: 8
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE
    },
    {
        action: {
            text: 'Action: Add 1 floater to ANY card, or spend 1 floater here to draw a card.'
        },
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
        requiredResources: {[Resource.FLOATER]: 5},
        text: 'Requires that you have 5 floaters. Gain 1 MC for each city tile in play.',
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
        text: 'Raise Venus 1 step. Add 3 floaters to ANY VENUS CARD.',
        tags: [Tag.EVENT, Tag.VENUS],
        type: CardType.EVENT
    },
    {
        cost: 10,
        deck: Deck.VENUS,
        name: 'Atalanta Planitia Lab',
        text: 'Requires 3 science tags. Draw 2 cards.',
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
        text:
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
        text: 'Raise Venus 1 step. Remove up to 4 MC from a player WITH A VENUS TAG IN PLAY.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        cost: 8,
        deck: Deck.VENUS,
        name: 'Corroder Suits',
        text: 'Increase your MC production 2 steps. Add 1 resource to ANY VENUS CARD.',
        tags: [Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        cost: 15,
        deck: Deck.VENUS,
        name: 'Dawn City',
        text:
            'Requires 4 science tags. Decrease your energy production 1 step. Increase your titanium production 1 step. Place a city tile ON THE RESERVED AREA.',
        requiredTags: {[Tag.SCIENCE]: 4},
        tags: [Tag.CITY, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 3
    },
    {
        action: {
            text:
                'Action: Add 1 floater to this card, or spend 1 floater here to increase your energy production 1 step.'
        },
        cost: 11,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Deuterium Export',
        tags: [Tag.POWER, Tag.SPACE, Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        action: {
            text:
                'Action: Add 1 floater to ANY card. Effect: When playing a Venus tag, floaters here may be used as payment, and are worth 3 MC each'
        },
        cost: 11,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Dirigibles',
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        action: {
            text:
                'Action: Add 1 floater to this card, or remove 2 floaters here to raise Venus 1 step.'
        },
        cost: 21,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Extractor Balloons',
        text: 'Add 3 floaters to this card.',
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        action: {text: 'Action: Add 1 microbe to ANY card.'},
        cost: 3,
        deck: Deck.VENUS,
        storedResourceType: Resource.MICROBE,
        name: 'Extremophiles',
        text: 'Requires 2 science tags. 1 VP for per 3 microbes on this card.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [Tag.MICROBE, Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        action: {text: 'Action: Spend 2 MC to add 1 floater to ANY card.'},
        cost: 5,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Floating Habs',
        text: 'Requires 2 science tags. 1 VP per 2 floaters on this card.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        action: {
            text:
                'Action: Spend 2 MC to add a floater to this card, or spend 2 floaters here to increase Venus 1 step.'
        },
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
        text:
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
        text: 'Raise Venus 1 step. Increase your heat production 3 steps.',
        tags: [Tag.EVENT, Tag.SPACE, Tag.VENUS],
        type: CardType.EVENT
    },
    {
        // venus: 3,
        cost: 27,
        deck: Deck.VENUS,
        name: 'Giant Solar Shade',
        text: 'Raise Venus 3 steps.',
        tags: [Tag.SPACE, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        cost: 20,
        deck: Deck.VENUS,
        name: 'Gyropolis',
        text:
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
        text: 'Raise Venus 1 step. Add 1 floater to A VENUS CARD for each Jovian tag you have.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        cost: 17,
        deck: Deck.VENUS,
        name: 'Io Sulphur Research',
        text: 'Draw 1 card, or draw 3 cards if you have at least 3 Venus tags.',
        tags: [Tag.JOVIAN, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        cost: 5,
        deck: Deck.VENUS,
        name: 'Ishtar Mining',
        text: 'Requires Venus 8%. Increase your titanium production 1 step.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 8
        },
        tags: [Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        action: {
            text:
                'Action: Spend 1 titanium to add 2 floaters to this card, or remove 2 floaters here to raise Venus 1 step.'
        },
        cost: 12,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Jet Stream Microscrappers',
        tags: [Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        action: {
            text:
                'Action: Add 1 floater to this card, or spend 1 floater here to raise your MC production 1 step.'
        },
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
        text:
            'Increase your MC production 1 step for each Earth tag you have, including this. Place a city tile ON THE RESERVED AREA.',
        tags: [Tag.CITY, Tag.EARTH, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        cost: 8,
        deck: Deck.VENUS,
        name: 'Luxury Foods',
        text: 'Requires Venus, Earth and Jovian tags.',
        requiredTags: {[Tag.VENUS]: 1, [Tag.EARTH]: 1, [Tag.JOVIAN]: 1},
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        action: {text: 'Action: Add 1 resource to ANOTHER VENUS CARD.'},
        cost: 18,
        deck: Deck.VENUS,
        name: 'Maxwell Base',
        text:
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
        text: 'Requires Venus, Earth and Jovian tags. Increase your steel production 2 steps.',
        requiredTags: {[Tag.VENUS]: 1, [Tag.EARTH]: 1, [Tag.JOVIAN]: 1},
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED
    },
    {
        // venus: 1,
        cost: 7,
        deck: Deck.VENUS,
        name: 'Neutralizer Factory',
        text: 'Requires Venus 10%. Increase Venus 1 step.',
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
        text: 'Requires Venus, Earth, and Jovian tags. Increase your TR 2 steps.',
        requiredTags: {[Tag.VENUS]: 1, [Tag.EARTH]: 1, [Tag.JOVIAN]: 1},
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED
    },
    {
        // venus: 2,
        cost: 26,
        deck: Deck.VENUS,
        name: 'Orbital Reflectors',
        text: 'Raise Venus 2 steps. Increase your heat production 2 steps.',
        tags: [Tag.SPACE, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        action: {
            text:
                'Action: Spend 6 MC to add an asteroid resource to this card (TITANIUM MAY BE USED), or spend 1 resource from this card to increase VENUS 1 step.'
        },
        cost: 6,
        deck: Deck.VENUS,
        name: 'Rotator Impacts',
        text: 'Venus must be 14% or lower.',
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
        text: 'Requires Venus and Earth tag. Increase your MC production 3 steps.',
        requiredTags: {[Tag.VENUS]: 1, [Tag.EARTH]: 1},
        tags: [Tag.EARTH, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        cost: 7,
        deck: Deck.VENUS,
        name: 'Solarnet',
        text: 'Requires Venus, Earth, and Jovian tags. Draw 2 cards.',
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
        text: 'Venus must be 10% or lower. Raise Venus 2 steps.',
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
        text: 'Discard 1 card from hand and THEN draw 3 cards. All OPPONENTS draw 1 card.',
        tags: [Tag.EARTH, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        action: {text: 'Action: Add 2 floaters to ANY VENUS CARD.'},
        cost: 22,
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Stratopolis',
        text:
            'Requires 2 science tags. Increase your MC production 2 steps. Place a city tile on THE RESERVED AREA. 1 VP per 3 floaters on this card.',
        requiredTags: {[Tag.SCIENCE]: 2},
        tags: [Tag.CITY, Tag.VENUS],
        type: CardType.ACTIVE
    },
    {
        action: {text: 'Action: Add 1 animal to this card.'},
        cost: 12,
        deck: Deck.VENUS,
        storedResourceType: Resource.ANIMAL,
        name: 'Stratospheric Birds',
        text:
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
        text:
            'Increase Venus 1 step. Increase your MC production 1 step for each Venus tag you have, including this.',
        tags: [Tag.SPACE, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        action: {
            text:
                'Action: Add 1 microbe to this card, or spend any number of microbes here to gain the triple amount of MC.'
        },
        cost: 6,
        deck: Deck.VENUS,
        storedResourceType: Resource.MICROBE,
        name: 'Sulphur-Eating Bacteria',
        text: 'Requires Venus 6%.',
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
        text: 'Requires that you have at least 25 TR. Increase your MC production 4 steps.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED
    },
    {
        action: {
            text:
                'Action: Add 1 microbe to ANY VENUS CARD, or spend 2 microbes here to raise Venus 1 step.'
        },
        cost: 9,
        deck: Deck.VENUS,
        storedResourceType: Resource.MICROBE,
        name: 'Thermophiles',
        text: 'Requires Venus 6%.',
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
        text: 'Raise Venus 1 step.',
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        cost: 4,
        deck: Deck.VENUS,
        name: 'Venus Governor',
        text: 'Requires 2 Venus tags. Increase your MC production 2 steps.',
        requiredTags: {[Tag.VENUS]: 2},
        tags: [Tag.VENUS, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        action: {text: 'Action: Decrease your energy production 1 step to raise Venus 1 step.'},
        cost: 7,
        deck: Deck.VENUS,
        name: 'Venus Magnetizer',
        text: 'Requires Venus 10%',
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
        text:
            'Raise Venus 1 step. Increase your plant production 1 step. Add 2 microbes to ANOTHER card.',
        tags: [Tag.PLANT, Tag.VENUS],
        type: CardType.AUTOMATED
    },
    {
        effect: {text: 'Effect: When you play a Venus tag, you pay 2 MC less for it.'},
        cost: 9,
        deck: Deck.VENUS,
        name: 'Venus Waystation',
        tags: [Tag.SPACE, Tag.VENUS],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        effect: {
            text: 'Effect: When you play a science tag, including this, add 1 animal to this card.'
        },
        cost: 15,
        deck: Deck.VENUS,
        storedResourceType: Resource.ANIMAL,
        name: 'Venusian Animals',
        text: 'Requires Venus 18%. 1 VP for each animal on this card.',
        requiredGlobalParameter: {
            type: Parameter.VENUS,
            min: 18
        },
        tags: [Tag.ANIMAL, Tag.SCIENCE, Tag.VENUS],
        type: CardType.ACTIVE
        // condition: condition => condition.tag === Tag.VENUS,
        // effect(effect) {
        //     effect.gainResource(Resource.ANIMAL, 1, this);
        // }
    },
    {
        action: {text: 'Action: Add 1 microbe to this card.'},
        cost: 5,
        deck: Deck.VENUS,
        name: 'Venusian Insects',
        text: 'Requires Venus 12%. 1 VP per 2 microbes on this card.',
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
        text:
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
        requiredResources: {[Resource.FLOATER]: 3},
        text:
            'Requires that you have 3 floaters. Increase your MC production 2 steps. Add 2 floaters to ANOTHER card.',
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 0,
        deck: Deck.COLONIES,
        name: 'Air Raid',
        removeResources: {[Resource.FLOATER]: 1},
        text: 'Requires that you lose 1 floater. Steal 5 MC from any player.',
        tags: [Tag.EVENT],
        type: CardType.EVENT
    },
    {
        action: {
            text:
                'Action: Add 1 floater to this card, or spend 1 floater here to gain 2 titanium, or 3 energy, or 4 heat.'
        },
        cost: 15,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Atmo Collectors',
        text: 'Add 2 floaters to ANY card.',
        tags: [],
        type: CardType.ACTIVE
    },
    {
        cost: 13,
        deck: Deck.COLONIES,
        name: 'Community Services',
        text: 'Increase your MC production 1 step per CARD WITH NO TAGS, including this.',
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 5,
        deck: Deck.COLONIES,
        name: 'Conscription',
        text: 'Requires 2 Earth tags. The next card you play this generation costs 16 MC less.',
        requiredTags: {[Tag.EARTH]: 2},
        tags: [Tag.EARTH, Tag.EVENT],
        type: CardType.EVENT,
        victoryPoints: -1
    },
    {
        cost: 10,
        deck: Deck.COLONIES,
        name: 'Corona Extractor',
        text: 'Requires 4 science tags. Increase your energy production 4 steps.',
        requiredTags: {[Tag.SCIENCE]: 4},
        tags: [Tag.POWER, Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        effect: {text: 'Effect: When you trade, you pay 1 less resource for it.'},
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
        text: 'Increase your titanium production 3 steps.',
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 4
    },
    {
        cost: 21,
        deck: Deck.COLONIES,
        name: 'Ecology Research',
        text:
            'Increase your plant production 1 step for each colony you own. Add 1 animal to ANOTHER card and 2 microbes to ANOTHER card.',
        tags: [Tag.ANIMAL, Tag.MICROBE, Tag.PLANT, Tag.SCIENCE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 3,
        deck: Deck.COLONIES,
        name: 'Floater Leasing',
        text: 'Increase your MC production 1 step per 3 floaters you have.',
        tags: [],
        type: CardType.AUTOMATED
    },
    {
        // addsResourceToCards: Resource.FLOATER,
        cost: 2,
        deck: Deck.COLONIES,
        name: 'Floater Prototypes',
        text: 'Add 2 floaters to ANOTHER card',
        tags: [Tag.EVENT, Tag.SCIENCE],
        type: CardType.EVENT
    },
    {
        action: {text: 'Action: Add 1 floater to ANOTHER card.'},
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
        text: 'Increase your MC production 1 step for every Jovian tags in play.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 3,
        deck: Deck.COLONIES,
        name: 'Heavy Taxation',
        text: 'Requires 2 Earth tags. Increase your MC production 2 steps, and gain 4 MC.',
        requiredTags: {[Tag.EARTH]: 2},
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED,
        victoryPoints: -1
    },
    {
        cost: 23,
        deck: Deck.COLONIES,
        name: 'Ice Moon Colony',
        text: 'Place 1 colony and 1 ocean tile.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        cost: 11,
        deck: Deck.COLONIES,
        name: 'Impactor Swarm',
        text: 'Requires 2 Jovian tags. Gain 12 heat. Remove up to 2 plants from any player.',
        requiredTags: {[Tag.JOVIAN]: 2},
        tags: [Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        cost: 12,
        deck: Deck.COLONIES,
        name: 'Interplanetary Colony Ship',
        text: 'Place a colony.',
        tags: [Tag.EARTH, Tag.EVENT, Tag.SPACE],
        type: CardType.EVENT
    },
    {
        increaseTerraformRating: 1,
        action: {text: 'Action: Spend 1 titanium to add 2 floaters here.'},
        cost: 20,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Jovian Lanterns',
        text:
            'Requires 1 Jovian tag. Increase your TR 1 step. Add 2 floaters to ANY card. 1 VP per 2 floaters here.',
        requiredTags: {[Tag.JOVIAN]: 1},
        tags: [Tag.JOVIAN],
        type: CardType.ACTIVE
    },
    {
        action: {
            text:
                'Action: Add 1 floater to a JOVIAN CARD, or gain 1 MC for every floater here (Max 4).'
        },
        cost: 9,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Jupiter Floating Station',
        text: 'Requires 3 science tags.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.JOVIAN],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        cost: 4,
        deck: Deck.COLONIES,
        name: 'Luna Governor',
        text: 'Requires 3 Earch tags. Increase your MC production 2 steps.',
        requiredTags: {[Tag.EARTH]: 3},
        tags: [Tag.EARTH, Tag.EARTH],
        type: CardType.AUTOMATED
    },
    {
        cost: 19,
        deck: Deck.COLONIES,
        name: 'Lunar Exports',
        text: 'Increase your plant production 2 steps, or increase your MC production 5 steps.',
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        cost: 11,
        deck: Deck.COLONIES,
        name: 'Lunar Mining',
        text:
            'Increase your titanium production. 1 step for every 2 Earth tags you have in play, including this.',
        tags: [Tag.EARTH],
        type: CardType.AUTOMATED
    },
    {
        cost: 1,
        deck: Deck.COLONIES,
        name: 'Market Manipulation',
        text: 'Increase one colony tile track 1 step. Decrease another colony tile track 1 step',
        tags: [Tag.EARTH, Tag.EVENT],
        type: CardType.EVENT
    },
    {
        action: {
            text:
                'Effect: when you play an Earth tag, place an animal here. Action: Gain 1 MC per animal here.'
        },
        cost: 12,
        deck: Deck.COLONIES,
        storedResourceType: Resource.ANIMAL,
        name: 'Martian Zoo',
        text: 'Requires 2 city tiles in play.',
        tags: [Tag.ANIMAL, Tag.BUILDING],
        type: CardType.ACTIVE,
        victoryPoints: 1
        // condition: condition => condition.tag === Tag.EARTH,
        // effect(effect) {
        //     effect.gainResource(Resource.ANIMAL, 1, this);
        // }
    },
    {
        cost: 20,
        deck: Deck.COLONIES,
        name: 'Mining Colony',
        text: 'Increase your titanium production 1 step. Place a colony.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        cost: 5,
        deck: Deck.COLONIES,
        name: 'Minority Refuge',
        text: 'Decrese your MC production 2 steps. Place a colony.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        cost: 11,
        deck: Deck.COLONIES,
        name: 'Molecular Printing',
        text: 'Gain 1 MC fo each city tile in play. Gain 1 MC for each colony in play.',
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
        text: 'Raise your TR 2 steps. Add 2 floaters to a JOVIAN CARD.',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 13,
        deck: Deck.COLONIES,
        name: 'Pioneer Settlement',
        text:
            'Requires that you have no more than 1 colony. Decrease your MC production 2 steps. Place a colony.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED,
        victoryPoints: 2
    },
    {
        cost: 0,
        deck: Deck.COLONIES,
        name: 'Productive Outpost',
        text: 'Gain all your colony bonuses',
        tags: [],
        type: CardType.AUTOMATED
    },
    {
        cost: 8,
        deck: Deck.COLONIES,
        name: 'Quantum Communications',
        text:
            'Requires 4 science tags. Increase your MC production 1 step for each colony in play.',
        requiredTags: {[Tag.SCIENCE]: 4},
        tags: [],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        action: {
            text: 'Action: Add 1 floater to this card, or spend 1 floater here to draw a card.'
        },
        cost: 17,
        deck: Deck.COLONIES,
        name: 'Red Spot Observatory',
        text: 'Requires 3 science tags. Draw 2 cards.',
        requiredTags: {[Tag.SCIENCE]: 3},
        tags: [Tag.JOVIAN, Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 2
    },
    {
        action: {
            text: 'Action: Decrease your MC production 1 step to add a camp resource to this card.'
        },
        cost: 10,
        deck: Deck.COLONIES,
        storedResourceType: Resource.CAMP,
        name: 'Refugee Camps',
        text: '1 VP for each camp resource on this card.',
        tags: [Tag.EARTH],
        type: CardType.ACTIVE
    },
    {
        cost: 20,
        deck: Deck.COLONIES,
        name: 'Research Colony',
        text: 'Place a colony. MAY BE PLACED WHERE YOU ALREADY HAVE A COLONY. Draw 2 cards.',
        tags: [Tag.SCIENCE, Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        effect: {text: 'Effect: When you trade, you pay 1 less resource for it.'},
        cost: 4,
        deck: Deck.COLONIES,
        name: 'Rim Freighters',
        tags: [Tag.SPACE],
        type: CardType.ACTIVE
    },
    {
        effect: {text: 'Effect: When you play a card, you pay 1 MC less for it.'},
        cost: 18,
        deck: Deck.COLONIES,
        name: 'Sky Docks',
        text: 'Requires 2 Earth tags. Gain 1 Trade Fleet.',
        requiredTags: {[Tag.EARTH]: 2},
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.ACTIVE,
        victoryPoints: 2
    },
    {
        cost: 9,
        deck: Deck.COLONIES,
        name: 'Solar Probe',
        text: 'Draw 1 card for every 3 science tags you have, including this.',
        tags: [Tag.EVENT, Tag.SCIENCE, Tag.SPACE],
        type: CardType.EVENT,
        victoryPoints: 1
    },
    {
        cost: 23,
        deck: Deck.COLONIES,
        name: 'Solar Reflectors',
        text: 'Increase your heat production 5 steps.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        cost: 22,
        deck: Deck.COLONIES,
        name: 'Space Port',
        text:
            'Requires 1 colony. Gain 1 Trade Fleet. Place a city tile. Decrease your energy production 1 step, and increase your MC production 4 steps.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED
    },
    {
        cost: 27,
        deck: Deck.COLONIES,
        name: 'Space Port Colony',
        text:
            'Requires a colony. Place a colony. MAY BE PLACED ON A COLONY TILE WHERE YOU ALREADY HAVE A COLONY. Gain 1 Trade Fleet. 1 VP per 2 colonies in play.',
        tags: [Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        effect: {
            text: 'Effect: WHEN PLAYING A CARD WITH A BASIC COST OF 20 MC OR MORE, draw a card'
        },
        cost: 10,
        deck: Deck.COLONIES,
        name: 'Spin-Off Department',
        text: 'Increase your MC production 2 steps.',
        tags: [Tag.BUILDING],
        type: CardType.ACTIVE
        // condition: condition => (condition.card?.cost ?? 0 > 20 ? true : false),
        // effect: effect => effect.drawCard()
    },
    {
        action: {text: 'Action: Add 1 animal to this card.'},
        cost: 5,
        deck: Deck.COLONIES,
        storedResourceType: Resource.ANIMAL,
        name: 'Sub-Zero Salt Fish',
        text:
            'Requires -6°C or warmer. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
        requiredGlobalParameter: {
            type: Parameter.TEMPERATURE,
            min: -6
        },
        tags: [Tag.ANIMAL],
        type: CardType.ACTIVE
    },
    {
        action: {
            text:
                'Action: Spend 1 titanium to add 2 floaters to this card, or spend 2 floaters here to increase your TR 1 step.'
        },
        cost: 21,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Titan Air-Scrapping',
        tags: [Tag.JOVIAN],
        type: CardType.ACTIVE,
        victoryPoints: 2
    },
    {
        action: {
            text:
                'Action: Add 1 floater to ANY JOVIAN CARD, or spend 1 floater here to trade for free'
        },
        cost: 18,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Titan Floating Launch-Pad',
        text: 'Add 2 foaters to ANY JOVIAN CARD.',
        tags: [Tag.JOVIAN],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        action: {
            text:
                'Action: Add 2 floaters to ANY JOVIAN CARD, or spend any number of floaters here to gain the same number of titanium.'
        },
        cost: 23,
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Titan Shuttles',
        tags: [Tag.JOVIAN, Tag.SPACE],
        type: CardType.ACTIVE,
        victoryPoints: 1
    },
    {
        effect: {
            text: 'Effect: When you trade, you may first increase that Colony Tile track 1 step.'
        },
        cost: 6,
        deck: Deck.COLONIES,
        name: 'Trade Envoys',
        tags: [],
        type: CardType.ACTIVE
    },
    {
        effect: {
            text: 'Effect: When you trade, you may first increase that Colony Tile track 1 step.'
        },
        cost: 18,
        deck: Deck.COLONIES,
        name: 'Trading Colony',
        text: 'Place a colony.',
        tags: [Tag.SPACE],
        type: CardType.ACTIVE
    },
    {
        cost: 6,
        deck: Deck.COLONIES,
        name: 'Urban Decomposers',
        text:
            'Requires that you have 1 city tile and 1 colony in play. Increase your plant production 1 step, and add 2 microbes to ANOTHER card.',
        requiredTags: {[Tag.SPACE]: 1},
        tags: [Tag.MICROBE],
        type: CardType.AUTOMATED
    },
    {
        effect: {text: 'Effect: When you play a space tag, you pay 4 MC less for it.'},
        cost: 14,
        deck: Deck.COLONIES,
        name: 'Warp Drive',
        text: 'Requires 5 science tags.',
        requiredTags: {[Tag.SCIENCE]: 5},
        tags: [Tag.SCIENCE],
        type: CardType.ACTIVE,
        victoryPoints: 2
    },
    {
        deck: Deck.PRELUDE,
        name: 'Allied Bank',
        text: 'Increase your MC production 4 steps. Gain 3 MC.',
        tags: [Tag.EARTH],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Aquifer Turbines',
        text: 'Place an ocean tile. Increase your energy production 2 steps. Remove 3 MC.',
        tags: [Tag.POWER],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Biofuels',
        text: 'Increase your plant production and energy production 1 step each. Gain 2 plants.',
        tags: [Tag.MICROBE],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Biolabs',
        text: 'Increase your plant production 1 step. Draw 3 cards.',
        tags: [Tag.SCIENCE],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Biosphere Support',
        text: 'Decrease your MC production 1 step. Increase your plant production 2 steps.',
        tags: [Tag.PLANT],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Business Empire',
        text: 'Increase your MC production 6 steps. Remove 6 MC.',
        tags: [Tag.EARTH],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Dome Farming',
        text: 'Increase your plant production 1 step. Increase your MC production 2 steps.',
        tags: [Tag.BUILDING, Tag.PLANT],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Donation',
        text: 'Gain 21 MC.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Early Settlement',
        text: 'Place a city tile. Increase your plant production 1 step.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Ecology Experts',
        text:
            'Increase your plant production 1 step. Play a card from Hand, ignoring global requirements',
        tags: [Tag.MICROBE, Tag.PLANT],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Excentric Sponsor',
        text: 'Play a card from hand, reducing its costs by 25 MC',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Experimental Forest',
        text:
            'Place a greenery tile and increase oxygen 1 step. Reveal cards from the deck until you have revealed 2 plant-tag cards. Take these into your hand, and discard the rest.',
        tags: [Tag.PLANT],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Galilean Mining',
        text: 'Increase your titanium production 2 steps. Remove 5 MC.',
        tags: [Tag.JOVIAN],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Great Aquifer',
        text: 'Place 2 ocean tiles.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Huge Asteroid',
        text: 'Raise temperature 3 steps. Remove 5 MC.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Io Research Outpost',
        text: 'Increase your titanium production 1 step. Draw 1 card.',
        tags: [Tag.JOVIAN, Tag.SCIENCE],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Loan',
        text: 'Decrease your MC production 2 steps. Gain 30 MC.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Martian Industries',
        text: 'Increase your energy production and steel production 1 step each. Gain 6 MC.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Metal-Rich Asteroid',
        text: 'Raise temperature 1 step. Gain 4 titanium, and 4 steel.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Metals Company',
        text: 'Increase your MC production, steel production, and titanium production 1 step each.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Mining Operations',
        text: 'Increase your steel production 2 steps. Gain 4 steel.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Mohole',
        text: 'Increse your heat production 3 steps. Gain 3 heat.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Mohole Excavation',
        text:
            'Increase your steel production 1 step, and your heat production 2 steps. Gain 2 heat.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        increaseTerraformRating: 1,
        deck: Deck.PRELUDE,
        name: 'Nitrogen Shipment',
        text:
            'Raise your terraform rating 1 step. Increase your plant production 1 step. Gain 5 MC.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Orbital Construction Yard',
        text: 'Increase your titanium produciton [sic] 1 step. Gain 4 titanium.',
        tags: [Tag.SPACE],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Polar Industries',
        text: 'Place 1 ocean tile. Increase your heat production 2 steps.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Power Generation',
        text: 'Increase your energy production 3 steps.',
        tags: [Tag.POWER],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Research Network',
        text:
            'Draw 3 cards, and increase your MC production 1 step. After being played, when you perform an action, the wild tag is any tag of your choice.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Self-Sufficient Settlement',
        text: 'Place a city tile. Increase your MC production 2 steps.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Smelting Plant',
        text: 'Raise oxygen 2 steps. Gain 5 steel.',
        tags: [Tag.BUILDING],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Society Support',
        text:
            'Decrease your MC production  1 step. Increase your plant production, energy production, and heat production 1 step each.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Supplier',
        text: 'Increase your energy production 2 steps. Gain 4 steel.',
        tags: [Tag.POWER],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Supply Drop',
        text: 'Gain 3 titanium, 8 steeel, and 3 plants.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        increaseTerraformRating: 3,
        deck: Deck.PRELUDE,
        name: 'UNMI Contractor',
        text: 'Raise your terraform rating 3 steps. Draw 1 card.',
        tags: [Tag.VENUS],
        type: CardType.PRELUDE
    },
    {
        deck: Deck.PRELUDE,
        name: 'Acquired Space Agency',
        text:
            'Gain 6 titanium. Reveal cards from the deck until you have revealed 2 space cards. Take those into hand, and discard the rest.',
        tags: [],
        type: CardType.PRELUDE
    },
    {
        cost: 10,
        deck: Deck.PRELUDE,
        name: 'House Printing',
        text: 'Increase your steel production 1 step.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 15,
        deck: Deck.PRELUDE,
        name: 'Lava Tube Settlement',
        text:
            'Decrease your energy production 1 step. Increase your MC production 2 steps. Place a city tile ON A VOLCANIC AREA, same as Lava Flows, regardless of adjacent cities.',
        tags: [Tag.BUILDING, Tag.CITY],
        type: CardType.AUTOMATED
    },
    {
        cost: 9,
        deck: Deck.PRELUDE,
        name: 'Martian Survey',
        text: 'Oxygen must be 4% or lower. Draw 2 cards.',
        requiredGlobalParameter: {
            type: Parameter.OXYGEN,
            max: 4
        },
        tags: [Tag.EVENT, Tag.SCIENCE],
        type: CardType.EVENT,
        victoryPoints: 1
    },
    {
        action: {
            text:
                'Action: Add a microbe to this card. Effect: When paying for a plant card, microbes here may be used as 2 MC each.'
        },
        cost: 2,
        deck: Deck.PRELUDE,
        storedResourceType: Resource.MICROBE,
        name: 'Psychrophiles',
        text: 'Requires temperature -20°C or colder.',
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
        text:
            'After being played, when you perform an action, the wild tag counts as any tag of your choice.',
        tags: [],
        type: CardType.AUTOMATED
    },
    {
        cost: 7,
        deck: Deck.PRELUDE,
        name: 'SF Memorial',
        text: 'Draw 1 card.',
        tags: [Tag.BUILDING],
        type: CardType.AUTOMATED,
        victoryPoints: 1
    },
    {
        cost: 12,
        deck: Deck.PRELUDE,
        name: 'Space Hotels',
        text: 'Requires 2 Earth tags. Increase your MC production 4 steps.',
        requiredTags: {[Tag.EARTH]: 2},
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.AUTOMATED
    },
    {
        effect: {
            text:
                'Effect: After you pay for a card or standard project with a basic cost of 20 MC or more, you gain 4 MC.'
        },
        deck: Deck.BASIC,
        name: 'CrediCor',
        text: 'You start with 57 MC.',
        tags: [],
        type: CardType.CORPORATION,
        // condition: condition => (condition.cost && condition.cost >= 20 ? true : false),
        // effect: effect => effect.gainResource(Resource.MEGACREDIT, 4),
        gainResource: {[Resource.MEGACREDIT]: 57}
    },
    {
        effect: {text: 'Effect: You may always pay 7 plants, instead of 8, to place 1 greenery.'},
        deck: Deck.BASIC,
        name: 'Ecoline',
        text: 'You start with 2 plant production, 3 plants, and 36 MC.',
        tags: [Tag.PLANT],
        type: CardType.CORPORATION,
        gainResource: {[Resource.MEGACREDIT]: 36, [Resource.PLANT]: 3},
        increaseProduction: {[Resource.PLANT]: 2}
    },
    {
        effect: {text: 'Effect: You may use heat as MC. You may not use MC as heat.'},
        deck: Deck.BASIC,
        name: 'Helion',
        text: 'You start with 3 heat production and 42 MC.',
        tags: [Tag.SPACE],
        type: CardType.CORPORATION,
        increaseProduction: {[Resource.HEAT]: 3},
        gainResource: {[Resource.MEGACREDIT]: 42}
    },
    {
        effect: {text: 'Effect: Each time you play an event, you gain 2 MC.'},
        deck: Deck.BASIC,
        name: 'Interplanetary Cinematics',
        text: 'You start with 20 steel and 30 MC.',
        tags: [Tag.BUILDING],
        type: CardType.CORPORATION,
        // condition: condition =>
        //     condition.card && condition.card.tags.includes(Tag.EVENT) ? true : false,
        // effect: effect => effect.gainResource(Resource.MEGACREDIT, 2),
        gainResource: {[Resource.MEGACREDIT]: 30, [Resource.STEEL]: 20}
    },
    {
        effect: {
            text:
                'Effect: Your temperature, oxygen, and ocean requirements are +2 or -2 steps, your choice in each case.'
        },
        deck: Deck.BASIC,
        name: 'Inventrix',
        text: 'As your first action in the game, draw 3 cards. You start with 45 MC.',
        tags: [Tag.SCIENCE],
        type: CardType.CORPORATION,
        gainResource: {[Resource.MEGACREDIT]: 45}
    },
    {
        effect: {
            text:
                'Effect: Each time you get any steel or titanium as a placement bonus on the map, increase your steel production 1 step.'
        },
        deck: Deck.BASIC,
        name: 'Mining Guild',
        text: 'You start with 30 MC, 5 steel, and 1 steel production.',
        tags: [Tag.BUILDING, Tag.BUILDING],
        type: CardType.CORPORATION,
        gainResource: {[Resource.MEGACREDIT]: 30, [Resource.STEEL]: 5},
        increaseProduction: {[Resource.STEEL]: 1}
    },
    {
        effect: {
            text:
                'Effect: Each time any Jovian tag is put into play, including this, increase your MC production 1 step.'
        },
        deck: Deck.CORPORATE,
        name: 'Saturn Systems',
        text: 'You start with 1 titanium production and 42 MC.',
        tags: [Tag.JOVIAN],
        type: CardType.CORPORATION,
        // condition: condition => condition.tag === Tag.JOVIAN,
        // effect: effect => effect.increaseProduction(Resource.MEGACREDIT, 1),
        increaseProduction: {[Resource.TITANIUM]: 1},
        gainResource: {[Resource.MEGACREDIT]: 42}
    },
    {
        effect: {text: 'Effect: Your titanium resources are each worth 1 MC extra.'},
        deck: Deck.BASIC,
        name: 'PhoboLog',
        text: 'You start with 10 titanium and 23 MC',
        tags: [Tag.SPACE],
        type: CardType.CORPORATION,
        gainResource: {[Resource.TITANIUM]: 10, [Resource.MEGACREDIT]: 23}
    },
    {
        effect: {text: 'Effect: When playing an Earth card, you pay 3 MC less for it.'},
        deck: Deck.CORPORATE,
        name: 'Teractor',
        text: 'You start with 60 MC.',
        tags: [Tag.EARTH],
        type: CardType.CORPORATION,
        gainResource: {[Resource.MEGACREDIT]: 60}
    },
    {
        effect: {
            text:
                'Effect: When any city tile is placed ON MARS, increase your MC production 1 step. When you place a city tile, gain 3 MC.'
        },
        deck: Deck.BASIC,
        name: 'Tharsis Republic',
        text: 'You start with 40 MC. As your first action in the game, place a city tile.',
        tags: [Tag.BUILDING],
        type: CardType.CORPORATION,
        // condition: condition =>
        //     condition.tileType === TileType.CITY && (condition.onMars || condition.samePlayer)
        //         ? true
        //         : false,
        // effect: effect => {
        //     if (effect.condition.onMars) {
        //         effect.increaseProduction(Resource.MEGACREDIT, 1);
        //     }
        //     if (effect.condition.samePlayer) {
        //         effect.gainResource(Resource.MEGACREDIT, 3);
        //     }
        // },
        gainResource: {[Resource.MEGACREDIT]: 40}
    },
    {
        effect: {
            text:
                'Effect: When playing a power card OR THE STANDARD PROJECT POWER PLANT, you pay 3 MC less for it.'
        },
        deck: Deck.BASIC,
        name: 'ThorGate',
        text: 'You start with 1 energy production and 48 MC.',
        tags: [Tag.POWER],
        type: CardType.CORPORATION,
        increaseProduction: {[Resource.ENERGY]: 1},
        gainResource: {[Resource.MEGACREDIT]: 48}
    },
    {
        action: {
            text:
                'Action: If your Terraform Rating was raised this generation, you may pay 3 MC to raise it 1 step more.'
        },
        deck: Deck.BASIC,
        name: 'United Nations Mars Initiative',
        text: 'You start with 40 MC.',
        tags: [Tag.EARTH],
        type: CardType.CORPORATION,
        gainResource: {[Resource.MEGACREDIT]: 40}
    },
    {
        effect: {text: 'Effect: Whenever Venus is terraformed 1 step, you gain 2 MC.'},
        deck: Deck.VENUS,
        name: 'Aphrodite',
        text: 'You start with 47 MC and 1 plant production.',
        tags: [Tag.PLANT, Tag.VENUS],
        type: CardType.CORPORATION
    },
    {
        action: {text: 'Action: Add a floater to ANY card.'},
        deck: Deck.VENUS,
        storedResourceType: Resource.FLOATER,
        name: 'Celestic',
        text:
            'You start with 42 MC. As your first action, reveal cards from the deck until you have revealed 2 cards with a floater icon on it. Take those 2 cards into hand, and discard the rest. 1 VP per 3 floaters on this card.',
        tags: [Tag.VENUS],
        type: CardType.CORPORATION
    },
    {
        effect: {
            text:
                'Effect: For each step you increase the production of a resource, including this, you also gain that '
        },
        deck: Deck.VENUS,
        name: 'Manutech',
        text: 'You start with 1 steel production and 35 MC.',
        tags: [Tag.BUILDING],
        type: CardType.CORPORATION
    },
    {
        effect: {
            text: 'Effect: Your Venus requirements are +/- 2 steps, your choice in each case.'
        },
        deck: Deck.VENUS,
        name: 'Morning Star Inc.',
        text:
            'You start with 50 MC. As your first action, reveal cards from the deck until you have revealed 3 Venus-tag cards. Take those into hand and discard the rest.',
        tags: [Tag.VENUS],
        type: CardType.CORPORATION
    },
    {
        action: {
            text: 'Action: Use a blue card action that has already been used this generation.'
        },
        deck: Deck.VENUS,
        name: 'Viron',
        text: 'You start with 48 MC.',
        tags: [Tag.MICROBE],
        type: CardType.CORPORATION
    },
    {
        effect: {text: 'Effect: When you play a building tag, you pay 2 MC less for it.'},
        deck: Deck.PRELUDE,
        name: 'Cheung Shing Mars',
        text: 'You start with 44 MC and 3 MC production.',
        tags: [Tag.BUILDING],
        type: CardType.CORPORATION
    },
    {
        effect: {text: 'Effect: When you play a Earth tag, including this, draw a card.'},
        deck: Deck.PRELUDE,
        name: 'Point Luna',
        text: 'You start with 38 MC and 1 titanium production.',
        tags: [Tag.EARTH, Tag.SPACE],
        type: CardType.CORPORATION
        // condition: condition => condition.tag === Tag.EARTH,
        // effect: effect => effect.drawCard()
    },
    {
        action: {text: 'Action: Spend 4 MC to increase (one of) your LOWEST PRODUCTION 1 step.'},
        deck: Deck.PRELUDE,
        name: 'Robinson Industries',
        text: 'You start with 47 MC.',
        tags: [],
        type: CardType.CORPORATION
    },
    {
        effect: {text: 'Effect: When you play a science tag, you pay 2 MC less for it.'},
        deck: Deck.PRELUDE,
        name: 'Valley Trust',
        text:
            'You start with 37 MC. As your first action, draw 3 Prelude cards, and play one of them. Discard the other two.',
        tags: [Tag.EARTH],
        type: CardType.CORPORATION
    },
    {
        effect: {
            text:
                'Effect: When you play a card with a NON-NEGATIVE VP icon, including this, gain 3 MC.'
        },
        deck: Deck.PRELUDE,
        name: 'Vitor',
        text: 'You start with 45 MC. As your first action, fund an award for free.',
        tags: [Tag.EARTH],
        type: CardType.CORPORATION
        // condition: condition => {
        //     if (!condition.card) return false;
        //     if (!condition.card.victoryPoints) return false;
        //     return condition.card.victoryPoints > 0;
        // }
    },
    {
        effect: {
            text:
                'Effect: When you get a new type of tag in play (event cards do not count), increase your MC production 1 step.'
        },
        deck: Deck.COLONIES,
        name: 'Aridor',
        text:
            'You start with 40 MC. As your first action, put an additional Colony Tile of your choice into play.',
        tags: [],
        type: CardType.CORPORATION
        // condition: condition => condition.newTag ?? false,
        // effect: effect => effect.increaseProduction(Resource.MEGACREDIT, 1)
    },
    {
        effect: {
            text:
                'Effect: When you play an animal or plant tag, including this, add 1 animal to this card.'
        },
        deck: Deck.COLONIES,
        storedResourceType: Resource.ANIMAL,
        name: 'Arklight',
        text:
            'You start with 45 MC. Increase your MC production 2 steps. 1 VP per 2 animals on this card.',
        tags: [Tag.ANIMAL],
        type: CardType.CORPORATION
        // condition: condition => !!condition.tag && [Tag.ANIMAL, Tag.PLANT].includes(condition.tag),
        // effect(effect) {
        //     effect.gainResource(Resource.ANIMAL, 1, this);
        // }
    },
    {
        effect: {
            text:
                'Effect: When you buy a card to hand, pay 5 MC instead of 3 MC, including the starting hand.'
        },
        deck: Deck.COLONIES,
        name: 'Polyphemos',
        text: 'You start with 50 MC. Increase your MC production 5 steps. Gain 5 titanium.',
        tags: [],
        type: CardType.CORPORATION
    },
    {
        effect: {
            text:
                'Effect: When any colony is placed, including this, raise your MC production 1 step.'
        },
        deck: Deck.COLONIES,
        name: 'Poseidon',
        text: 'You start with 45 MC. As your first action, place a colony.',
        tags: [],
        type: CardType.CORPORATION
    },
    {
        action: {
            text:
                'Action: Add 1 floater to ANY card. Effect: Floaters on this card may be used as 2 heat each'
        },
        deck: Deck.COLONIES,
        storedResourceType: Resource.FLOATER,
        name: 'Stormcraft Incorporated',
        text: 'You start with 48 MC.',
        tags: [Tag.JOVIAN],
        type: CardType.CORPORATION
    }
];
