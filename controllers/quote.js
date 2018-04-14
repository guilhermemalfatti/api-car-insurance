var database = require('../util/database.js');
var responseBuilder = require("../util/responseBuilder");

module.exports.setQuote = function(req, res) {
    console.info('call controllers.quote.setQuote');
    var pool = database.getConnection();
    var post = {SSN: req.params.customer.SSN, 
            name: req.params.customer.name,
            gender: req.params.customer.gender,
            dateOfBirth: new Date(req.params.customer.dateOfBirth),
            address: req.params.customer.address,
            email: req.params.customer.email,
            phoneNumber: req.params.customer.phoneNumber,
            type: req.params.vehicle.type,
            manufacturingYear: req.params.vehicle.manufacturingYear,
            model: req.params.vehicle.model,
            make: req.params.vehicle.make//brand
            };
    var fields = ['SSN','name', 'gender', 'dateOfBirth', 'address', 'email', 'phoneNumber', 'type', 'manufacturingYear', 'model', 'make'];

    pool.selectFromTable(['SSN', 'quoteId'], 'QuoteInformation', 'SSN = ' + post.SSN, function(error, results){
        if(error){
            responseBuilder.createErrorResponse(res, 500, 500, error.sqlMessage);
        }else{
            if(results.length > 0){
                pool.updateTable('QuoteInformation', post, 'SSN = ' + post.SSN, function(){
                    if (error){
                        responseBuilder.createErrorResponse(res, 500, 500, error.sqlMessage);
                    }else{
                        responseBuilder.createResponse(res, 200, 200, {quote: results[0].quoteId});
                    }
                })
            }else{
                pool.insertRowsIntoTable([post],'QuoteInformation', fields, function (error, results) {
                    if (error){
                        responseBuilder.createErrorResponse(res, 500, 500, error.sqlMessage);
                    }else{
                        responseBuilder.createResponse(res, 200, 200, {quote: results.insertId});
                    }
                  });
            }
        }
    });

};
