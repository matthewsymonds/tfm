import {Card, Deck, Tag, CardType} from './card-types';
import {Resource} from './resource';
import {TileType} from './board';
import {ActionType} from './action';

// CardType check commented out for performance.
// Good to check new cards for type safety.

export const cards: Card[] = [
  {
    cost: 8,
    deck: Deck.Basic,
    name: 'Colonizer Training Camp',
    oneTimeText: 'Oxygen must be 5% or less.',
    requiredMaxOxygen: 5,
    tags: [Tag.Building, Tag.Jovian],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 13,
    deck: Deck.Corporate,
    name: 'Asteroid Mining Consortium',
    oneTimeText:
      'Requires that you have titanium production. Decrease any titanium production 1 step and increase your own 1 step.',
    tags: [Tag.Jovian],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 13,
    deck: Deck.Basic,
    name: 'Deep Well Heating',
    oneTimeText:
      'Increase your energy production 1 step. Increase temperature 1 step.',
    tags: [Tag.Building, Tag.Energy],
    temperature: 1,
    type: CardType.Automated
  },
  {
    cost: 11,
    deck: Deck.Basic,
    name: 'Cloud Seeding',
    oneTimeText:
      'Requires 3 ocean tiles. Decrease your MC production 1 step and any heat production 1 step.  Increase your plant production 2 steps.',
    requiredOcean: 3,
    tags: [],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Spend 1 MC to reveal and discard the top card of the draw deck. If that card has a microbe tag, add a science resource here.',
    cost: 3,
    deck: Deck.Basic,
    holdsResource: Resource.Science,
    name: 'Search For Life',
    oneTimeText:
      'Oxygen must be 6% or less. 3 VPs if you have one or more science resource here.',
    requiredMaxOxygen: 6,
    tags: [Tag.Science],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Look at the top card and either buy it or discard it',
    cost: 9,
    deck: Deck.Corporate,
    name: "Inventors' Guild",
    tags: [Tag.Science],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Spend 1 energy to gain 1 MC for each city tile ON MARS.',
    cost: 13,
    deck: Deck.Basic,
    name: 'Martian Rails',
    tags: [Tag.Building],
    type: CardType.Active
  },
  {
    cost: 26,
    deck: Deck.Basic,
    name: 'Capital',
    oneTimeText:
      'Requires 4 ocean tiles. Place [the capital city] tile. Decrease your energy production 2 steps and increase your MC production 5 steps. 1 ADDITIONAL VP FOR EACH OCEAN TILE ADJACENT TO THIS CITY TILE.',
    requiredOcean: 4,
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated
  },
  {
    cost: 14,
    deck: Deck.Basic,
    gainTitanium: 2,
    name: 'Asteroid',
    oneTimeText:
      'Raise temperature 1 step and gain 2 titanium. Remove up to 3 plants from any player.',
    tags: [Tag.Event, Tag.Space],
    temperature: 1,
    type: CardType.Event
  },
  {
    cost: 21,
    deck: Deck.Basic,
    name: 'Comet',
    ocean: 1,
    oneTimeText:
      'Raise temperature 1 step and place an ocean tile. Remove up to 3 plants from any player.',
    tags: [Tag.Event, Tag.Space],
    temperature: 1,
    type: CardType.Event
  },
  {
    cost: 27,
    deck: Deck.Basic,
    gainTitanium: 4,
    name: 'Big Asteroid',
    oneTimeText:
      'Raise temperature 2 steps and gain 4 titanium. Remove up to 4 plants from any player.',
    tags: [Tag.Event, Tag.Space],
    temperature: 2,
    type: CardType.Event
  },
  {
    actionOrEffectText:
      'Action: Pay 12 MC to place an ocean tile. TITANIUM MAY BE USED as if playing a space card.',
    cost: 25,
    deck: Deck.Basic,
    name: 'Water Import From Europa',
    oneTimeText: '1 VP for each Jovian tag you have.',
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Active
  },
  {
    actionOrEffectText: 'Action: Spend 1 steel to gain 5 MC',
    cost: 27,
    deck: Deck.Corporate,
    name: 'Space Elevator',
    oneTimeText: 'Increase your titanium production 1 step.',
    tags: [Tag.Building, Tag.Space],
    type: CardType.Active,
    victoryPoints: 2
  },
  {
    actionOrEffectText: 'Action: Spend 1 energy to draw a card.',
    cost: 11,
    deck: Deck.Corporate,
    name: 'Development Center',
    tags: [Tag.Building, Tag.Science],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Decrease your energy production 1 step to increase your terraforming rating 1 step.',
    cost: 11,
    deck: Deck.Basic,
    name: 'Equatorial Magnetizer',
    tags: [Tag.Building],
    type: CardType.Active
  },
  {
    cost: 24,
    deck: Deck.Basic,
    gainPlant: 3,
    name: 'Domed Crater',
    oneTimeText:
      'Oxygen must be 7% or less. Gain 3 plants and place a city tile. Decrease your energy production 1 step and increase MC production 3 steps.',
    requiredMaxOxygen: 7,
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 18,
    deck: Deck.Basic,
    name: 'Noctis City',
    oneTimeText:
      'Decrease your energy production 1 step and increase your MC production 3 steps. Place a tile ON THE RESERVED AREA, disregarding normal placement restrictions.',
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated
  },
  {
    cost: 28,
    deck: Deck.Basic,
    name: 'Methane From Titan',
    oneTimeText:
      'Requires 2% oxygen. Increase your heat production 2 steps and your plant production 2 steps.',
    requiredOxygen: 2,
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 16,
    deck: Deck.Basic,
    name: 'Imported Hydrogen',
    ocean: 1,
    oneTimeText:
      'Gain 3 plants, or add 3 microbes or 2 animals to ANOTHER card. Place an ocean tile.',
    tags: [Tag.Earth, Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    actionOrEffectText:
      'Effect: When you play a card, you pay 1 MC less for it.',
    cost: 18,
    deck: Deck.Basic,
    name: 'Research Outpost',
    oneTimeText: 'Place a city tile NEXT TO NO OTHER TILE.',
    tags: [Tag.Building, Tag.City, Tag.Science],
    type: CardType.Active
  },
  {
    cost: 25,
    deck: Deck.Basic,
    name: 'Phobos Space Haven',
    oneTimeText:
      'Increase your titanium production 1 step and place a city tile ON THE RESERVED AREA.',
    tags: [Tag.City, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 3
  },
  {
    cost: 15,
    deck: Deck.Basic,
    name: 'Black Polar Dust',
    ocean: 1,
    oneTimeText:
      'Place an ocean tile. Decrease your MC production 2 steps and increase your heat production 3 steps.',
    tags: [],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When anyone places an ocean tile, gain 2 plants.',
    cost: 12,
    deck: Deck.Basic,
    name: 'Arctic Algae',
    oneTimeText: 'It must be -12°C or colder to play. Gain 1 plant.',
    requiredMaxTemperature: -12,
    tags: [Tag.Plant],
    type: CardType.Active,
    condition: condition => condition.tileType === TileType.Ocean,
    effect: effect => effect.gainResource(Resource.Plant, 2)
  },
  {
    actionOrEffectText:
      'Action: Remove 1 animal from any card and add it to this card.',
    cost: 14,
    deck: Deck.Basic,
    holdsResource: Resource.Animal,
    name: 'Predators',
    oneTimeText: 'Requires 11% oxygen. 1 VP per animal on this card.',
    requiredOxygen: 11,
    tags: [Tag.Animal],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Effect: When you play a space card, you pay 2 MC less for it.',
    cost: 10,
    deck: Deck.Corporate,
    name: 'Space Station',
    tags: [Tag.Space],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    cost: 16,
    deck: Deck.Basic,
    gainPlant: 3,
    name: 'Eos Chasma National Park',
    oneTimeText:
      'Requires -128°C  or warmer. Add 1 animal TO ANY ANIMAL CARD. Gain 3 plants. Increase your MC production 2 steps.',
    requiredTemperature: -12,
    tags: [Tag.Building, Tag.Plant],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 24,
    deck: Deck.Corporate,
    name: 'Interstellar Colony Ship',
    oneTimeText: 'Requires 5 science tags.',
    requiredScience: 5,
    tags: [Tag.Earth, Tag.Event, Tag.Space],
    type: CardType.Event,
    victoryPoints: 4
  },
  {
    actionOrEffectText:
      'Action: Spend 1 titanium to add 1 fighter resource to this card.',
    cost: 12,
    deck: Deck.Corporate,
    holdsResource: Resource.Fighter,
    name: 'Security Fleet',
    oneTimeText: '1 VP for each fighter resource on this card.',
    tags: [Tag.Space],
    type: CardType.Active
  },
  {
    cost: 16,
    deck: Deck.Basic,
    name: 'Cupola City',
    oneTimeText:
      'Oxygen must be 9% or less. Place a city tile. Decrease your energy production 1 step and increase your MC production 3 steps.',
    requiredMaxOxygen: 9,
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated
  },
  {
    cost: 13,
    deck: Deck.Basic,
    name: 'Lunar Beam',
    oneTimeText:
      'Decrease your MC production 2 steps and increase your heat production and energy production 2 steps each.',
    tags: [Tag.Earth, Tag.Energy],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When you place a space event, you gain 3 MC and 3 heat.',
    cost: 7,
    deck: Deck.Basic,
    name: 'Optimal Aerobraking',
    tags: [Tag.Space],
    type: CardType.Active,
    condition: condition =>
      condition.samePlayer &&
      condition.card.tags.includes(Tag.Space) &&
      condition.card.tags.includes(Tag.Event),
    effect: effect => {
      effect.gainResource(Resource.Megacredit, 3);
      effect.gainResource(Resource.Heat, 3);
    }
  },
  {
    cost: 18,
    deck: Deck.Basic,
    name: 'Underground City',
    oneTimeText:
      'Place a city tile. Decrease your energy production 2 steps and increase your steel production 2 steps.',
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Add 1 microbe to this card, or remove 2 microbe from this card to raise oxygen level 1 step.',
    cost: 13,
    deck: Deck.Basic,
    holdsResource: Resource.Microbe,
    name: 'Regolith Eaters',
    tags: [Tag.Microbe, Tag.Science],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Add 1 microbe to this card, or remove 2 microbes to raise temperature 1 step.',
    cost: 8,
    deck: Deck.Basic,
    holdsResource: Resource.Microbe,
    name: 'GHG Producing Bacteria',
    oneTimeText: 'Requires 4% oxygen.',
    requiredOxygen: 4,
    tags: [Tag.Microbe, Tag.Science],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Remove 1 microbe from any card to add 1 to this card.',
    cost: 9,
    deck: Deck.Basic,
    holdsResource: Resource.Microbe,
    name: 'Ants',
    oneTimeText: 'Requires 4% oxygen. 1 VP per 2 microbes on this card.',
    requiredOxygen: 4,
    tags: [Tag.Microbe],
    type: CardType.Active
  },
  {
    terraformRatingIncrease: 2,
    cost: 14,
    deck: Deck.Basic,
    name: 'Release of Inert Gases',
    oneTimeText: 'Raise your terraform rating 2 steps.',
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    terraformRatingIncrease: 2,
    cost: 31,
    deck: Deck.Basic,
    name: 'Nitrogen-Rich Asteroid',
    oneTimeText:
      'Raise your terraforming rating 2 steps and temperature 1 step. Increase your plant production 1 step, or 4 steps if you have 3 plant tags.',
    tags: [Tag.Event, Tag.Space],
    temperature: 1,
    type: CardType.Event
  },
  {
    actionOrEffectText: 'Effect: When any city tile is placed, gain 2 MC',
    cost: 8,
    deck: Deck.Basic,
    name: 'Rover Construction',
    tags: [Tag.Building],
    type: CardType.Active,
    victoryPoints: 1,
    condition: condition => condition.tileType === TileType.City,
    effect: effect => {
      effect.gainResource(Resource.Megacredit, 2);
    }
  },
  {
    cost: 31,
    deck: Deck.Basic,
    gainSteel: 4,
    name: 'Deimos Down',
    oneTimeText:
      'Raise temperature 3 steps and gain 4 steel. Remove up to 8 plants from any player.',
    tags: [Tag.Event, Tag.Space],
    temperature: 3,
    type: CardType.Event
  },
  {
    cost: 30,
    deck: Deck.Basic,
    name: 'Asteroid Mining',
    oneTimeText: 'Increase your titanium production 2 steps.',
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 12,
    deck: Deck.Basic,
    name: 'Food Factory',
    oneTimeText:
      'Decrease your plant production 1 step and increase your MC production 4 steps.',
    tags: [Tag.Building],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 6,
    deck: Deck.Basic,
    name: 'Archaebacteria',
    oneTimeText:
      'It must be -18°C or colder. Increase your plant production 1 step.',
    requiredMaxTemperature: -18,
    tags: [Tag.Microbe],
    type: CardType.Automated
  },
  {
    cost: 6,
    deck: Deck.Basic,
    name: 'Carbonate Processing',
    oneTimeText:
      'Decrease your energy production 1 step and increase your heat production 3 steps.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 9,
    deck: Deck.Basic,
    name: 'Natural Preserve',
    oneTimeText:
      'Oxygen must be 4% or less. Place this tile NEXT TO NO OTHER TILE. Increase your MC production 1 step.',
    requiredMaxOxygen: 4,
    tags: [Tag.Building, Tag.Science],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 10,
    deck: Deck.Basic,
    name: 'Nuclear Power',
    oneTimeText:
      'Decrease your MC production 2 steps and increase your energy production 3 steps.',
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated
  },
  {
    cost: 8,
    deck: Deck.Corporate,
    name: 'Lightning Harvest',
    oneTimeText:
      'Requires 3 science tags. Increase your energy production and your MC production 1 step each.',
    requiredScience: 3,
    tags: [Tag.Energy],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 10,
    deck: Deck.Basic,
    gainPlant: 1,
    name: 'Algae',
    oneTimeText:
      'Requires 5 ocean tiles. Gain 1 plant and increase your plant production 2 steps.',
    requiredOcean: 5,
    tags: [Tag.Plant],
    type: CardType.Automated
  },
  {
    cost: 9,
    deck: Deck.Basic,
    name: 'Adapted Lichen',
    oneTimeText: 'Increase your plant production 1 step.',
    tags: [Tag.Plant],
    type: CardType.Automated
  },
  {
    actionOrEffectText: 'Action: Add 1 microbe to this card.',
    cost: 4,
    deck: Deck.Corporate,
    holdsResource: Resource.Microbe,
    name: 'Tardigrades',
    oneTimeText: '1 VP per 4 microbes on this card.',
    tags: [Tag.Microbe],
    type: CardType.Active
  },
  {
    cost: 1,
    deck: Deck.Corporate,
    name: 'Virus',
    oneTimeText: 'Remove up to 2 animals or 5 plants from any player.',
    tags: [Tag.Event, Tag.Microbe],
    type: CardType.Event
  },
  {
    cost: 12,
    deck: Deck.Corporate,
    name: 'Miranda Resort',
    oneTimeText:
      'Increase your MC production 1 step for each Earth tag you have.',
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    actionOrEffectText: 'Action: Add 1 animal to this card.',
    cost: 9,
    deck: Deck.Basic,
    holdsResource: Resource.Animal,
    name: 'Fish',
    oneTimeText:
      'Requires 2°C or warmer. Decrease any plant production 1 step. 1 VP for each animal on this card.',
    requiredTemperature: 2,
    tags: [Tag.Animal],
    type: CardType.Active
  },
  {
    cost: 18,
    deck: Deck.Basic,
    name: 'Lake Marineris',
    ocean: 2,
    oneTimeText: 'Requires 0°C or warmer. Place 2 ocean tiles.',
    requiredTemperature: 0,
    tags: [],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    actionOrEffectText: 'Action: Add 1 animal to this card.',
    cost: 6,
    deck: Deck.Basic,
    holdsResource: Resource.Animal,
    name: 'Small Animals',
    oneTimeText:
      'Requires 6% oxygen. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
    requiredOxygen: 6,
    tags: [Tag.Animal],
    type: CardType.Active
  },
  {
    cost: 17,
    deck: Deck.Basic,
    gainPlant: 2,
    name: 'Kelp Farming',
    oneTimeText:
      'Requires 6 ocean tiles. Increase your MC production 2 steps and your plant production 3 steps. Gain 2 plants.',
    requiredOcean: 6,
    tags: [],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 4,
    deck: Deck.Corporate,
    name: 'Mine',
    oneTimeText: 'Increase your steel production 1 step.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 15,
    deck: Deck.Corporate,
    name: 'Vesta Shipyard',
    oneTimeText: 'Increase your titanium production 1 step.',
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 32,
    deck: Deck.Basic,
    name: 'Beam From a Thorium Asteroid',
    oneTimeText:
      'Requires a Jovian tag. Increase your heat production and energy production 3 steps each.',
    requiredJovian: 1,
    tags: [Tag.Energy, Tag.Jovian, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 12,
    deck: Deck.Basic,
    name: 'Mangrove',
    oneTimeText:
      'Requires +4°C or warmer. Place a Greenery tile ON AN AREA RESERVED FOR OCEAN and raise oxygen 1 step. Disregard normal placement restrictions for this.',
    oxygen: 1,
    requiredTemperature: 4,
    tags: [Tag.Plant],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 13,
    deck: Deck.Basic,
    gainPlant: 1,
    name: 'Trees',
    oneTimeText:
      'Requires -4°C or warmer. Increase your plant production 3 steps. Gain 1 plant.',
    requiredTemperature: -4,
    tags: [Tag.Plant],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 6,
    deck: Deck.Corporate,
    name: 'Great Escarpment Consortium',
    oneTimeText:
      'Requires that you have steel production. Decrease any steel production 1 step and increase your own 1 step',
    tags: [],
    type: CardType.Automated
  },
  {
    cost: 5,
    deck: Deck.Corporate,
    gainSteel: 5,
    name: 'Mineral Deposit',
    oneTimeText: 'Gain 5 steel.',
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    cost: 12,
    deck: Deck.Basic,
    gainSteel: 2,
    name: 'Mining Expedition',
    oneTimeText:
      'Raise oxygen 1 step. Remove 2 plants from any player. Gain 2 steel.',
    oxygen: 1,
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    cost: 4,
    deck: Deck.Corporate,
    name: 'Mining Area',
    oneTimeText:
      'Place [the mining] tile on an area with a steel or titanium placement bonus, adjacent to another of your tiles. Increase your production of that resource 1 step.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 6,
    deck: Deck.Corporate,
    name: 'Building Industries',
    oneTimeText:
      'Decrease your energy production 1 step and increase your steel production 2 steps.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 1,
    deck: Deck.Corporate,
    name: 'Land Claim',
    oneTimeText:
      'Place your marker on a non-reserved area. Only you may place a tile here',
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    cost: 9,
    deck: Deck.Basic,
    name: 'Mining Rights',
    oneTimeText:
      'Place [the mining] tile on an area with a steel or titanium placement bonus. Increase that production 1 step.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 6,
    deck: Deck.Corporate,
    name: 'Sponsors',
    oneTimeText: 'Increase your MC production 2  steps.',
    tags: [Tag.Earth],
    type: CardType.Automated
  },
  {
    actionOrEffectText: 'Action: Spend 1 plant or 1 steel to gain 7 MC',
    cost: 17,
    deck: Deck.Corporate,
    name: 'Electro Catapult',
    oneTimeText:
      'Oxygen must be 8% or less. Decrease your energy production 1 step.',
    requiredMaxOxygen: 8,
    tags: [Tag.Building],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    actionOrEffectText:
      'Effect: when you play a card, you pay 2 MC less for it.',
    cost: 23,
    deck: Deck.Corporate,
    name: 'Earth Catapult',
    tags: [Tag.Earth],
    type: CardType.Active,
    victoryPoints: 2
  },
  {
    actionOrEffectText:
      'Effect: Each titanium you have is worth 1MC extra. Each steel you have is worth 1 MC extra.',
    cost: 9,
    deck: Deck.Corporate,
    name: 'Advanced Alloys',
    tags: [Tag.Science],
    type: CardType.Active
  },
  {
    actionOrEffectText: 'Action: Add an animal to this card.',
    cost: 10,
    deck: Deck.Basic,
    holdsResource: Resource.Animal,
    name: 'Birds',
    oneTimeText:
      'Requires 13% oxygen. Decrease any plant production 2 steps. 1 VP for each animal on this card',
    requiredOxygen: 13,
    tags: [Tag.Animal],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Effect: When you play a science tag, including this, you may discard a card from hand to draw a card.',
    cost: 8,
    deck: Deck.Corporate,
    name: 'Mars University',
    tags: [Tag.Building, Tag.Science],
    type: CardType.Active,
    victoryPoints: 1,
    condition: condition => condition.tag === Tag.Science,
    effect: effect => effect.discardThenDraw()
  },
  {
    actionOrEffectText:
      'Effect: When you play a plant, microbe, or an animal tag, including this, gain 1 plant or add 1 resource TO THAT CARD.',
    cost: 9,
    deck: Deck.Corporate,
    name: 'Viral Enhancers',
    tags: [Tag.Microbe, Tag.Science],
    type: CardType.Active,
    condition: condition =>
      condition.tag === Tag.Plant ||
      condition.tag === Tag.Microbe ||
      condition.tag === Tag.Animal,
    effect: effect =>
      effect.gainOneResource(
        [Resource.Plant, Resource.Microbe, Resource.Animal],
        effect.condition.card
      )
  },
  {
    cost: 23,
    deck: Deck.Basic,
    gainPlant: 2,
    name: 'Towing a Comet',
    ocean: 1,
    oneTimeText:
      'Gain 2 plants. Raise oxygen level 1 step and place an ocean tile.',
    oxygen: 1,
    tags: [Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    actionOrEffectText:
      'Action: Spend 7MC to increase your energy production 1 step.',
    cost: 3,
    deck: Deck.Basic,
    name: 'Space Mirrors',
    tags: [Tag.Energy, Tag.Space],
    type: CardType.Active
  },
  {
    cost: 11,
    deck: Deck.Basic,
    gainTitanium: 2,
    name: 'Solar Wind Power',
    oneTimeText: 'Increase your energy production 1 step and gain 2 titanium.',
    tags: [Tag.Energy, Tag.Science, Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 23,
    deck: Deck.Basic,
    name: 'Ice Asteroid',
    ocean: 2,
    oneTimeText: 'Place 2 ocean tiles.',
    tags: [Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    actionOrEffectText:
      'Effect: When you play a space card, you pay 2 MC less for it',
    cost: 13,
    deck: Deck.Corporate,
    name: 'Quantum Extractor',
    requiredScience: 4,
    tags: [Tag.Energy, Tag.Science],
    type: CardType.Active
  },
  {
    cost: 36,
    deck: Deck.Basic,
    name: 'Giant Ice Asteroid',
    ocean: 2,
    oneTimeText:
      'Raise temperature 2 steps and place 2 ocean tiles. Remove up to 6 plants from any plyer.',
    tags: [Tag.Event, Tag.Space],
    temperature: 2,
    type: CardType.Event
  },
  {
    cost: 20,
    deck: Deck.Basic,
    name: 'Ganymede Colony',
    oneTimeText:
      'Place a city tile ON THE RESERVED AREA [for Ganymede Colony]. 1 VP per Jovian tag you have.',
    tags: [Tag.City, Tag.Jovian, Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 24,
    deck: Deck.Corporate,
    name: 'Callisto Penal Mines',
    oneTimeText: 'Increase your MC production 3 steps.',
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 17,
    deck: Deck.Basic,
    name: 'Giant Space Mirror',
    oneTimeText: 'Increase your energy production 3 steps.',
    tags: [Tag.Energy, Tag.Space],
    type: CardType.Automated
  },
  {
    actionOrEffectText: '',
    cost: 6,
    deck: Deck.Corporate,
    name: 'Trans-Neptune Probe',
    tags: [Tag.Science, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 16,
    deck: Deck.Corporate,
    name: 'Commercial District',
    oneTimeText:
      'Decrease your energy production 1 step and increase your MC production 4 steps. Place [the commercial district] tile. 1 VP PER ADJACENT CITY TILE.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 9,
    deck: Deck.Corporate,
    name: 'Robotic Workforce',
    oneTimeText:
      'Duplicate only the production box of one of your building cards.',
    tags: [Tag.Science],
    type: CardType.Automated
  },
  {
    cost: 11,
    deck: Deck.Basic,
    gainPlant: 3,
    name: 'Grass',
    oneTimeText:
      'Requires -16°C or warmer. Increase your plant production 1 step. Gain 3 plants.',
    requiredTemperature: -16,
    tags: [Tag.Plant],
    type: CardType.Automated
  },
  {
    cost: 6,
    deck: Deck.Basic,
    gainPlant: 1,
    name: 'Heather',
    oneTimeText:
      'Requires -14°C or warmer. Increase your plant production 1 step. Gain 1 plant.',
    requiredTemperature: -14,
    tags: [Tag.Plant],
    type: CardType.Automated
  },
  {
    cost: 7,
    deck: Deck.Basic,
    name: 'Peroxide Power',
    oneTimeText:
      'Decrease your MC production 1 step and increase your energy production 2 steps.',
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated
  },
  {
    cost: 11,
    deck: Deck.Corporate,
    name: 'Research',
    oneTimeText: 'Counts as playing 2 science cards. Draw 2 cards.',
    tags: [Tag.Science, Tag.Science],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 12,
    deck: Deck.Corporate,
    name: 'Gene Repair',
    oneTimeText:
      'Requires 3 science tags. Increase your MC production 2 steps.',
    requiredScience: 3,
    tags: [Tag.Science],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 41,
    deck: Deck.Corporate,
    name: 'Io Mining Industries',
    oneTimeText:
      'Increase your titanium production 2 steps and your MC production 2 steps. 1 VP per Jovian tag you have.',
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 10,
    deck: Deck.Basic,
    gainPlant: 2,
    name: 'Bushes',
    oneTimeText:
      'Requires -10°C or warmer. Increase your plant production 2 steps. Gain 2 plants.',
    requiredTemperature: -10,
    tags: [Tag.Plant],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When you play a space card, you pay 2 MC less for it.',
    cost: 8,
    deck: Deck.Corporate,
    name: 'Mass Converter',
    oneTimeText:
      'Requires 5 science tags. Increase your energy production 6 steps.',
    requiredScience: 5,
    tags: [Tag.Energy, Tag.Science],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Spend 6 energy to add a science resource to this card.',
    cost: 12,
    deck: Deck.Corporate,
    holdsResource: Resource.Science,
    name: 'Physics Complex',
    oneTimeText: '2 VP for each science resource on this card.',
    tags: [Tag.Building, Tag.Science],
    type: CardType.Active
  },
  {
    cost: 6,
    deck: Deck.Basic,
    name: 'Greenhouses',
    oneTimeText: 'Gain 1 plant for each city tile in play.',
    tags: [Tag.Building, Tag.Plant],
    type: CardType.Automated
  },
  {
    cost: 10,
    deck: Deck.Basic,
    name: 'Nuclear Zone',
    oneTimeText:
      'Place [the nuclear zone] tile and raise the temperature 2 steps.',
    tags: [Tag.Earth],
    temperature: 2,
    type: CardType.Automated,
    victoryPoints: -2
  },
  {
    cost: 13,
    deck: Deck.Corporate,
    name: 'Tropical Resort',
    oneTimeText:
      'Decrease your heat production 2 steps and increase your MC production 3 steps.',
    tags: [Tag.Building],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 12,
    deck: Deck.Corporate,
    name: 'Toll Station',
    oneTimeText:
      'Increase your MC production 1 step for each space tag your OPPONENTS have.',
    tags: [Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 1,
    deck: Deck.Basic,
    name: 'Fueled Generators',
    oneTimeText:
      'Decrease your MC production 1 step and increase your energy production 1 step.',
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Spend 4 energy to gain 1 steel and increase oxygen 1 step.',
    cost: 11,
    deck: Deck.Basic,
    name: 'Ironworks',
    tags: [Tag.Building],
    type: CardType.Active
  },
  {
    cost: 18,
    deck: Deck.Basic,
    name: 'Power Grid',
    oneTimeText:
      'Increase your energy production 1 step for each power tag you have, including this.)',
    tags: [Tag.Energy],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Spend 4 energy to gain 2 steel and increase oxygen 1 step.',
    cost: 15,
    deck: Deck.Basic,
    name: 'Steelworks',
    tags: [Tag.Building],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Spend 4 energy to gain 1 titanium and increase oxygen 1 step.',
    cost: 13,
    deck: Deck.Basic,
    name: 'Ore Processor',
    tags: [Tag.Building],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Effect: When you play an Earth tag, you pay 3 MC less for it.',
    cost: 1,
    deck: Deck.Corporate,
    name: 'Earth Office',
    tags: [Tag.Earth],
    type: CardType.Active
  },
  {
    cost: 10,
    deck: Deck.Corporate,
    name: 'Acquired Company',
    oneTimeText: 'Increase your MC production 3 steps.',
    tags: [Tag.Earth],
    type: CardType.Automated
  },
  {
    cost: 8,
    deck: Deck.Corporate,
    name: 'Media Archives',
    oneTimeText: 'Gain 1 MC for each event EVER PLAYED by all players',
    tags: [Tag.Earth],
    type: CardType.Automated
  },
  {
    cost: 23,
    deck: Deck.Basic,
    gainPlant: 2,
    name: 'Open City',
    oneTimeText:
      'Requires 12% oxygen. Decrease your energy production 1 step and increase your MC production 4 steps. Gain 2 plants and place a city tile.',
    requiredOxygen: 12,
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    actionOrEffectText: 'Effect: After you play an event card, you gain 3MC',
    cost: 6,
    deck: Deck.Corporate,
    name: 'Media Group',
    tags: [Tag.Earth],
    type: CardType.Active,
    condition: condition => condition.card.type === CardType.Event,
    effect: effect => effect.gainResource(Resource.Megacredit, 3)
  },
  {
    actionOrEffectText:
      'Action: Look at the top card and either buy it or discard it',
    cost: 4,
    deck: Deck.Corporate,
    name: 'Business Network',
    oneTimeText: 'Decrease your MC production 1 step.',
    tags: [Tag.Earth],
    type: CardType.Active
  },
  {
    cost: 7,
    deck: Deck.Corporate,
    name: 'Business Contacts',
    oneTimeText:
      'Look at the top 4 cards from the deck. Take 2 of them into hand and discard the other 2',
    tags: [Tag.Earth, Tag.Event],
    type: CardType.Event
  },
  {
    terraformRatingIncrease: 2,
    cost: 7,
    deck: Deck.Corporate,
    name: 'Bribed Committee',
    oneTimeText: 'Raise your terraform rating 2 steps.',
    tags: [Tag.Earth, Tag.Event],
    type: CardType.Event,
    victoryPoints: -2
  },
  {
    cost: 11,
    deck: Deck.Basic,
    name: 'Solar Power',
    oneTimeText: 'Increase your energy production 1 step.',
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 11,
    deck: Deck.Basic,
    name: 'Breathing Filters',
    oneTimeText: 'Requires 7% oxygen.',
    requiredOxygen: 7,
    tags: [Tag.Science],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 12,
    deck: Deck.Basic,
    name: 'Artificial Photosynthesis',
    oneTimeText:
      'Increase your plant production 1 step or your energy production 2 steps.',
    tags: [Tag.Science],
    type: CardType.Automated
  },
  {
    cost: 15,
    deck: Deck.Basic,
    name: 'Artificial Lake',
    ocean: 1,
    oneTimeText:
      'Requires -6°C or warmer. Place 1 ocean tile ON AN AREA NOT RESERVED FOR OCEAN.',
    requiredTemperature: -6,
    tags: [Tag.Building],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 11,
    deck: Deck.Basic,
    name: 'Geothermal Power',
    oneTimeText: 'Increase your energy production 2 steps.',
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated
  },
  {
    cost: 16,
    deck: Deck.Basic,
    gainPlant: 2,
    name: 'Farming',
    oneTimeText:
      'Requires +4°C or warmer. Increase your MC production 2 steps and your plant production 2 steps. Gain 2 plants.',
    requiredTemperature: 4,
    tags: [Tag.Plant],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 2,
    deck: Deck.Basic,
    name: 'Dust Seals',
    oneTimeText: 'Requires 3 or less ocean tiles.',
    requiredMaxOcean: 3,
    tags: [],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 10,
    deck: Deck.Basic,
    name: 'Urbanized Area',
    oneTimeText:
      'Decrease your energy production 1 step and increase your MC production 2 steps. Place a city tile ADJACENT TO AT LEAST 2 OTHER CITY TILES.',
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated
  },
  {
    cost: 1,
    deck: Deck.Corporate,
    name: 'Sabotage',
    oneTimeText:
      'Remove up to 3 titanium from any player, or 4 steel, or 7 MC.',
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    cost: 4,
    deck: Deck.Basic,
    gainPlant: -1,
    name: 'Moss',
    oneTimeText:
      'Requires 3 ocean tiles and that you lose 1 plant. Increase your plant production 1 step.',
    requiredOcean: 3,
    tags: [Tag.Plant],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Spend 7 MC to increase your steel production 1 step.',
    cost: 4,
    deck: Deck.Corporate,
    name: 'Industrial Center',
    oneTimeText: 'Place [the Industrial Center] tile ADJACENT TO A CITY TILE.',
    tags: [Tag.Building],
    type: CardType.Active
  },
  {
    cost: 1,
    deck: Deck.Corporate,
    name: 'Hired Raiders',
    oneTimeText: 'Steal up to 2 steel, or 3MC from any player.',
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    cost: 3,
    deck: Deck.Corporate,
    name: 'Hackers',
    oneTimeText:
      'Decrease your energy production 1 step and any MC production 2 steps. Increase your MC production 2 steps.',
    tags: [],
    type: CardType.Automated,
    victoryPoints: -1
  },
  {
    cost: 11,
    deck: Deck.Basic,
    name: 'GHG Factories',
    oneTimeText:
      'Decrease your energy production 1 step and increase your heat production 4 steps.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 11,
    deck: Deck.Basic,
    name: 'Subterranean Reservoir',
    ocean: 1,
    oneTimeText: 'Place 1 ocean tile.',
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    actionOrEffectText:
      'Effect: When you play an animal or a plant tag (including these 2), add an animal to this card.',
    cost: 12,
    deck: Deck.Basic,
    holdsResource: Resource.Animal,
    name: 'Ecological Zone',
    oneTimeText:
      'Requires that you have a greenery tile. Place [the Ecological Zone] tile ADJACENT TO ANY GREENERY TILE. 1 VP per 2 animals on this card.',
    tags: [Tag.Animal, Tag.Plant],
    type: CardType.Active,
    condition: condition =>
      condition.tag === Tag.Animal || condition.tag === Tag.Plant,
    effect(effect) {
      effect.gainOneResource([Resource.Animal], this);
    }
  },
  {
    cost: 13,
    deck: Deck.Basic,
    name: 'Zeppelins',
    oneTimeText:
      'Requires 5% oxygen. Increase your MC production 1 step for each city tile ON MARS.',
    requiredOxygen: 5,
    tags: [],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 8,
    deck: Deck.Basic,
    name: 'Worms',
    oneTimeText:
      'Requires 4% oxygen. Increase your plant production 1 step for every 2 microbe tags you have, including this.',
    requiredOxygen: 4,
    tags: [Tag.Microbe],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When you play an animal, plant, or microbe tag, including this, add a microbe to this card.',
    cost: 5,
    deck: Deck.Basic,
    holdsResource: Resource.Microbe,
    name: 'Decomposers',
    oneTimeText: 'Requires 3# oxygen. 1 VP per 3 microbes on this card.',
    requiredOxygen: 3,
    tags: [Tag.Microbe],
    type: CardType.Active,
    condition: condition =>
      [Tag.Animal, Tag.Plant, Tag.Microbe].includes(condition.tag),
    effect(effect) {
      effect.gainOneResource([Resource.Microbe], this);
    }
  },
  {
    cost: 14,
    deck: Deck.Basic,
    name: 'Fusion Power',
    oneTimeText:
      'Requires 2 power tags. Increase your energy production 3 steps.',
    requiredEnergy: 2,
    tags: [Tag.Building, Tag.Energy, Tag.Science],
    type: CardType.Automated
  },
  {
    actionOrEffectText: 'Action: Add a microbe to ANOTHER card.',
    cost: 4,
    deck: Deck.Basic,
    name: 'Symbiotic Fungus',
    oneTimeText: 'Requires -14°C or warmer.',
    requiredTemperature: -14,
    tags: [Tag.Microbe],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Gain 1 plant or add 2 microbes to ANOTHER card.',
    cost: 13,
    deck: Deck.Basic,
    name: 'Extreme-Cold Fungus',
    oneTimeText: 'It must be -10°C or colder.',
    requiredMaxTemperature: -10,
    tags: [Tag.Microbe],
    type: CardType.Active
  },
  {
    cost: 11,
    deck: Deck.Basic,
    name: 'Advanced Ecosystems',
    oneTimeText: 'Requires a plant tag, a microbe tag, and an animal tag.',
    requiredAnimal: 1,
    requiredMicrobe: 1,
    requiredPlant: 1,
    tags: [Tag.Animal, Tag.Microbe, Tag.Plant],
    type: CardType.Automated,
    victoryPoints: 3
  },
  {
    cost: 12,
    deck: Deck.Basic,
    name: 'Great Dam',
    oneTimeText:
      'Requires 4 ocean tiles. Increase your energy production 2 steps.',
    requiredOcean: 4,
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 8,
    deck: Deck.Corporate,
    name: 'Cartel',
    oneTimeText:
      'Increase your MC production 1 step for each Earth tag you have, including this.',
    tags: [Tag.Earth],
    type: CardType.Automated
  },
  {
    cost: 25,
    deck: Deck.Basic,
    name: 'Strip Mine',
    oneTimeText:
      'Decrease your energy production 2 steps. Increase your steel production 2 steps and your titanium production 1 step. Raise oxygen 2 steps.',
    oxygen: 2,
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 8,
    deck: Deck.Basic,
    name: 'Wave Power',
    oneTimeText:
      'Requires 3 ocean tiles. Increase your energy production 1 step.',
    requiredOcean: 3,
    tags: [Tag.Energy],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 18,
    deck: Deck.Basic,
    name: 'Lava Flows',
    oneTimeText:
      'Raise the temperature 2 steps and place this [the Lava Flow] tile ON EITHER THARSIS THOLUS, ASCRAEUS MONS, PAVONIS MONS OR ARSIA MONS.',
    tags: [Tag.Event],
    temperature: 2,
    type: CardType.Event
  },
  {
    cost: 4,
    deck: Deck.Basic,
    name: 'Power Plant',
    oneTimeText: 'Increase your energy production 1 step.',
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated
  },
  {
    cost: 20,
    deck: Deck.Basic,
    name: 'Mohole Area',
    oneTimeText:
      'Increase your heat production 4 steps. Place [the Mohole Area] tile ON AN AREA RESERVED FOR OCEAN.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 36,
    deck: Deck.Basic,
    name: 'Large Convoy',
    ocean: 1,
    oneTimeText:
      'Place an ocean tile and draw 2 cards. Gain 5 plants, or add 4 animals to ANOTHER card.',
    tags: [Tag.Earth, Tag.Event, Tag.Space],
    type: CardType.Event,
    victoryPoints: 2
  },
  {
    cost: 7,
    deck: Deck.Corporate,
    name: 'Titanium Mine',
    oneTimeText: 'Increase your titanium production 1 step.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 18,
    deck: Deck.Basic,
    name: 'Tectonic Stress Power',
    oneTimeText:
      'Requires 2 science tags. Increase your energy production 3 steps.',
    requiredScience: 2,
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 8,
    deck: Deck.Basic,
    gainPlant: -2,
    name: 'Nitrophilic Moss',
    oneTimeText:
      'Requires 3 ocean tiles and that you lose 2 plants. Increase your plant production 2 steps.',
    requiredOcean: 3,
    tags: [Tag.Plant],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When you place a greenery tile, add an animal to this card.',
    cost: 12,
    deck: Deck.Basic,
    holdsResource: Resource.Animal,
    name: 'Herbivores',
    oneTimeText:
      'Requires 8% oxygen. Add 1 animal to this card. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
    requiredOxygen: 8,
    tags: [Tag.Animal],
    type: CardType.Active,
    condition: condition => condition.tileType === TileType.Greenery,
    effect(effect) {
      effect.gainOneResource([Resource.Animal], this);
    }
  },
  {
    cost: 9,
    deck: Deck.Basic,
    name: 'Insects',
    oneTimeText:
      'Requires 6% oxygen. Increase your plant production 1 step for each plant tag you have.',
    requiredOxygen: 6,
    tags: [Tag.Microbe],
    type: CardType.Automated
  },
  {
    cost: 1,
    deck: Deck.Corporate,
    name: "CEO's Favourite Project",
    oneTimeText: 'Add 1 resource to a card with at least 1 resource on it.',
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    actionOrEffectText:
      'Effect: when you play a card, you pay 2 MC less for it.',
    cost: 14,
    deck: Deck.Corporate,
    name: 'Anti-Gravity Technology',
    oneTimeText: 'Requires 7 science tags.',
    requiredScience: 7,
    tags: [Tag.Science],
    type: CardType.Active,
    victoryPoints: 3
  },
  {
    cost: 3,
    deck: Deck.Corporate,
    gainMegacredit: 10,
    name: 'Investment Loan',
    oneTimeText: 'Decrease your MC production 1 step. Gain 10 MC.',
    tags: [Tag.Earth, Tag.Event],
    type: CardType.Event
  },
  {
    cost: 2,
    deck: Deck.Basic,
    name: 'Insulation',
    oneTimeText:
      'Decrease your heat production any number of steps and increase your MC production the same number of steps.',
    tags: [],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: Your global requirements are +2 or -2 steps, your choice in each case.',
    cost: 12,
    deck: Deck.Basic,
    name: 'Adaptation Technology',
    tags: [Tag.Science],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    actionOrEffectText:
      'Action: Spend 8 heat to increase your terraforming rating 1 step.',
    cost: 3,
    deck: Deck.Corporate,
    name: 'Caretaker Contract',
    oneTimeText: 'Requires 0°C or warmer.',
    requiredTemperature: 0,
    tags: [],
    type: CardType.Active
  },
  {
    cost: 16,
    deck: Deck.Basic,
    name: 'Designed Microorganisms',
    oneTimeText:
      'It must be -14°C or colder. Increase your plant production 2 steps.',
    requiredMaxTemperature: -14,
    tags: [Tag.Microbe, Tag.Science],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: After you pay for a standard project, except selling patents, you gain 3 MC.',
    cost: 6,
    deck: Deck.Corporate,
    name: 'Standard Technology',
    tags: [Tag.Science],
    type: CardType.Active,
    condition: condition => condition.actionType === ActionType.StandardProject,
    effect: effect => effect.gainResource(Resource.Megacredit, 3)
  },
  {
    actionOrEffectText:
      'Action: Add 1 microbe to this card, or remove 3 microbes to increase your TR 1 step.',
    cost: 11,
    deck: Deck.Basic,
    holdsResource: Resource.Microbe,
    name: 'Nitrite Reducing Bacteria',
    oneTimeText: 'Add 3 microbes to this card.',
    tags: [Tag.Microbe],
    type: CardType.Active
  },
  {
    cost: 12,
    deck: Deck.Basic,
    name: 'Industrial Microbes',
    oneTimeText:
      'Increase your energy production and your steel production 1 step each.',
    tags: [Tag.Building, Tag.Microbe],
    type: CardType.Automated
  },
  {
    cost: 7,
    deck: Deck.Basic,
    name: 'Lichen',
    oneTimeText:
      'Requires -24°C or warmer. Increase your plant production 1 step.',
    requiredTemperature: -24,
    tags: [Tag.Plant],
    type: CardType.Automated
  },
  {
    cost: 5,
    deck: Deck.Corporate,
    name: 'Power Supply Consortium',
    oneTimeText:
      'Requires 2 power tags. Decrease any energy production 1 step and increase your own 1 step.',
    requiredEnergy: 2,
    tags: [Tag.Energy],
    type: CardType.Automated
  },
  {
    cost: 15,
    deck: Deck.Basic,
    name: 'Convoy From Europa',
    ocean: 1,
    oneTimeText: 'Place 1 ocean tile and draw 1 card.',
    tags: [Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    cost: 7,
    deck: Deck.Basic,
    gainHeat: 3,
    name: 'Imported GHG',
    oneTimeText: 'Increase your heat production 1 step and gain 3 hear.',
    tags: [Tag.Earth, Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    terraformRatingIncrease: 1,
    cost: 23,
    deck: Deck.Basic,
    gainPlant: 4,
    name: 'Imported Nitrogen',
    oneTimeText:
      'Raise your TR 1 step and gain 4 plants. Add 3 microbes to ANOTHER card and 2 animals to ANOTHER card.',
    tags: [Tag.Earth, Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    cost: 3,
    deck: Deck.Basic,
    name: 'Micro-Mills',
    oneTimeText: 'Increase your heat production 1 step.',
    tags: [],
    type: CardType.Automated
  },
  {
    terraformRatingIncrease: 3,
    cost: 20,
    deck: Deck.Basic,
    name: 'Magnetic Field Generators',
    oneTimeText:
      'Decrease your energy production 4 steps and increase your plant production 2 steps. Raise your TR 3 steps.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When you play a space card, you pay 2MC less for it.',
    cost: 10,
    deck: Deck.Basic,
    name: 'Shuttles',
    oneTimeText:
      'Requires 5% oxygen. Decrease your energy production 1 step and increase your MC production 2 steps.',
    requiredOxygen: 5,
    tags: [Tag.Space],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    cost: 9,
    deck: Deck.Basic,
    name: 'Import of Advanced GHG',
    oneTimeText: 'Increase your heat production 2 steps.',
    tags: [Tag.Earth, Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    cost: 6,
    deck: Deck.Basic,
    name: 'Windmills',
    oneTimeText: 'Requires 7% oxygen. Increase your energy production 1 step.',
    requiredOxygen: 7,
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 16,
    deck: Deck.Basic,
    gainPlant: 1,
    name: 'Tundra Farming',
    oneTimeText:
      'Requires -6°C or warmer. Increase your plant production 1 step and your MC production 2 steps. Gain 1 plant.',
    requiredTemperature: -6,
    tags: [Tag.Plant],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 26,
    deck: Deck.Basic,
    name: 'Aerobraked Ammonia Asteroid',
    oneTimeText:
      'Add 2 microbes to ANOTHER card. Increase your heat production 3 steps and your plant production 1 step.',
    tags: [Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    terraformRatingIncrease: 1,
    cost: 5,
    deck: Deck.Basic,
    name: 'Magnetic Field Dome',
    oneTimeText:
      'Decrease your energy production 2 steps and increase your plant production 1 step. Raise your terraform rating 1 step.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When any city tile is placed, add an animal to this card.\nAnimals may not be removed from this card.',
    cost: 10,
    deck: Deck.Basic,
    holdsResource: Resource.Animal,
    name: 'Pets',
    oneTimeText: 'Add 1 animal to this card. 1 VP per 2 animals here.',
    tags: [Tag.Animal, Tag.Earth],
    type: CardType.Active,
    condition: condition => condition.tileType === TileType.City,
    effect(effect) {
      effect.gainOneResource([Resource.Animal], this);
    }
  },
  {
    actionOrEffectText:
      '[Effect: ]Opponents may not remove your [plants, animals or microbes]',
    cost: 5,
    deck: Deck.Corporate,
    name: 'Protected Habitats',
    tags: [],
    type: CardType.Active
  },
  {
    cost: 23,
    deck: Deck.Basic,
    name: 'Protected Valley',
    oneTimeText:
      'Increase your MC production 2 steps. Place a greenery tile ON AN AREA RESERVED FOR OCEAN, disregarding normal placement restrictions, and increase oxygen 1 step.',
    oxygen: 1,
    tags: [Tag.Building, Tag.Plant],
    type: CardType.Automated
  },
  {
    cost: 10,
    deck: Deck.Corporate,
    name: 'Satellites',
    oneTimeText:
      'Increase your MC production 1 step for each space tag you have, including this one.',
    tags: [Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 10,
    deck: Deck.Basic,
    gainPlant: 2,
    name: 'Noctis Farming',
    oneTimeText:
      'Requires -20°C or warmer. Increase your MC production 1 step and gain 2 plants.',
    requiredTemperature: -20,
    tags: [Tag.Building, Tag.Plant],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    actionOrEffectText: 'Action: Spend 3 energy to raise oxygen 1 step.',
    cost: 12,
    deck: Deck.Basic,
    name: 'Water Splitting Plant',
    oneTimeText: 'Requires 2 ocean tiles.',
    requiredOcean: 2,
    tags: [Tag.Building],
    type: CardType.Active
  },
  {
    cost: 6,
    deck: Deck.Basic,
    name: 'Heat Trappers',
    oneTimeText:
      'Decrease any heat production 2 steps and increase your energy production 1 step.',
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated,
    victoryPoints: -1
  },
  {
    cost: 9,
    deck: Deck.Basic,
    name: 'Soil Factory',
    oneTimeText:
      'Decrease your energy production 1 step and increase your plant production 1 step.',
    tags: [Tag.Building],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 6,
    deck: Deck.Corporate,
    name: 'Fuel Factory',
    oneTimeText:
      'Decreases your energy production 1 step and increase your titanium and your MC production 1 step each.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 5,
    deck: Deck.Basic,
    name: 'Ice cap Melting',
    ocean: 1,
    oneTimeText: 'Requires +2°C or warmer. Place 1 ocean tile.',
    requiredTemperature: 2,
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    cost: 11,
    deck: Deck.Corporate,
    name: 'Corporate Stronghold',
    oneTimeText:
      'Decrease your energy production 1 step and increase your MC production 3 steps. Place a city tile.',
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated,
    victoryPoints: -2
  },
  {
    cost: 4,
    deck: Deck.Basic,
    name: 'Biomass Combustors',
    oneTimeText:
      'Requires 6% oxygen. Decrease any plant production 1 step and increase your energy production 2 steps.',
    requiredOxygen: 6,
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Automated,
    victoryPoints: -1
  },
  {
    actionOrEffectText: 'Action: Add 1 animal to this card.',
    cost: 13,
    deck: Deck.Basic,
    holdsResource: Resource.Animal,
    name: 'Livestock',
    oneTimeText:
      'Requires 9% oxygen. Decrease your plant production 1 step and increase your MC production 2 steps. 1 VP for each animal on this card.',
    requiredOxygen: 9,
    tags: [Tag.Animal],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Effect: When you play a science tag, including this, either add a science resource to this card, or remove a science resource from this card to draw a card.',
    cost: 10,
    deck: Deck.Corporate,
    holdsResource: Resource.Science,
    name: 'Olympus Conference',
    tags: [Tag.Building, Tag.Earth, Tag.Science],
    type: CardType.Active,
    victoryPoints: 1,
    condition: condition => condition.tag === Tag.Science,
    effect: effect =>
      effect.addOrRemoveOneResource(Resource.Science, () => {
        effect.drawCard();
      })
  },
  {
    cost: 6,
    deck: Deck.Corporate,
    name: 'Rad-Suits',
    oneTimeText:
      'Requires 2 cities in play. Increase your MC production 1 step.',
    tags: [],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    actionOrEffectText:
      'Action: Spend 8 MC to place 1 ocean tile. STEEL MAY BE USED as if you were playing a building card.',
    cost: 18,
    deck: Deck.Basic,
    name: 'Aquifer Pumping',
    tags: [Tag.Building],
    type: CardType.Active
  },
  {
    cost: 7,
    deck: Deck.Basic,
    name: 'Flooding',
    ocean: 1,
    oneTimeText:
      'Place an ocean tile. IF THERE ARE TILES ADJACENT TO THIS OCEAN TILE, YOU MAY REMOVE 4 MC FROM THE OWNER OF ONE OF THOSE TILES.',
    tags: [Tag.Event],
    type: CardType.Event,
    victoryPoints: -1
  },
  {
    cost: 15,
    deck: Deck.Basic,
    name: 'Energy Saving',
    oneTimeText:
      'Increase your energy production 1 step for each city tile in play.',
    tags: [Tag.Energy],
    type: CardType.Automated
  },
  {
    cost: 1,
    deck: Deck.Basic,
    gainHeat: -5,
    name: 'Local Heat Trapping',
    oneTimeText:
      'Spend 5 heat to either gain 4 plants, or to add 2 animals to ANOTHER card.',
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    cost: 8,
    deck: Deck.Basic,
    name: 'Permafrost extraction',
    oneTimeText: 'Requires -8°C or warmer. Place 1 ocean tile.',
    requiredTemperature: -8,
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    cost: 2,
    deck: Deck.Corporate,
    name: 'Invention Contest',
    oneTimeText:
      'Look at the top 3 cards from the deck. Take 1 of them into hand and discard the other 2',
    tags: [Tag.Event, Tag.Science],
    type: CardType.Event
  },
  {
    cost: 15,
    deck: Deck.Basic,
    name: 'Plantation',
    oneTimeText:
      'Requires 2 science tags. Place a greenery tile and raise oxygen 1 step.',
    oxygen: 1,
    requiredScience: 2,
    tags: [Tag.Plant],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Spend any amount of energy to gain that amount of MC.',
    cost: 4,
    deck: Deck.Corporate,
    name: 'Power Infrastructure',
    tags: [Tag.Building, Tag.Energy],
    type: CardType.Active
  },
  {
    cost: 0,
    deck: Deck.Corporate,
    name: 'Indentured Workers',
    oneTimeText: 'The next card you play this generation costs 8MC less.',
    tags: [Tag.Event],
    type: CardType.Event,
    victoryPoints: -1
  },
  {
    cost: 9,
    deck: Deck.Corporate,
    name: 'Lagrange Observatory',
    oneTimeText: 'Draw 1 card.',
    tags: [Tag.Science, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 33,
    deck: Deck.Corporate,
    name: 'Terraforming Ganymede',
    oneTimeText:
      'Raise your TR 1 step for each Jovian tag you have, including this.',
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 31,
    deck: Deck.Basic,
    name: 'Immigration Shuttles',
    oneTimeText:
      'Increase your MC production 5 steps. 1 VP for every 3rd city in play.',
    tags: [Tag.Earth, Tag.Space],
    type: CardType.Automated
  },
  {
    actionOrEffectText: 'Action: Spend 2MC to draw a card.',
    cost: 11,
    deck: Deck.Corporate,
    name: 'Restricted Area',
    oneTimeText: 'Place [the restricted area] tile.',
    tags: [Tag.Science],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Effect: Each time a city tile is placed, including this, increase your MC production 1 step.',
    cost: 13,
    deck: Deck.Basic,
    name: 'Immigrant City',
    oneTimeText:
      'Decrease your energy production 1 step and decrease your MC production 2 steps. Place a city tile.',
    tags: [Tag.Building, Tag.City],
    type: CardType.Active,
    condition: condition => condition.tileType === TileType.City,
    effect: effect => effect.increaseProduction(Resource.Megacredit, 1)
  },
  {
    cost: 3,
    deck: Deck.Corporate,
    name: 'Energy Tapping',
    oneTimeText:
      'Decrease any energy production 1 step and increase your own 1 step.',
    tags: [Tag.Energy],
    type: CardType.Automated,
    victoryPoints: -1
  },
  {
    actionOrEffectText:
      'Action: Spend 10 MC to increase your heat production 2 steps.',
    cost: 6,
    deck: Deck.Basic,
    name: 'Underground Detonations',
    tags: [Tag.Building],
    type: CardType.Active
  },
  {
    cost: 35,
    deck: Deck.Basic,
    name: 'Soletta',
    oneTimeText: 'Increase your heat production 7 steps.',
    tags: [Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 5,
    deck: Deck.Corporate,
    name: 'Technology Demonstration',
    oneTimeText: 'Draw 2 cards.',
    tags: [Tag.Event, Tag.Science, Tag.Space],
    type: CardType.Event
  },
  {
    terraformRatingIncrease: 2,
    cost: 8,
    deck: Deck.Basic,
    name: 'Rad-Chem Factory',
    oneTimeText:
      'Decrease your energy production 1 step. Raise your terraform rating 2 steps.',
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    cost: 4,
    deck: Deck.Basic,
    name: 'Special Design',
    oneTimeText:
      'The next card you play this generation is +2 or -2 in global requirements, your choice.',
    tags: [Tag.Event, Tag.Science],
    type: CardType.Event
  },
  {
    cost: 13,
    deck: Deck.Corporate,
    name: 'Medical Lab',
    oneTimeText:
      'Increase your MC production 1 step for every 2 building tags you have, including this.',
    tags: [Tag.Building, Tag.Science],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    actionOrEffectText: 'Action: Draw 2 cards.',
    cost: 21,
    deck: Deck.Corporate,
    name: 'AI Central',
    oneTimeText:
      'Requires 3 science tags to play. Decrease your energy production 1 step.',
    requiredScience: 3,
    tags: [Tag.Building, Tag.Science],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    cost: 10,
    deck: Deck.Promo,
    name: 'Small Asteroid',
    oneTimeText:
      'Terraforming Mars Promo. Increase temperature 1 step. Remove up to 2 plants from any player.',
    tags: [Tag.Event, Tag.Space],
    temperature: 1,
    type: CardType.Event
  },
  {
    actionOrEffectText:
      'Action: Reveal and place a SPACE OR BUILDING card here from hand, and place 2 resources on it, OR double the resources on a card here.\nEffect: Cards here may be played as if from hand with its cost reduced by the number of resources on it.',
    cost: 7,
    deck: Deck.Promo,
    name: 'Self-Replicating Robots',
    oneTimeText: 'Requires 2 science tags.',
    requiredScience: 2,
    tags: [],
    type: CardType.Active
  },
  {
    cost: 12,
    deck: Deck.Promo,
    name: 'Snow Algae',
    oneTimeText:
      'Requires 2 oceans. Increase your plant production and your heat production 1 step each.',
    requiredOcean: 2,
    tags: [Tag.Plant],
    type: CardType.Active
  },
  {
    actionOrEffectText: 'Action: Add 1 animal to this card.',
    cost: 7,
    deck: Deck.Promo,
    holdsResource: Resource.Animal,
    name: 'Penguins',
    oneTimeText: 'Requires 8 Oceans. 1 VP per animal on this card.',
    requiredOcean: 8,
    tags: [Tag.Animal],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Add 1 floater to ANY card, or spend 1 floater here to draw a card.',
    cost: 11,
    deck: Deck.Venus,
    holdsResource: Resource.Floater,
    name: 'Aerial Mappers',
    tags: [Tag.Venus],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    cost: 7,
    deck: Deck.Venus,
    name: 'Aerosport Tournament',
    oneTimeText:
      'Requires that you have 5 floaters. Gain 1 MC for each city tile in play.',
    tags: [Tag.Event],
    type: CardType.Event,
    victoryPoints: 1
  },
  {
    venus: 1,
    addsResourceToCards: Resource.Floater,
    cost: 13,
    deck: Deck.Venus,
    name: 'Air-Scrapping Expedition',
    oneTimeText: 'Raise Venus 1 step. Add 3 floaters to ANY VENUS CARD.',
    tags: [Tag.Event, Tag.Venus],
    type: CardType.Event
  },
  {
    cost: 10,
    deck: Deck.Venus,
    name: 'Atalanta Planitia Lab',
    oneTimeText: 'Requires 3 science tags. Draw 2 cards.',
    requiredScience: 3,
    tags: [Tag.Science, Tag.Venus],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    addsResourceToCards: Resource.Floater,
    cost: 22,
    deck: Deck.Venus,
    name: 'Atmoscoop',
    oneTimeText:
      'Requires 3 science tags. Either raise the temperature 2 steps, or raise Venus 2 steps. Add 2 floaters to ANY card.',
    requiredScience: 3,
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    venus: 1,
    cost: 11,
    deck: Deck.Venus,
    name: 'Comet for Venus',
    oneTimeText:
      'Raise Venus 1 step. Remove up to 4 MC from a player WITH A VENUS TAG IN PLAY.',
    tags: [Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    cost: 8,
    deck: Deck.Venus,
    name: 'Corroder Suits',
    oneTimeText:
      'Increase your MC production 2 steps. Add 1 resource to ANY VENUS CARD.',
    tags: [Tag.Venus],
    type: CardType.Automated
  },
  {
    cost: 15,
    deck: Deck.Venus,
    name: 'Dawn City',
    oneTimeText:
      'Requires 4 science tags. Decrease your energy production 1 step. Increase your titanium production 1 step. Place a city tile ON THE RESERVED AREA.',
    requiredScience: 4,
    tags: [Tag.City, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 3
  },
  {
    actionOrEffectText:
      'Action: Add 1 floater to this card, or spend 1 floater here to increase your energy production 1 step.',
    cost: 11,
    deck: Deck.Venus,
    holdsResource: Resource.Floater,
    name: 'Deuterium Export',
    tags: [Tag.Energy, Tag.Space, Tag.Venus],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Add 1 floater to ANY card. Effect: When playing a Venus tag, floaters here may be used as payment, and are worth 3 MC each',
    cost: 11,
    deck: Deck.Venus,
    holdsResource: Resource.Floater,
    name: 'Dirigibles',
    tags: [Tag.Venus],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Add 1 flaoter to this card, or remove 2 floaters here to raise Venus 1 step.',
    cost: 21,
    deck: Deck.Venus,
    holdsResource: Resource.Floater,
    name: 'Extractor Balloons',
    oneTimeText: 'Add 3 floaters to this card.',
    tags: [Tag.Venus],
    type: CardType.Active
  },
  {
    actionOrEffectText: 'Action: Add 1 microbe to ANY card.',
    cost: 3,
    deck: Deck.Venus,
    holdsResource: Resource.Microbe,
    name: 'Extremophiles',
    oneTimeText:
      'Requires 2 science tags. 1 VP for per 3 microbes on this card.',
    requiredScience: 2,
    tags: [Tag.Microbe, Tag.Venus],
    type: CardType.Active
  },
  {
    actionOrEffectText: 'Action: Spend 2 MC to add 1 floater to ANY card.',
    cost: 5,
    deck: Deck.Venus,
    holdsResource: Resource.Floater,
    name: 'Floating Habs',
    oneTimeText: 'Requires 2 science tags. 1 VP per 2 floaters on this card.',
    requiredScience: 2,
    tags: [Tag.Venus],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Spend 2 MC to add a floater to this card, or spend 2 floaters here to increase Venus 1 step.',
    cost: 8,
    deck: Deck.Venus,
    holdsResource: Resource.Floater,
    name: 'Forced Precipitation',
    tags: [Tag.Venus],
    type: CardType.Active
  },
  {
    cost: 14,
    deck: Deck.Venus,
    name: 'Freyja Biodomes',
    oneTimeText:
      'Requires Venus 10%. Add 2 microbes or 2 animals TO ANOTHER VENUS CARD. Decrease your energy production 1 step, and increase your MC production by 2 steps.',
    requiredVenus: 10,
    tags: [Tag.Plant, Tag.Venus],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    venus: 1,
    cost: 23,
    deck: Deck.Venus,
    name: 'GHG Import from Venus',
    oneTimeText: 'Raise Venus 1 step. Increase your heat production 3 steps.',
    tags: [Tag.Event, Tag.Space, Tag.Venus],
    type: CardType.Event
  },
  {
    venus: 3,
    cost: 27,
    deck: Deck.Venus,
    name: 'Giant Solar Shade',
    oneTimeText: 'Raise Venus 3 steps.',
    tags: [Tag.Space, Tag.Venus],
    type: CardType.Automated
  },
  {
    cost: 20,
    deck: Deck.Venus,
    name: 'Gyropolis',
    oneTimeText:
      'Decrease your energy production 2 steps. Increase your MC production 1  step for each Venus and Earth tag you have. Place a city tile.',
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated
  },
  {
    venus: 1,
    addsResourceToCards: Resource.Floater,
    cost: 11,
    deck: Deck.Venus,
    name: 'Hydrogen to Venus',
    oneTimeText:
      'Raise Venus 1 step. Add 1 floater to A VENUS CARD for each Jovian tag you have.',
    tags: [Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    cost: 17,
    deck: Deck.Venus,
    name: 'Io Sulphur Research',
    oneTimeText:
      'Draw 1 card, or draw 3 cards if you have at least 3 Venus tags.',
    tags: [Tag.Jovian, Tag.Science],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 5,
    deck: Deck.Venus,
    name: 'Ishtar Mining',
    oneTimeText: 'Requires Venus 8%. Increase your titanium production 1 step.',
    requiredVenus: 8,
    tags: [Tag.Venus],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Spend 1 titanium to add 2 floaters to this card, or remove 2 floaters here to raise Venus 1 step.',
    cost: 12,
    deck: Deck.Venus,
    holdsResource: Resource.Floater,
    name: 'Jet Stream Microscrappers',
    tags: [Tag.Venus],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Add 1 floater to this card, or spend 1 floater here to raise your MC production 1 step.',
    cost: 4,
    deck: Deck.Venus,
    holdsResource: Resource.Floater,
    name: 'Local Shading',
    tags: [Tag.Venus],
    type: CardType.Active
  },
  {
    cost: 21,
    deck: Deck.Venus,
    name: 'Luna Metropolis',
    oneTimeText:
      'Increase your MC production 1 step for each Earth tag you have, including this. Place a city tile ON THE RESERVED AREA.',
    tags: [Tag.City, Tag.Earth, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 8,
    deck: Deck.Venus,
    name: 'Luxury Foods',
    oneTimeText: 'Requires Venus, Earth and Jovian tags.',
    requiredEarth: 1,
    requiredJovian: 1,
    requiredVenusTags: 1,
    tags: [],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    actionOrEffectText: 'Action: Add 1 resource to ANOTHER VENUS CARD.',
    cost: 18,
    deck: Deck.Venus,
    name: 'Maxwell Base',
    oneTimeText:
      'Requires Venus 12%. Decrease your energy production 1 step. Place a city tile ON THE RESERVED AREA.',
    requiredVenus: 12,
    tags: [Tag.City, Tag.Venus],
    type: CardType.Active,
    victoryPoints: 3
  },
  {
    cost: 5,
    deck: Deck.Venus,
    name: 'Mining Quota',
    oneTimeText:
      'Requires Venus, Earth and Jovian tags. Increase your steel production 2 steps.',
    requiredEarth: 1,
    requiredJovian: 1,
    requiredVenusTags: 1,
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    venus: 1,
    cost: 7,
    deck: Deck.Venus,
    name: 'Neutralizer Factory',
    oneTimeText: 'Requires Venus 10%. Increase Venus 1 step.',
    requiredVenus: 10,
    tags: [Tag.Venus],
    type: CardType.Automated
  },
  {
    terraformRatingIncrease: 2,
    cost: 11,
    deck: Deck.Venus,
    name: 'Omnicourt',
    oneTimeText:
      'Requires Venus, Earth, and Jovian tags. Increase your TR 2 steps.',
    requiredEarth: 1,
    requiredJovian: 1,
    requiredVenusTags: 1,
    tags: [Tag.Building],
    type: CardType.Automated
  },
  {
    venus: 2,
    cost: 26,
    deck: Deck.Venus,
    name: 'Orbital Reflectors',
    oneTimeText: 'Raise Venus 2 steps. Increase your heat production 2 steps.',
    tags: [Tag.Space, Tag.Venus],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Spend 6 MC to add an asteroid resource to this card (TITANIUM MAY BE USED), or spend 1 resource from this card to increase VENUS 1 step.',
    cost: 6,
    deck: Deck.Venus,
    name: 'Rotator Impacts',
    oneTimeText: 'Venus must be 14% or lower.',
    requiredMaxVenus: 14,
    tags: [Tag.Space],
    type: CardType.Active
  },
  {
    cost: 7,
    deck: Deck.Venus,
    name: 'Sister Planet Support',
    oneTimeText:
      'Requires Venus and Earth tag. Increase your MC production 3 steps.',
    requiredEarth: 1,
    requiredVenusTags: 1,
    tags: [Tag.Earth, Tag.Venus],
    type: CardType.Automated
  },
  {
    cost: 7,
    deck: Deck.Venus,
    name: 'Solarnet',
    oneTimeText: 'Requires Venus, Earth, and Jovian tags. Draw 2 cards.',
    requiredEarth: 1,
    requiredJovian: 1,
    requiredVenusTags: 1,
    tags: [],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    venus: 2,
    cost: 16,
    deck: Deck.Venus,
    name: 'Spin-Inducing Asteroid',
    oneTimeText: 'Venus must be 10% or lower. Raise Venus 2 steps.',
    requiredMaxVenus: 10,
    tags: [Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    cost: 9,
    deck: Deck.Venus,
    name: 'Sponsored Academies',
    oneTimeText:
      'Discard 1 card from hand and THEN draw 3 cards. All OPPONENTS draw 1 card.',
    tags: [Tag.Earth, Tag.Science],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    actionOrEffectText: 'Action: Add 2 floaters to ANY VENUS CARD.',
    cost: 22,
    deck: Deck.Venus,
    holdsResource: Resource.Floater,
    name: 'Stratopolis',
    oneTimeText:
      'Requires 2 science tags. Increase your MC production 2 steps. Place a city tile on THE RESERVED AREA. 1 VP per 3 floaters on this card.',
    requiredScience: 2,
    tags: [Tag.City, Tag.Venus],
    type: CardType.Active
  },
  {
    actionOrEffectText: 'Action: Add 1 animal to this card.',
    cost: 12,
    deck: Deck.Venus,
    holdsResource: Resource.Animal,
    name: 'Stratospheric Birds',
    oneTimeText:
      'Requires Venus 12%, and that you spend 1 floater from any card. 1 VP for each animal on this card.',
    requiredVenus: 12,
    tags: [Tag.Animal, Tag.Venus],
    type: CardType.Active
  },
  {
    venus: 1,
    cost: 21,
    deck: Deck.Venus,
    name: 'Sulphur Exports',
    oneTimeText:
      'Increase Venus 1 step. Increase your MC production 1 step for each Venus tag you have, including this.',
    tags: [Tag.Space, Tag.Venus],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Add 1 microbe to this card, or spend any number of microbes here to gain the triple amount of MC.',
    cost: 6,
    deck: Deck.Venus,
    holdsResource: Resource.Microbe,
    name: 'Sulphur-Eating Bacteria',
    oneTimeText: 'Requires Venus 6%.',
    requiredVenus: 6,
    tags: [Tag.Microbe, Tag.Venus],
    type: CardType.Active
  },
  {
    cost: 8,
    deck: Deck.Venus,
    name: 'Terraforming Contract',
    oneTimeText:
      'Requires that you have at least 25 TR. Increase your MC production 4 steps.',
    tags: [Tag.Earth],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Add 1 microbe to ANY VENUS CARD, or spend 2 microbes here to raise Venus 1 step.',
    cost: 9,
    deck: Deck.Venus,
    holdsResource: Resource.Microbe,
    name: 'Thermophiles',
    oneTimeText: 'Requires Venus 6%.',
    requiredVenus: 6,
    tags: [Tag.Microbe, Tag.Venus],
    type: CardType.Active
  },
  {
    venus: 1,
    cost: 9,
    deck: Deck.Venus,
    name: 'Water to Venus',
    oneTimeText: 'Raise Venus 1 step.',
    tags: [Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    cost: 4,
    deck: Deck.Venus,
    name: 'Venus Governor',
    oneTimeText: 'Requires 2 Venus tags. Increase your MC production 2 steps.',
    requiredVenusTags: 2,
    tags: [Tag.Venus, Tag.Venus],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Action: Decrease your energy production 1 step to raise Venus 1 step.',
    cost: 7,
    deck: Deck.Venus,
    name: 'Venus Magnetizer',
    oneTimeText: 'Requires Venus 10%',
    requiredVenus: 10,
    tags: [Tag.Venus],
    type: CardType.Active
  },
  {
    venus: 1,
    cost: 20,
    deck: Deck.Venus,
    name: 'Venus Soil',
    oneTimeText:
      'Raise Venus 1 step. Increase your plant production 1 step. Add 2 microbes to ANOTHER card.',
    tags: [Tag.Plant, Tag.Venus],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When you play a Venus tag, you pay 2 MC less for it.',
    cost: 9,
    deck: Deck.Venus,
    name: 'Venus Waystation',
    tags: [Tag.Space, Tag.Venus],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    actionOrEffectText:
      'Effect: When you play a science tag, including this, add 1 animal to this card.',
    cost: 15,
    deck: Deck.Venus,
    holdsResource: Resource.Animal,
    name: 'Venusian Animals',
    oneTimeText: 'Requires Venus 18%. 1 VP for each animal on this card.',
    requiredVenus: 18,
    tags: [Tag.Animal, Tag.Science, Tag.Venus],
    type: CardType.Active,
    condition: condition => condition.tag === Tag.Venus,
    effect(effect) {
      effect.gainOneResource([Resource.Animal], this);
    }
  },
  {
    actionOrEffectText: 'Action: Add 1 microbe to this card.',
    cost: 5,
    deck: Deck.Venus,
    name: 'Venusian Insects',
    oneTimeText: 'Requires Venus 12%. 1 VP per 2 microbes on this card.',
    requiredVenus: 12,
    tags: [Tag.Microbe, Tag.Venus],
    type: CardType.Active
  },
  {
    venus: 1,
    cost: 13,
    deck: Deck.Venus,
    name: 'Venusian Plants',
    oneTimeText:
      'Requires Venus 16%. Raise Venus 1 step. Add 1 microbe or 1 animal to ANOTHER VENUS CARD.',
    requiredVenus: 16,
    tags: [Tag.Microbe, Tag.Venus],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    addsResourceToCards: Resource.Floater,
    cost: 11,
    deck: Deck.Colonies,
    name: 'Airliners',
    oneTimeText:
      'Requires that you have 3 floaters. Increase your MC production 2 steps. Add 2 floaters to ANOTHER card.',
    tags: [],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 0,
    deck: Deck.Colonies,
    name: 'Air Raid',
    oneTimeText:
      'Requires that you lose 1 floater. Steal 5 MC from any player.',
    tags: [Tag.Event],
    type: CardType.Event
  },
  {
    actionOrEffectText:
      'Action: Add 1 floater to this card, or spend 1 floater here to gain 2 titanium, or 3 energy, or 4 heat.',
    cost: 15,
    deck: Deck.Colonies,
    holdsResource: Resource.Floater,
    name: 'Atmo Collectors',
    oneTimeText: 'Add 2 floaters to ANY card.',
    tags: [],
    type: CardType.Active
  },
  {
    cost: 13,
    deck: Deck.Colonies,
    name: 'Community Services',
    oneTimeText:
      'Increase your MC production 1 step per CARD WITH NO TAGS, including this.',
    tags: [],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 5,
    deck: Deck.Colonies,
    name: 'Conscription',
    oneTimeText:
      'Requires 2 Earth tags. The next card you play this generation costs 16 MC less.',
    requiredEarth: 2,
    tags: [Tag.Earth, Tag.Event],
    type: CardType.Event,
    victoryPoints: -1
  },
  {
    cost: 10,
    deck: Deck.Colonies,
    name: 'Corona Extractor',
    oneTimeText:
      'Requires 4 science tags. Increase your energy production 4 steps.',
    requiredScience: 4,
    tags: [Tag.Energy, Tag.Space],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When you trade, you pay 1 less resource for it.',
    cost: 10,
    deck: Deck.Colonies,
    name: 'Cryo-Sleep',
    tags: [Tag.Science],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    cost: 43,
    deck: Deck.Colonies,
    name: 'Earth Elevator',
    oneTimeText: 'Increase your titanium production 3 steps.',
    tags: [Tag.Earth, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 4
  },
  {
    cost: 21,
    deck: Deck.Colonies,
    name: 'Ecology Research',
    oneTimeText:
      'Increase your plant production 1 step for each colony you own. Add 1 animal to ANOTHER card and 2 microbes to ANOTHER card.',
    tags: [Tag.Animal, Tag.Microbe, Tag.Plant, Tag.Science],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 3,
    deck: Deck.Colonies,
    name: 'Floater Leasing',
    oneTimeText: 'Increase your MC production 1 step per 3 floaters you have.',
    tags: [],
    type: CardType.Automated
  },
  {
    addsResourceToCards: Resource.Floater,
    cost: 2,
    deck: Deck.Colonies,
    name: 'Floater Prototypes',
    oneTimeText: 'Add 2 floaters to ANOTHER card',
    tags: [Tag.Event, Tag.Science],
    type: CardType.Event
  },
  {
    actionOrEffectText: 'Action: Add 1 floater to ANOTHER card.',
    cost: 7,
    deck: Deck.Colonies,
    name: 'Floater Technology',
    tags: [Tag.Science],
    type: CardType.Active
  },
  {
    cost: 15,
    deck: Deck.Colonies,
    name: 'Gaillean Waystation',
    oneTimeText:
      'Increase your MC production 1 step for every Jovian tags in play.',
    tags: [Tag.Space],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 3,
    deck: Deck.Colonies,
    gainMegacredit: 4,
    name: 'Heavy Taxation',
    oneTimeText:
      'Requires 2 Earth tags. Increase your MC production 2 steps, and gain 4 MC.',
    requiredEarth: 2,
    tags: [Tag.Earth],
    type: CardType.Automated,
    victoryPoints: -1
  },
  {
    cost: 23,
    deck: Deck.Colonies,
    name: 'Ice Moon Colony',
    ocean: 1,
    oneTimeText: 'Place 1 colony and 1 ocean tile.',
    tags: [Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 11,
    deck: Deck.Colonies,
    gainHeat: 12,
    name: 'Impactor Swarm',
    oneTimeText:
      'Requries 2 Jovian tags. Gain 12 heat. Remove up to 2 plants from any player.',
    requiredJovian: 2,
    tags: [Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    cost: 12,
    deck: Deck.Colonies,
    name: 'Interplanetary Colony Ship',
    oneTimeText: 'Place a colony.',
    tags: [Tag.Earth, Tag.Event, Tag.Space],
    type: CardType.Event
  },
  {
    terraformRatingIncrease: 1,
    actionOrEffectText: 'Action: Spend 1 titanium to add 2 floaters here.',
    cost: 20,
    deck: Deck.Colonies,
    holdsResource: Resource.Floater,
    name: 'Jovian Lanterns',
    oneTimeText:
      'Requires 1 Jovian tag. Increase your TR 1 step. Add 2 floaters to ANY card. 1 VP per 2 floaters here.',
    requiredJovian: 1,
    tags: [Tag.Jovian],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Add 1 floater to a JOVIAN CARD, or gain 1 MC for every floater here (Max 4).',
    cost: 9,
    deck: Deck.Colonies,
    holdsResource: Resource.Floater,
    name: 'Jupiter Floating Station',
    oneTimeText: 'Requires 3 science tags.',
    requiredScience: 3,
    tags: [Tag.Jovian],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    cost: 4,
    deck: Deck.Colonies,
    name: 'Luna Governor',
    oneTimeText: 'Requires 3 Earch tags. Increase your MC production 2 steps.',
    requiredEarth: 3,
    tags: [Tag.Earth, Tag.Earth],
    type: CardType.Automated
  },
  {
    cost: 19,
    deck: Deck.Colonies,
    name: 'Lunar Exports',
    oneTimeText:
      'Increase your plant production 2 steps, or increase your MC production 5 steps.',
    tags: [Tag.Earth, Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 11,
    deck: Deck.Colonies,
    name: 'Lunar Mining',
    oneTimeText:
      'Increase your titanium production. 1 step for every 2 Earth tags you have in play, including this.',
    tags: [Tag.Earth],
    type: CardType.Automated
  },
  {
    cost: 1,
    deck: Deck.Colonies,
    name: 'Market Manipulation',
    oneTimeText:
      'Increase one colony tile track 1 step. Decrease another colony tile track 1 step',
    tags: [Tag.Earth, Tag.Event],
    type: CardType.Event
  },
  {
    actionOrEffectText:
      'Effect: when you play an Earth tag, place an animal here. Action: Gain 1 MC per animal here.',
    cost: 12,
    deck: Deck.Colonies,
    holdsResource: Resource.Animal,
    name: 'Martian Zoo',
    oneTimeText: 'Requires 2 city tiles in play.',
    tags: [Tag.Animal, Tag.Building],
    type: CardType.Active,
    victoryPoints: 1,
    condition: condition => condition.tag === Tag.Earth,
    effect(effect) {
      effect.gainOneResource([Resource.Animal], this);
    }
  },
  {
    cost: 20,
    deck: Deck.Colonies,
    name: 'Mining Colony',
    oneTimeText: 'Increase your titanium production 1 step. Place a colony.',
    tags: [Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 5,
    deck: Deck.Colonies,
    name: 'Minority Refuge',
    oneTimeText: 'Decrese your MC production 2 steps. Place a colony.',
    tags: [Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 11,
    deck: Deck.Colonies,
    name: 'Molecular Printing',
    oneTimeText:
      'Gain 1 MC fo each city tile in play. Gain 1 MC for each colony in play.',
    tags: [Tag.Science],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    terraformRatingIncrease: 2,
    addsResourceToCards: Resource.Floater,
    cost: 25,
    deck: Deck.Colonies,
    name: 'Nitrogen from Titan',
    oneTimeText: 'Raise your TR 2 steps. Add 2 floaters to a JOVIAN CARD.',
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 13,
    deck: Deck.Colonies,
    name: 'Pioneer Settlement',
    oneTimeText:
      'Requires that you have no more than 1 colony. Decrease your MC production 2 steps. Place a colony.',
    tags: [Tag.Space],
    type: CardType.Automated,
    victoryPoints: 2
  },
  {
    cost: 0,
    deck: Deck.Colonies,
    name: 'Productive Outpost',
    oneTimeText: 'Gain all your colony bonuses',
    tags: [],
    type: CardType.Automated
  },
  {
    cost: 8,
    deck: Deck.Colonies,
    name: 'Quantum Communications',
    oneTimeText:
      'Requires 4 science tags. Increase your MC production 1 step for each colony in play.',
    requiredScience: 4,
    tags: [],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    actionOrEffectText:
      'Action: Add 1 floater to this card, or spend 1 floater here to draw a card.',
    cost: 17,
    deck: Deck.Colonies,
    name: 'Red Spot Observatory',
    oneTimeText: 'Requires 3 science tags. Draw 2 cards.',
    requiredScience: 3,
    tags: [Tag.Jovian, Tag.Science],
    type: CardType.Active,
    victoryPoints: 2
  },
  {
    actionOrEffectText:
      'Action: Decrease your MC production 1 step to add a camp resource to this card.',
    cost: 10,
    deck: Deck.Colonies,
    holdsResource: Resource.Camp,
    name: 'Refugee Camps',
    oneTimeText: '1 VP for each camp resource on this card.',
    tags: [Tag.Earth],
    type: CardType.Active
  },
  {
    cost: 20,
    deck: Deck.Colonies,
    name: 'Research Colony',
    oneTimeText:
      'Place a colony. MAY BE PLACED WHERE YOU ALREADY HAVE A COLONY. Draw 2 cards.',
    tags: [Tag.Science, Tag.Space],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When you trade, you pay 1 less resource for it.',
    cost: 4,
    deck: Deck.Colonies,
    name: 'Rim Freighters',
    tags: [Tag.Space],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Effect: When you play a card, you pay 1 MC less for it.',
    cost: 18,
    deck: Deck.Colonies,
    name: 'Sky Docks',
    oneTimeText: 'Requires 2 Earth tags. Gain 1 Trade Fleet.',
    requiredEarth: 2,
    tags: [Tag.Earth, Tag.Space],
    type: CardType.Active,
    victoryPoints: 2
  },
  {
    cost: 9,
    deck: Deck.Colonies,
    name: 'Solar Probe',
    oneTimeText:
      'Draw 1 card for every 3 science tags you have, including this.',
    tags: [Tag.Event, Tag.Science, Tag.Space],
    type: CardType.Event,
    victoryPoints: 1
  },
  {
    cost: 23,
    deck: Deck.Colonies,
    name: 'Solar Reflectors',
    oneTimeText: 'Increase your heat production 5 steps.',
    tags: [Tag.Space],
    type: CardType.Automated
  },
  {
    cost: 22,
    deck: Deck.Colonies,
    name: 'Space Port',
    oneTimeText:
      'Requires 1 colony. Gain 1 Trade Fleet. Place a city tile. Decrease your energy production 1 step, and increase your MC production 4 steps.',
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated
  },
  {
    cost: 27,
    deck: Deck.Colonies,
    name: 'Space Port Colony',
    oneTimeText:
      'Requires a colony. Place a colony. MAY BE PLACED ON A COLONY TILE WHERE YOU ALREADY HAVE A COLONY. Gain 1 Trade Fleet. 1 VP per 2 colonies in play.',
    tags: [Tag.Space],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: WHEN PLAYING A CARD WITH A BASIC COST OF 20 MC OR MORE, draw a card',
    cost: 10,
    deck: Deck.Colonies,
    name: 'Spin-Off Department',
    oneTimeText: 'Increase your MC production 2 steps.',
    tags: [Tag.Building],
    type: CardType.Active,
    condition: condition => condition.card && condition.card.cost > 20,
    effect: effect => effect.drawCard()
  },
  {
    actionOrEffectText: 'Action: Add 1 animal to this card.',
    cost: 5,
    deck: Deck.Colonies,
    holdsResource: Resource.Animal,
    name: 'Sub-Zero Salt Fish',
    oneTimeText:
      'Requires -6°C or warmer. Decrease any plant production 1 step. 1 VP per 2 animals on this card.',
    requiredTemperature: -6,
    tags: [Tag.Animal],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Action: Spend 1 titanium to add 2 floaters to this card, or spend 2 floaters here to increase your TR 1 step.',
    cost: 21,
    deck: Deck.Colonies,
    holdsResource: Resource.Floater,
    name: 'Titan Air-Scrapping',
    tags: [Tag.Jovian],
    type: CardType.Active,
    victoryPoints: 2
  },
  {
    actionOrEffectText:
      'Action: Add 1 floater to ANY JOVIAN CARD, or spend 1 floater here to trade for free',
    cost: 18,
    deck: Deck.Colonies,
    holdsResource: Resource.Floater,
    name: 'Titan Floating Launch-Pad',
    oneTimeText: 'Add 2 foaters to ANY JOVIAN CARD.',
    tags: [Tag.Jovian],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    actionOrEffectText:
      'Action: Add 2 floaters to ANY JOVIAN CARD, or spend any number of floaters here to gain the same number of titanium.',
    cost: 23,
    deck: Deck.Colonies,
    holdsResource: Resource.Floater,
    name: 'Titan Shuttles',
    tags: [Tag.Jovian, Tag.Space],
    type: CardType.Active,
    victoryPoints: 1
  },
  {
    actionOrEffectText:
      'Effect: When you trade, you may first increase that Colony Tile track 1 step.',
    cost: 6,
    deck: Deck.Colonies,
    name: 'Trade Envoys',
    tags: [],
    type: CardType.Active
  },
  {
    actionOrEffectText:
      'Effect: When you trade, you may first increase that Colony Tile track 1 step.',
    cost: 18,
    deck: Deck.Colonies,
    name: 'Trading Colony',
    oneTimeText: 'Place a colony.',
    tags: [Tag.Space],
    type: CardType.Active
  },
  {
    cost: 6,
    deck: Deck.Colonies,
    name: 'Urban Decomposers',
    oneTimeText:
      'Requires that you have 1 city tile and 1 colony in play. Increase your plant production 1 step, and add 2 microbes to ANOTHER card.',
    requiredSpace: 1,
    tags: [Tag.Microbe],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: When you play a space tag, you pay 4 MC less for it.',
    cost: 14,
    deck: Deck.Colonies,
    name: 'Warp Drive',
    oneTimeText: 'Requires 5 science tags.',
    requiredScience: 5,
    tags: [Tag.Science],
    type: CardType.Active,
    victoryPoints: 2
  },
  {
    deck: Deck.Prelude,
    gainMegacredit: 3,
    name: 'Allied Bank',
    oneTimeText: 'Increase your MC production 4 steps. Gain 3 MC.',
    tags: [Tag.Earth],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainMegacredit: -3,
    name: 'Aquifer Turbines',
    ocean: 1,
    oneTimeText:
      'Place an ocean tile. Increase your energy production 2 steps. Remove 3 MC.',
    tags: [Tag.Energy],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainPlant: 2,
    name: 'Biofuels',
    oneTimeText:
      'Increase your plant production and energy production 1 step each. Gain 2 plants.',
    tags: [Tag.Microbe],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Biolabs',
    oneTimeText: 'Increase your plant production 1 step. Draw 3 cards.',
    tags: [Tag.Science],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Biosphere Support',
    oneTimeText:
      'Decrease your MC production 1 step. Increase your plant production 2 steps.',
    tags: [Tag.Plant],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainMegacredit: -6,
    name: 'Business Empire',
    oneTimeText: 'Increase your MC production 6 steps. Remove 6 MC.',
    tags: [Tag.Earth],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Dome Farming',
    oneTimeText:
      'Increase your plant production 1 step. Increase your MC production 2 steps.',
    tags: [Tag.Building, Tag.Plant],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainMegacredit: 21,
    name: 'Donation',
    oneTimeText: 'Gain 21 MC.',
    tags: [],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Early Settlement',
    oneTimeText: 'Place a city tile. Increase your plant production 1 step.',
    tags: [Tag.Building, Tag.City],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Ecology Experts',
    oneTimeText:
      'Increase your plant production 1 step. Play a card from Hand, ignoring global requirements',
    tags: [Tag.Microbe, Tag.Plant],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Excentric Sponsor',
    oneTimeText: 'Play a card from hand, reducing its costs by 25 MC',
    tags: [],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Experimental Forest',
    oneTimeText:
      'Place a greenery tile and increase oxygen 1 step. Reveal cards from the deck until you have revealed 2 plant-tag cards. Take these into your hand, and discard the rest.',
    oxygen: 1,
    tags: [Tag.Plant],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainMegacredit: -5,
    name: 'Galilean Mining',
    oneTimeText: 'Increase your titanium production 2 steps. Remove 5 MC.',
    tags: [Tag.Jovian],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Great Aquifer',
    ocean: 2,
    oneTimeText: 'Place 2 ocean tiles.',
    tags: [],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainMegacredit: -5,
    name: 'Huge Asteroid',
    oneTimeText: 'Raise temperature 3 steps. Remove 5 MC.',
    tags: [],
    temperature: 3,
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Io Research Outpost',
    oneTimeText: 'Increase your titanium production 1 step. Draw 1 card.',
    tags: [Tag.Jovian, Tag.Science],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainMegacredit: 30,
    name: 'Loan',
    oneTimeText: 'Decrease your MC production 2 steps. Gain 30 MC.',
    tags: [],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainMegacredit: 6,
    name: 'Martian Industries',
    oneTimeText:
      'Increase your energy production and steel production 1 step each. Gain 6 MC.',
    tags: [Tag.Building],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainSteel: 4,
    gainTitanium: 4,
    name: 'Metal-Rich Asteroid',
    oneTimeText: 'Raise temperature 1 step. Gain 4 titanium, and 4 steel.',
    tags: [],
    temperature: 1,
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Metals Company',
    oneTimeText:
      'Increase your MC production, steel production, and titanium production 1 step each.',
    tags: [],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainSteel: 4,
    name: 'Mining Operations',
    oneTimeText: 'Increase your steel production 2 steps. Gain 4 steel.',
    tags: [Tag.Building],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainHeat: 3,
    name: 'Mohole',
    oneTimeText: 'Increse your heat production 3 steps. Gain 3 heat.',
    tags: [Tag.Building],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainHeat: 2,
    name: 'Mohole Excavation',
    oneTimeText:
      'Increase your steel production 1 step, and your heat production 2 steps. Gain 2 heat.',
    tags: [Tag.Building],
    type: CardType.Prelude
  },
  {
    terraformRatingIncrease: 1,
    deck: Deck.Prelude,
    gainMegacredit: 5,
    name: 'Nitrogen Shipment',
    oneTimeText:
      'Raise your terraform rating 1 step. Increase your plant production 1 step. Gain 5 MC.',
    tags: [],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainTitanium: 4,
    name: 'Orbital Construction Yard',
    oneTimeText:
      'Increase your titanium produciton [sic] 1 step. Gain 4 titanium.',
    tags: [Tag.Space],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Polar Industries',
    ocean: 1,
    oneTimeText: 'Place 1 ocean tile. Increase your heat production 2 steps.',
    tags: [Tag.Building],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Power Generation',
    oneTimeText: 'Increase your energy production 3 steps.',
    tags: [Tag.Energy],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Research Network',
    oneTimeText:
      'Draw 3 cards, and increase your MC production 1 step. After being played, when you perform an action, the wild tag is any tag of your choice.',
    tags: [],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Self-Sufficient Settlement',
    oneTimeText: 'Place a city tile. Increase your MC production 2 steps.',
    tags: [Tag.Building, Tag.City],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainSteel: 5,
    name: 'Smelting Plant',
    oneTimeText: 'Raise oxygen 2 steps. Gain 5 steel.',
    oxygen: 2,
    tags: [Tag.Building],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    name: 'Society Support',
    oneTimeText:
      'Decrease your MC production  1 step. Increase your plant production, energy production, and heat production 1 step each.',
    tags: [],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainSteel: 4,
    name: 'Supplier',
    oneTimeText: 'Increase your energy production 2 steps. Gain 4 steel.',
    tags: [Tag.Energy],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainPlant: 3,
    gainSteel: 8,
    gainTitanium: 3,
    name: 'Supply Drop',
    oneTimeText: 'Gain 3 titanium, 8 steeel, and 3 plants.',
    tags: [],
    type: CardType.Prelude
  },
  {
    terraformRatingIncrease: 3,
    deck: Deck.Prelude,
    name: 'UNMI Contractor',
    oneTimeText: 'Raise your terraform rating 3 steps. Draw 1 card.',
    tags: [Tag.Venus],
    type: CardType.Prelude
  },
  {
    deck: Deck.Prelude,
    gainTitanium: 6,
    name: 'Acquired Space Agency',
    oneTimeText:
      'Gain 6 titanium. Reveal cards from the deck until you have revealed 2 space cards. Take those into hand, and discard the rest.',
    tags: [],
    type: CardType.Prelude
  },
  {
    cost: 10,
    deck: Deck.Prelude,
    name: 'House Printing',
    oneTimeText: 'Increase your steel production 1 step.',
    tags: [Tag.Building],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 15,
    deck: Deck.Prelude,
    name: 'Lava Tube Settlement',
    oneTimeText:
      'Decrease your energy production 1 step. Increase your MC production 2 steps. Place a city tile ON A VOLCANIC AREA, same as Lava Flows, regardless of adjacent cities.',
    tags: [Tag.Building, Tag.City],
    type: CardType.Automated
  },
  {
    cost: 9,
    deck: Deck.Prelude,
    name: 'Martian Survey',
    oneTimeText: 'Oxygen must be 4% or lower. Draw 2 cards.',
    requiredMaxOxygen: 4,
    tags: [Tag.Event, Tag.Science],
    type: CardType.Event,
    victoryPoints: 1
  },
  {
    actionOrEffectText:
      'Action: Add a microbe to this card. Effect: When paying for a plant card, microbes here may be used as 2 MC each.',
    cost: 2,
    deck: Deck.Prelude,
    holdsResource: Resource.Microbe,
    name: 'Psychrophiles',
    oneTimeText: 'Requires temperature -20°C or colder.',
    requiredMaxTemperature: -20,
    tags: [Tag.Microbe],
    type: CardType.Active
  },
  {
    cost: 4,
    deck: Deck.Prelude,
    name: 'Research Coordination',
    oneTimeText:
      'After being played, when you perform an action, the wild tag counts as any tag of your choice.',
    tags: [],
    type: CardType.Automated
  },
  {
    cost: 7,
    deck: Deck.Prelude,
    name: 'SF Memorial',
    oneTimeText: 'Draw 1 card.',
    tags: [Tag.Building],
    type: CardType.Automated,
    victoryPoints: 1
  },
  {
    cost: 12,
    deck: Deck.Prelude,
    name: 'Space Hotels',
    oneTimeText: 'Requires 2 Earth tags. Increase your MC production 4 steps.',
    requiredEarth: 2,
    tags: [Tag.Earth, Tag.Space],
    type: CardType.Automated
  },
  {
    actionOrEffectText:
      'Effect: After you pay for a card or standard project with a basic cost of 20 MC or more, you gain 4 MC.',
    deck: Deck.Basic,
    gainMegacredit: 57,
    name: 'CrediCor',
    oneTimeText: 'You start with 57 MC.',
    tags: [],
    type: CardType.Corporation,
    condition: condition => condition.cost && condition.cost >= 20,
    effect: effect => effect.gainResource(Resource.Megacredit, 4)
  },
  {
    actionOrEffectText:
      'Effect: You may always pay 7 plants, instead of 8, to place 1 greenery.',
    deck: Deck.Basic,
    gainMegacredit: 36,
    gainPlant: 3,
    name: 'Ecoline',
    oneTimeText: 'You start with 2 plant production, 3 plants, and 36 MC.',
    tags: [Tag.Plant],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: You may use heat as MC. You may not use MC as heat.',
    deck: Deck.Basic,
    gainMegacredit: 42,
    name: 'Helion',
    oneTimeText: 'You start with 3 heat production and 42 MC.',
    tags: [Tag.Space],
    type: CardType.Corporation
  },
  {
    actionOrEffectText: 'Effect: Each time you play an event, you gain 2 MC.',
    deck: Deck.Basic,
    gainMegacredit: 30,
    gainSteel: 20,
    name: 'Interplanetary Cinematics',
    oneTimeText: 'You start with 20 steel and 30 MC.',
    tags: [Tag.Building],
    type: CardType.Corporation,
    condition: condition =>
      condition.card && condition.card.tags.includes(Tag.Event),
    effect: effect => effect.gainResource(Resource.Megacredit, 2)
  },
  {
    actionOrEffectText:
      'Effect: Your temperature, oxygen, and ocean requirements are +2 or -2 steps, your choice in each case.',
    deck: Deck.Basic,
    gainMegacredit: 45,
    name: 'Inventrix',
    oneTimeText:
      'As your first action in the game, draw 3 cards. You start with 45 MC.',
    tags: [Tag.Science],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: Each time you get any steel or titanium as a placement bonus on the map, increase your steel production 1 step.',
    deck: Deck.Basic,
    gainMegacredit: 30,
    gainSteel: 5,
    name: 'Mining Guild',
    oneTimeText: 'You start with 30 MC, 5 steel, and 1 steel production.',
    tags: [Tag.Building, Tag.Building],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: Each time any Jovian tag is put into play, including this, increase your MC production 1 step.',
    deck: Deck.Corporate,
    gainMegacredit: 42,
    name: 'Saturn Systems',
    oneTimeText: 'You start with 1 titanium production and 42 MC.',
    tags: [Tag.Jovian],
    type: CardType.Corporation,
    condition: condition => condition.tag === Tag.Jovian,
    effect: effect => effect.increaseProduction(Resource.Megacredit, 1)
  },
  {
    actionOrEffectText:
      'Effect: Your titanium resources are each worth 1 MC extra.',
    deck: Deck.Basic,
    gainMegacredit: 23,
    gainTitanium: 10,
    name: 'PhoboLog',
    oneTimeText: 'You start with 10 titanium and 23 MC',
    tags: [Tag.Space],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: When playing an Earth card, you pay 3 MC less for it.',
    deck: Deck.Corporate,
    gainMegacredit: 60,
    name: 'Teractor',
    oneTimeText: 'You start with 60 MC.',
    tags: [Tag.Earth],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: When any city tile is placed ON MARS, increase your MC production 1 step. When you place a city tile, gain 3 MC.',
    deck: Deck.Basic,
    gainMegacredit: 40,
    name: 'Tharsis Republic',
    oneTimeText:
      'You start with 40 MC. As your first action in the game, place a city tile.',
    tags: [Tag.Building],
    type: CardType.Corporation,
    condition: condition =>
      condition.tileType === TileType.City &&
      (condition.onMars || condition.samePlayer),
    effect: effect => {
      if (effect.condition.onMars) {
        effect.increaseProduction(Resource.Megacredit, 1);
      }
      if (effect.condition.samePlayer) {
        effect.gainResource(Resource.Megacredit, 3);
      }
    }
  },
  {
    actionOrEffectText:
      'Effect: When playing a power card OR THE STANDARD PROJECT POWER PLANT, you pay 3 MC less for it.',
    deck: Deck.Basic,
    gainMegacredit: 48,
    name: 'ThorGate',
    oneTimeText: 'You start with 1 energy production and 48 MC.',
    tags: [Tag.Energy],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Action: If your Terraform Rating was raised this generation, you may pay 3 MC to raise it 1 step more.',
    deck: Deck.Basic,
    gainMegacredit: 40,
    name: 'United Nations Mars Initiative',
    oneTimeText: 'You start with 40 MC.',
    tags: [Tag.Earth],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: Whenever Venus is terraformed 1 step, you gain 2 MC.',
    deck: Deck.Venus,
    gainMegacredit: 47,
    name: 'Aphrodite',
    oneTimeText: 'You start with 47 MC and 1 plant production.',
    tags: [Tag.Plant, Tag.Venus],
    type: CardType.Corporation
  },
  {
    actionOrEffectText: 'Action: Add a floater to ANY card.',
    deck: Deck.Venus,
    gainMegacredit: 42,
    holdsResource: Resource.Floater,
    name: 'Celestic',
    oneTimeText:
      'You start with 42 MC. As your first action, reveal cards from the deck until you have revealed 2 cards with a floater icon on it. Take those 2 cards into hand, and discard the rest. 1 VP per 3 floaters on this card.',
    tags: [Tag.Venus],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: For each step you increase the production of a resource, including this, you also gain that resource.',
    deck: Deck.Venus,
    gainMegacredit: 35,
    name: 'Manutech',
    oneTimeText: 'You start with 1 steel production and 35 MC.',
    tags: [Tag.Building],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: Your Venus requirements are +/- 2 steps, your choice in each case.',
    deck: Deck.Venus,
    gainMegacredit: 50,
    name: 'Morning Star Inc.',
    oneTimeText:
      'You start with 50 MC. As your first action, reveal cards from the deck until you have revealed 3 Venus-tag cards. Take those into hand and discard the rest.',
    tags: [Tag.Venus],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Action: Use a blue card action that has already been used this generation.',
    deck: Deck.Venus,
    gainMegacredit: 48,
    name: 'Viron',
    oneTimeText: 'You start with 48 MC.',
    tags: [Tag.Microbe],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: When you play a building tag, you pay 2 MC less for it.',
    deck: Deck.Prelude,
    gainMegacredit: 44,
    name: 'Cheung Shing Mars',
    oneTimeText: 'You start with 44 MC and 3 MC production.',
    tags: [Tag.Building],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: When you play a Earth tag, including this, draw a card.',
    deck: Deck.Prelude,
    gainMegacredit: 38,
    name: 'Point Luna',
    oneTimeText: 'You start with 38 MC and 1 titanium production.',
    tags: [Tag.Earth, Tag.Space],
    type: CardType.Corporation,
    condition: condition => condition.tag === Tag.Earth,
    effect: effect => effect.drawCard()
  },
  {
    actionOrEffectText:
      'Action: Spend 4 MC to increase (one of) your LOWEST PRODUCTION 1 step.',
    deck: Deck.Prelude,
    gainMegacredit: 47,
    name: 'Robinson Industries',
    oneTimeText: 'You start with 47 MC.',
    tags: [],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: When you play a science tag, you pay 2 MC less for it.',
    deck: Deck.Prelude,
    gainMegacredit: 37,
    name: 'Valley Trust',
    oneTimeText:
      'You start with 37 MC. As your first action, draw 3 Prelude cards, and play one of them. Discard the other two.',
    tags: [Tag.Earth],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: When you play a card with a NON-NEGATIVE VP icon, including this, gain 3 MC.',
    deck: Deck.Prelude,
    gainMegacredit: 45,
    name: 'Vitor',
    oneTimeText:
      'You start with 45 MC. As your first action, fund an award for free.',
    tags: [Tag.Earth],
    type: CardType.Corporation,
    condition: condition => {
      if (!condition.card) return false;

      if (!condition.card.victoryPoints) return false;

      if (typeof condition.card.victoryPoints === 'number') {
        return condition.card.victoryPoints > 0;
      }

      return true;
    }
  },
  {
    actionOrEffectText:
      'Effect: When you get a new type of tag in play (event cards do not count), increase your MC production 1 step.',
    deck: Deck.Colonies,
    gainMegacredit: 40,
    name: 'Aridor',
    oneTimeText:
      'You start with 40 MC. As your first action, put an additional Colony Tile of your choice into play.',
    tags: [],
    type: CardType.Corporation,
    condition: condition => condition.newTag,
    effect: effect => effect.increaseProduction(Resource.Megacredit, 1)
  },
  {
    actionOrEffectText:
      'Effect: When you play an animal or plant tag, including this, add 1 animal to this card.',
    deck: Deck.Colonies,
    gainMegacredit: 45,
    holdsResource: Resource.Animal,
    name: 'Arklight',
    oneTimeText:
      'You start with 45 MC. Increase your MC production 2 steps. 1 VP per 2 animals on this card.',
    tags: [Tag.Animal],
    type: CardType.Corporation,
    condition: condition => [Tag.Animal, Tag.Plant].includes(condition.tag),
    effect(effect) {
      effect.gainOneResource([Resource.Animal], this);
    }
  },
  {
    actionOrEffectText:
      'Effect: When you buy a card to hand, pay 5 MC instead of 3 MC, including the starting hand.',
    deck: Deck.Colonies,
    gainMegacredit: 50,
    gainTitanium: 5,
    name: 'Polyphemos',
    oneTimeText:
      'You start with 50 MC. Increase your MC production 5 steps. Gain 5 titanium.',
    tags: [],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Effect: When any colony is placed, including this, raise your MC production 1 step.',
    deck: Deck.Colonies,
    gainMegacredit: 45,
    name: 'Poseidon',
    oneTimeText: 'You start with 45 MC. As your first action, place a colony.',
    tags: [],
    type: CardType.Corporation
  },
  {
    actionOrEffectText:
      'Action: Add 1 floater to ANY card. Effect: Floaters on this card may be used as 2 heat each',
    deck: Deck.Colonies,
    gainMegacredit: 48,
    holdsResource: Resource.Floater,
    name: 'Stormcraft Incorporated',
    oneTimeText: 'You start with 48 MC.',
    tags: [Tag.Jovian],
    type: CardType.Corporation
  }
];
