import mongoose from 'mongoose';

const schema = mongoose.Schema;

import getConfig from 'next/config';
const {serverRuntimeConfig} = getConfig();

export const db = mongoose.connect(serverRuntimeConfig.MONGODB_URI);

const gamesSchema = new schema({
    state: {type: Object},
    players: {type: Array, default: []},
});

export let gamesModel;

try {
    gamesModel = mongoose.model('games');
} catch (error) {
    gamesModel = mongoose.model('games', gamesSchema);
}
