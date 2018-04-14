var database = require('../util/database.js');
var responseBuilder = require("../util/responseBuilder");
var baseprice =require('./baseprice.js');
var customerModifier = require('./customerModifier.js');
let {AgeFromDateString, AgeFromDate} = require('age-calculator');
var redisCache = require('../util/redis.js');

module.exports.retriveQuoteStatus = function(req, res){
    console.info('call controllers.quote.retriveQuoteStatus');
    var pool = database.getConnection();
    pool.selectFromTable(['quoteId', 'status', 'price'], 'QuoteCondition', 'quoteId = ' + req.params.quoteId, function(error, results){
        if(error){
            responseBuilder.createErrorResponse(res, 500, 500, error.sqlMessage);
        }else{
            if(results.length > 0){
                responseBuilder.createResponse(res, 200, 200, {quote: results[0]});
            }else{
                responseBuilder.createErrorResponse(res, 404, 200, 'Quote not found.');
            }
        }
    });
}


module.exports.retriveQuoteInformation = function(req, res){
    console.info('call controllers.quote.retriveQuoteInformation');
    var pool = database.getConnection();
    var fields = ['quoteId', 'SSN','name', 'gender', 'dateOfBirth', 'address', 'email', 'phoneNumber', 'type', 'manufacturingYear', 'model', 'make'];
    var quoteKey = 'quote-information-';

    redisCache.getValue(quoteKey + req.params.quoteId, undefined, function(err, results){
        if(err){
            console.log("redis error: " + err.message);
        }else{
            if(results){
                responseBuilder.createResponse(res, 200, 200, JSON.parse(results));
            }else{
                pool.selectFromTable(fields, 'QuoteInformation', 'quoteId = ' + req.params.quoteId, function(error, results){
                    if(error){
                        responseBuilder.createErrorResponse(res, 500, 500, error.sqlMessage);
                    }else{
                        if(results.length > 0){
                            redisCache.setValue(quoteKey + req.params.quoteId, JSON.stringify(results[0]), function(){
                                responseBuilder.createResponse(res, 200, 200, results[0]);
                            });                        
                        }else{
                            responseBuilder.createErrorResponse(res, 404, 200, 'Quote not found.');
                        }
                    }
                });
            }            
        }
    });
}

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
                        performQuote(results[0].quoteId, post);
                        responseBuilder.createResponse(res, 200, 200, {quote: results[0].quoteId});
                    }
                })
            }else{
                pool.insertRows([post],'QuoteInformation', fields, function (error, results) {
                    if (error){
                        responseBuilder.createErrorResponse(res, 500, 500, error.sqlMessage);
                    }else{
                        performQuote(results.insertId, post);
                        responseBuilder.createResponse(res, 200, 200, {quote: results.insertId});
                    }
                });
            }
        }
    });
};

function performQuote(quoteid, quoteinfo){
    var pool = database.getConnection();
    var basepriceValue = baseprice.calculate(quoteinfo.type, quoteinfo.manufacturingYear, quoteinfo.model, quoteinfo.make, 0);    
    var age = new AgeFromDate(new Date(quoteinfo.dateOfBirth)).age;
    var modifier = customerModifier.calculate(quoteinfo.gender, age);
    var status = 'pending';

    var post = {
        quoteId : quoteid,
        status : status,
        price : basepriceValue * modifier
    };

    var fields = ['quoteId', 'status', 'price'];

    pool.selectFromTable(['quoteId'], 'QuoteCondition', 'quoteId = ' + quoteid, function(error, results){
        if(error){
            console.error(error.sqlMessage)
        }else{
            if(results.length > 0){
                pool.updateTable('QuoteCondition', post, 'quoteId = ' + quoteid, function(){
                    if (error){
                        console.error(error.sqlMessage)
                    }else{
                        console.info('Quote performed');
                    }
                })
            }else{
                pool.insertRows([post],'QuoteCondition', fields, function (error, results) {
                    if (error){
                        console.error(error.sqlMessage)
                    }else{
                        console.info('Quote performed');
                    }
                });
            }
        }
    });
}