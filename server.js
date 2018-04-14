var restify = require('restify');
var responseBuilder = require("./util/responseBuilder");
var helmet = require('helmet');
var database = require('./util/database.js');
var Q = require('q');
var redis_connector = require('./util/redis.js');

require('dotenv-extended').load()

// Constants
var DEFAULT_HTTP_PORT = 8080;

// Server creation
var server = restify.createServer({
    name: 'Car Insurance'
});

//server.use(restify.fullResponse());
//server.use(restify.queryParser());
server.use(restify.plugins.bodyParser({mapParams: true}));
server.use(helmet());	
// Controllers and validators
var controllersPath = './controllers/';
var controllers = {
    version: require(controllersPath + 'system.js').getVersion,
    healthcheck: require(controllersPath + 'system.js').getHealthcheck,
    quote: require(controllersPath + 'quote.js')
};

var validatorsPath = './validators/';
var validators = {
    body: require(validatorsPath + 'validate.js')
};

server.get({path: "/version"}, controllers.version);
server.get({path: "/healthcheck"}, controllers.healthcheck);

server.get({path: "/quoteStatus/:quoteId"}, controllers.quote.retriveQuoteStatus);
server.get({path: "/quoteInformation/:quoteId"}, controllers.quote.retriveQuoteInformation);

server.post({path: "/quote"}, validators.body.bodyValidate, controllers.quote.setQuote);

function startServer () {
    var port = process.env.PORT || DEFAULT_HTTP_PORT;

    server.listen(port, function (error) {
        if (error) {
            console.error('Error starting server: ' + (error.stack || error));
        } else {
            console.info(server.name + ' server listening on port: ' + port);
        }
    });

    // Exception handling
    server.on('uncaughtException', function (req, res, route, err) {
        console.error('Uncaught Exception: ' + (err.stack || err));
        //todo file to export codes: 500 ..
        responseBuilder.createErrorResponse(res, 500, 500, 'Internal Server Error.');        
    });

    server.on('NotFound', (req, res, route, err) => {
        responseBuilder.createErrorResponse(res, 404, 404, 'Service not registered.');
    });

    server.on('MethodNotAllowed', (req, res, route, err) => {
        responseBuilder.createErrorResponse(res, 405, 405, 'Method not allowed.');
    });

    server.on('UnsupportedMediaType', (req, res, route, err) => {        
        responseBuilder.createErrorResponse(res, 415, 415, 'Unsupported media type.');
    });

    server.on('restifyError', (req, res, route, err) => {
        responseBuilder.createErrorResponse(res, 500, 500, 'Internal server error.');
    });
}

function setupDatabaseConnection() {
    var deferred = Q.defer();
    database.createConnection(deferred.makeNodeResolver());
    return deferred.promise;
}

function setupCacheRedis() {
    var deferred = Q.defer();
    redis_connector.createCacheConnection(deferred.makeNodeResolver());
    return deferred.promise;
}

function setupServer(callback){
    setupDatabaseConnection().then(function(){
            setupCacheRedis().then(function(){
                    return callback(null, 'Redis');
                }).catch(function(){
                    callback(error, 'Redis');
                });
            return callback(null, 'Database');
        }).catch(function(error){
           callback(error, 'DataBase');
        });
}

setupServer(function(error, label){
    if (error) {
        console.info("Error on starting " + label);
        console.error(error);
    } else {
        console.info(label + ' is up');
    }
});

startServer();