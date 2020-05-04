require('dotenv').config();

module.exports = {
    serverRuntimeConfig: {
        MONGODB_URI: process.env.MONGODB_URI,
    },
};
