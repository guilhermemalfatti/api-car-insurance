var redis = require('redis');

// Global values
const CONNECT_TIMEOUT = 60; // seconds
const CONNECT_MAX_RETRIES = 10;
const RETRY_MAX_DELAY = 3000; // milli-seconds
const RETRY_CUMULATIVE_DELAY = 300; // milli-seconds
const KEY_PREFIX = 'redis-';
const SCAN_COUNT = process.env.REDIS_SCAN_COUNT || 100000;
const Database = {
    DEFAULT: 0,
    EVENTS: 1
};

// Add prefix to the key
function normalizeKey(key) {
    if (!key || typeof key !== 'string') {
        return '';
    }

    if (key.indexOf(KEY_PREFIX) != 0) {
        key = KEY_PREFIX + key;
    }
    return key;
}

// Auxiliary function to call callback
function callbackError(err, callback) {
    console.error(err);
    if (typeof callback === 'function') {
        callback(err);
    }
}

function RedisConnection(database) {
    if(database && (typeof database != 'number' || database < 0))
        throw new Error('Invalid database number: ' + database + '. Must be 0 or higher.');

    this.client = null;
    this.host = null;
    this.port = null;
    this.database = database || Database.DEFAULT;
}


RedisConnection.prototype.connect = function (host, port, callback) {
    if (!host || typeof host !== 'string') {
        console.info('Received HOST is invalid. Trying to get it from environment variable REDIS_HOSTNAME');
        host = process.env.REDIS_HOSTNAME;
    }
    if (!port || (typeof port !== 'string' && typeof port !== 'number')) {
        console.info('Received PORT is invalid. Trying to get it from environment variable REDIS_PORT');
        port = process.env.REDIS_PORT;
    }

    // Save data for future use
    this.host = host;
    this.port = port;

    // Assure that we only call the callback function ONCE
    var calledCallback = false,
        self = this;
    function callCallback(param) {
        if (!calledCallback && typeof callback === 'function') {
            calledCallback = true;
            callback(param);
        }
    }

    if (this.client && this.client.connected) {
        console.warn('Aborting new connection: redis client is already connected. Please call ".disconnect()" if you want to connect again.');
        return callCallback(); // Success, because the connection is up and running
    }

    try {
        console.info('Creating redis client / connecting to redis server');
        this.client = redis.createClient({
            host: host,
            port: port,
            retry_strategy: function (options) {
                if (options) {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        // End reconnecting on a specific error and flush all commands with a individual error
                        return new Error('Redis server refused the connection');
                    }
                    if (options.total_retry_time > CONNECT_TIMEOUT) {
                        // End reconnecting after a specific timeout and flush all commands with a individual error
                        return new Error('Redis retry time exhausted');
                    }
                    if (options.attempt > CONNECT_MAX_RETRIES) {
                        // End reconnecting with built in error
                        //callCallback(new Error('Exceeded maximum connect retries to redis'));
                        console.info('Redis connection retry attempts reached. Aborting now');
                        return undefined;
                    }
                }

                // reconnect
                var delay = Math.min(options.attempt * RETRY_CUMULATIVE_DELAY, RETRY_MAX_DELAY);
                console.info('Retrying connection to redis in ' + delay.toString() + 'ms');
                return delay;
            }
        });

        // Listen to the events
        this.client.on('ready', function onRedisClientReady() {
            console.info('Redis client is ready');
            if(self.database != Database.DEFAULT){
                self.client.select(self.database, function(err){
                    if(err) {
                        console.error('Failed to select Redis database ' + self.database);
                        console.error(err);
                        self.disconnect();
                    }
                    else
                        console.info('Selected database ' + self.database + ' successfully.');
                    
                    callCallback(err);
                })
            }
            else
                callCallback();
        });
        this.client.on('error', function onRedisClientError(err) {
            console.error('An error occurred while connecting to redis');
            console.error(err);
        });
        this.client.on('connect', function onRedisClientConnect(err) {
            console.info('A connection to redis was established');
        });
        this.client.on('end', function onRedisClientEnd(err) {
            var message = 'Redis client/connection has ended.';
            console.info(message);
            callCallback(message);
        });
        this.client.on('message', function onRedisClientMessage (channel, messageReceived)  {
            console.trace('New message to channel [' + channel + '] arrived.');
            self.emit('message', channel, messageReceived);
        });
    } catch (error) {
        console.error('Exception caught trying to establish redis connection');
        console.error(error);
        callback(error);
    }
    return this.client;
};

RedisConnection.prototype.disconnect = function () {
    console.info('Disconnecting from redis now...');
    if (this.client && typeof this.client.quit === 'function') {
        this.client.quit();
        console.info('Disconnected from redis.');
    }
    this.client = null;
};

// This function checks if connection is established, and connects if not connected
RedisConnection.prototype.validateConnection = function (callback) {
    if (!this.client || !this.client.connected) {
        console.warn('Tried to access redis when client is NOT connected. Trying to reconnect now...');
        this.connect(this.host, this.port, callback);
    } else {
        // Is already connected
        callback();
    }
};

// Now add same methods as the redis lib, but normalizing the key with the prefix
RedisConnection.prototype.set = function (key, value, callback, ttlSeconds) {
    var self = this;
    this.validateConnection(function (err) {
        if (err) {
            return callbackError('Error on redis connection. Aborting operation...', callback);
        }
        key = normalizeKey(key);
        self.client.set(key, value, function (error) {
            if (!error && typeof ttlSeconds === 'number' && ttlSeconds > 0) {
                self.client.expire(key, ttlSeconds, function (err, didSetExpiry) {
                    if (err) {
                        console.error('Error setting expiration for key: ' + key);
                        console.error(err);
                    }
                });
            }

            if (typeof callback === 'function') {
                callback(error, key);
            }
        });
    });
};

RedisConnection.prototype.get = function (key, callback) {
    var self = this;
    this.validateConnection(function (err) {
        if (err) {
            return callbackError('Error on redis connection. Aborting operation...', callback);
        }
        key = normalizeKey(key);
        self.client.get(key, function (error, obj) {
            if (typeof callback === 'function') {
                callback(error, obj, key);
            }
        })
    });
};

//TODO
//Add all redis commands
//https://redis.io/commands/

// Exports the "class"
module.exports.Connection = RedisConnection;
module.exports.Database = Database;
