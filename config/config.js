"use strict";
require('dotenv-extended').load()

module.exports = {
    db: {
        host: process.env.DB_HOSTNAME,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    },

    Redis: {
        Host: process.env.REDIS_HOST,
        Port: process.env.REDIS_PORT,
        Prefix: process.env.PREFIX
    }
};
