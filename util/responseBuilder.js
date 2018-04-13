var restifyErrors = require('restify-errors');

module.exports.createResponse = function (response, status, httpStatus, body) {
    
    console.trace('Sending response');
    response.header('Cache-Control', 'no-cache');
    response.header('Pragma', 'no-cache');
    response.header("StatusCode", status);
    response.send(httpStatus, body);
};


module.exports.createErrorResponse = function (response, status, httpStatus, message, reason) {
    console.trace('Sending Error response');

    var body =
    {
        errors: [{
            httpCode: httpStatus,
            status: status,
            message: message,
            reason: reason,
            requestId: response.req.getId()
        }]
    };

    response.header("statusCode", status);
    response.send(httpStatus, body);
};

module.exports.createError = function(res, status, httpStatus, body){
    res.header("statusCode", status);
    return restifyErrors.makeErrFromCode(httpStatus, body);
};