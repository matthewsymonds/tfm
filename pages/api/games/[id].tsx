import {gamesModel, retrieveSession} from 'database';
import {censorGameState} from 'state-serialization';

export default async (req, res) => {
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

    let username: string;

    if (game.state.players.length === 1) {
        username = game.state.players[0].username;
    } else {
        const sessionResult = await retrieveSession(req, res);
        if (!sessionResult) return;
        username = sessionResult.username;
    }

    switch (req.method.toUpperCase()) {
        case 'GET':
            if (game.name === 'TharsisRepublic09') {
                game.state.players[0] = {
                    action: 1,
                    username: 'billylitt',
                    index: 0,
                    terraformRating: 23,
                    corporation: {name: 'Point Luna'},
                    pendingCardSelection: null,
                    possibleCorporations: [],
                    cards: [
                        {name: 'Atalanta Planitia Lab'},
                        {name: 'AI Central'},
                        {name: 'Quantum Extractor'},
                        {name: 'Ants'},
                        {name: 'Breathing Filters'},
                        {name: 'Cupola City'},
                        {name: 'Colonizer Training Camp'},
                        {name: 'Rim Freighters'},
                        {name: 'Mass Converter'},
                        {name: 'Sulphur-Eating Bacteria'},
                        {name: 'Magnetic Field Generators'},
                        {name: 'Giant Solar Shade'},
                        {name: 'Capital'},
                        {name: 'Noctis City'},
                    ],
                    forcedActions: [],
                    playedCards: [
                        {name: 'Point Luna'},
                        {name: 'Allied Bank'},
                        {name: 'Mining Operations'},
                        {name: 'Nuclear Zone'},
                        {name: 'Heavy Taxation'},
                        {name: 'Natural Preserve'},
                        {name: 'Building Industries'},
                    ],
                    preludes: [],
                    possiblePreludes: [],
                    resources: {
                        resourceMegacredit: 0,
                        resourceSteel: 3,
                        resourceTitanium: 2,
                        resourcePlant: 0,
                        resourceEnergy: 0,
                        resourceHeat: 1,
                    },
                    productions: {
                        resourceMegacredit: 8,
                        resourceSteel: 4,
                        resourceTitanium: 1,
                        resourcePlant: 0,
                        resourceEnergy: 0,
                        resourceHeat: 0,
                    },
                    parameterRequirementAdjustments: {
                        ocean: 0,
                        oxygen: 0,
                        temperature: 0,
                        venus: 0,
                    },
                    temporaryParameterRequirementAdjustments: {
                        ocean: 0,
                        oxygen: 0,
                        temperature: 0,
                        venus: 0,
                    },
                    cardCost: 3,
                    exchangeRates: {resourceSteel: 2, resourceTitanium: 3, resourceHeat: 0},
                    discounts: {
                        card: 0,
                        tags: {
                            tagSpace: 0,
                            tagVenus: 0,
                            tagBuilding: 0,
                            tagScience: 0,
                            tagEarth: 0,
                            tagPower: 0,
                        },
                        cards: {tagSpace: 0, tagEarth: 0},
                        standardProjects: 0,
                        standardProjectPowerPlant: 0,
                        nextCardThisGeneration: 0,
                        trade: 0,
                    },
                    fleets: 1,
                    pendingResourceActionDetails: null,
                    pendingDuplicateProduction: null,
                    pendingDiscard: null,
                    pendingTilePlacement: null,
                    terraformedThisGeneration: false,
                    previousCardsInHand: 12,
                };
            }
            res.setHeader('cache-control', 'no-cache');
            const index = game.players.indexOf(username);
            const {lastSeenLogItem = []} = game;
            const previousLastSeenLogItem = [...lastSeenLogItem];
            game.markModified('game.state');
            await game.save();
            game.lastSeenLogItem ||= [];
            if (index >= 0 && game.lastSeenLogItem[index] !== game.state.log.length) {
                game.lastSeenLogItem[index] = game.state.log.length;
                game.markModified('lastSeenLogItem');
                try {
                    await game.save();
                } catch (error) {}
            }
            let loggedInPlayerIndex = game.state.players.findIndex(
                player => player.username === username
            );
            if (loggedInPlayerIndex < 0 && game.state.players.length !== 1) {
                res.status(403);
                res.json({error: 'Cannot access this game'});
                return;
            }
            game.state.name = game.name;
            res.json({
                state: censorGameState(game.state, username),
                lastSeenLogItem: previousLastSeenLogItem[index] ?? game.lastSeenLogItem[index],
                username,
            });
            return;
        default:
            res.status(400);
            res.json({error: 'Misformatted request!!'});
    }
};
