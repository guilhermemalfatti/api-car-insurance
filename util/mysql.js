var mysql = require('mysql');

function MySQL(dbConfig){
    var defaultValues = {
        connectionLimit : dbConfig.connectionLimit || 10,
        multipleStatements: dbConfig.multipleStatements || true
    };
    Object.assign(dbConfig, defaultValues);
    this.pool = mysql.createPool(dbConfig);

}

module.exports = MySQL;

MySQL.prototype.useConnection = function useConnection(next){
    this.pool.getConnection( function (err, connection) {
        if (!err && connection){
            next(err,connection);
        }
        else {
            next(err, null);
        }
    });
};

MySQL.prototype.insertRowsIntoTable = function insertRowsIntoTable(insertRows, tableName, fields, callback) {
    var self = this;
    this.pool.getConnection(function (error, connection) {
        if (error) {
            console.error(error);
            callback && callback(error);
        }
        else {
            var post = self.jsonToNestedArray(fields, insertRows);
            var queryString = 'INSERT INTO ' + tableName + ' (' + fields.join(',') + ') VALUES ?';

            runQuery(connection, queryString, [post], callback);
        }
    });
};

MySQL.prototype.selectFromTable = function selectFromTable(fields, tableName, whereClause, callback) {
    this.pool.getConnection(function (error, connection) {
        if (error) {
            console.error(error);
            callback && callback(error);
        }
        else {
            var queryString = "SELECT " + fields + " FROM " + tableName + (whereClause ? " WHERE " + whereClause : "");
            runQuery(connection, queryString, null, callback);
        }
    });
};

function runQuery(connection, queryString, post, callback){
    var startTime = Date.now();
    connection.query(queryString, post, function(error, rows){
        console.log('libmysqlRunQuery', { query: queryString + (post ? JSON.stringify(post) : ""), duration: Date.now() - startTime, failed: !!error });
        if(error) console.error(error);
        connection.release();
        callback && callback(error, rows);
    });
}

//TODO
//transactions, Delet, Update

MySQL.prototype.jsonToNestedArray = function jsonToNestedArray(fields, rows) {
    var nestedArray = [];

    for (var rowIndex in rows) {
        var newSet = [];
        for (var fieldIndex in fields) {
            newSet.push(rows[rowIndex][fields[fieldIndex]]);
        }
        if (newSet.length > 0)
            nestedArray.push(newSet);
    }

    return nestedArray;
};

MySQL.prototype.escape = function escape(value){
    return mysql.escape(value);
};

MySQL.prototype.escapeColumnValue = function escapeColumnValue(column, value, operator){
    return column + (operator ? operator : " = ") + this.escape(value);
};
