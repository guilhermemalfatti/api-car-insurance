var database = require('../util/database.js');
var responseBuilder = require("../util/responseBuilder");
var baseprice =require('./baseprice.js');
var customerModifier = require('./customerModifier.js');
let {AgeFromDateString, AgeFromDate} = require('age-calculator');

module.exports.retriveQuote = function(req, res){
    console.info('call controllers.quote.retriveQuote');
    var pool = database.getConnection();
    pool.selectFromTable(['quoteId', 'status', 'price'], 'QuoteCondition', 'quoteId = ' + req.params.quoteId, function(error, results){
        if(error){
            responseBuilder.createErrorResponse(res, 500, 500, error.sqlMessage);
        }else{
            if(results.length > 0){
                responseBuilder.createResponse(res, 200, 200, {quote: results[0]});
            }else{
                responseBuilder.createErrorResponse(res, 404, 404, 'Not found.');
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
                pool.insertRowsIntoTable([post],'QuoteInformation', fields, function (error, results) {
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
                pool.insertRowsIntoTable([post],'QuoteCondition', fields, function (error, results) {
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