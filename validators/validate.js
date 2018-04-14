var responseBuilder = require("../util/responseBuilder");

//dumb validation
exports.bodyValidate = function(req, res, next) {
    console.info('call bodyValidate');

    var customer = req.params.customer;
    var vehicle = req.params.vehicle;


    for (property in customer){
        if(customer[property]===''|| customer[property] === null){
            responseBuilder.createErrorResponse(res, 400, 400, "Missing mandatory body parameters");
            return;
        }
    }

    
    for (property in vehicle){
        if(customer[property]===''|| customer[property] === null){
            responseBuilder.createErrorResponse(res, 400, 400, "Missing mandatory body parameters");
            return;
        }
    }
    

    return next();
    
};