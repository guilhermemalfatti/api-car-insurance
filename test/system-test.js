var test = require('tape');
var proxyquire = require('proxyquire');

var proxyquireMocks = {
    '../util/responseBuilder.js': {        
        createResponse: function (a, b, c, d) {
            return;
        }        
    },
    '../util/redis.js':{
        setValue: function(a,b,callback){
            callback();
            return;
        },
        getValue: function(a,b,callback){
            callback();
            return;
        }
    },
    '../util/database.js':{
        getConnection: function(){
            return {
                selectFromTable: function(a,b,c,callback){
                    callback(undefined, [1]);
                    return;
                }
            };
        }
    }
};

function copyObject(obj) {
    var result = (obj instanceof Array) ? [] : {};
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) {
            continue;
        }
        var value = obj[i];
        result[i] = typeof value == 'object' ? copyObject(value) : value;
    }
    return result;
};

test('Get healtcheck', function(t){
    t.plan(3);

    var res = "My response";
    var req = {};
    
    var localMocks = copyObject(proxyquireMocks);
    var responseBuilder = localMocks['../util/responseBuilder.js'];
    responseBuilder.createResponse = function (a, b, c) {
        t.equal(a, res, 'Response should be as defined');
        t.equal(b, 200, 'Status should be 200');
        t.equal(c, 200, 'HTTP Status should be 200');
    };

    var system = proxyquire('../controllers/system.js', localMocks);
    system.getHealthcheck(req, res);
});



test('Get quote information', function(t){
    t.plan(3);

    var res = "My response";
    var req = {
        params: {
            quoteId : 1
        }
    };
    
    var localMocks = copyObject(proxyquireMocks);
    var responseBuilder = localMocks['../util/responseBuilder.js'];
    responseBuilder.createResponse = function (a, b, c) {
        t.equal(a, res, 'Response should be as defined');
        t.equal(b, 200, 'Status should be 200');
        t.equal(c, 200, 'HTTP Status should be as 200');
    };

    var quote = proxyquire('../controllers/quote.js', localMocks);
    quote.retriveQuoteInformation(req, res);
}); 
