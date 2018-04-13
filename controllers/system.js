var pjson = require('../package.json');

module.exports.getVersion = function(req, res) {
    console.info('controllers.system.getVersion');
    //TODO export a file with codes 200 ...
    var http_status = 200;

    res.send(http_status, {
        name: pjson.name,
        version: pjson.version
    });

};

exports.getHealthcheck = function(req, res, next) {
    console.info('controllers.system.getHealthcheck');
    //TODO
    var http_status = 200;
    res.send(http_status, {
        status: 1
    });
};