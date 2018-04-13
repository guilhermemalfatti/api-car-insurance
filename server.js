var restify = require('restify');
var responseBuilder = require("./util/responseBuilder");
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

// Controllers and validators
var controllersPath = './controllers/';
var controllers = {
    version: require(controllersPath + 'system.js').getVersion,
    healthcheck: require(controllersPath + 'system.js').getHealthcheck
};

/* var validatorsPath = './validators/';
var validators = {
    body: require(validatorsPath + 'identity.js')
}; */

// todo
//server.pre(...);

// Requests configuration
//server.post({path: '/message/:reference'}, validators.headers.validate, validators.identity.validateAccessToken,
//    validators.noderegistry.validateReference, validators.dataframebody.validateBody, controllers.message.sendMessages);


server.get({path: "/version"}, controllers.version);
server.get({path: "/healthcheck"}, controllers.healthcheck);


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

        //todo file to export codes 500 ..
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

startServer();