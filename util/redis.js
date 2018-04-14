var redis = require('./redisConnection.js');
var config = require('../config/config.js');

var cacheConnection = new redis.Connection();

exports.createConnection = function (callback) {
    try {
        cacheConnection.connect(config.Redis.Host, config.Redis.Port, function(err){
            callback(err);
        });
    } catch (error) {
        console.error(error);
        return callback(error);
    }
};

exports.setValue = function (key, value, callback) {
    var ttl = 1;
    if (!isNaN(config.Redis.TTL)) {
        ttl = config.Redis.TTL;
    }
    cacheConnection.set(config.Redis.Prefix + key, value, function(err) {
        if(err){
            console.error('Failed to set value at cache redis: ' + err);
        }
        callback(err);
    }, ttl);
};

exports.getValue = function (key, default_value, callback) {
    cacheConnection.get(config.Redis.Prefix + key, function(err, results) {
        if(err){
            console.error('Failed to set value at cache redis: ' + err);
            callback(err, default_value);
        }else{
            callback(null, results);
        }
    });
};