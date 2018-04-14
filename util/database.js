var MySQL = require('./mysql.js');
var config = require("../config/config.js");
var pool = null;

exports.getConnection = function(){
    return pool;
};

exports.checkConnection = function (callback){
    pool.useConnection(function(err, connection){
        if(err){
            callback && callback(err, false);
        }
        else{
            callback && callback(null, true);
        }
        if (connection) {
            connection.release();
        }
    });
};

exports.createConnection = function(callback){
    pool = new MySQL({
        connectionLimit: 10,
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        multipleStatement: true
    });

    pool.useConnection(function(error, connection) {
        connection.release();
        if (error) {
            callback(error);
        } else {
            callback(null);
        }
    });

};