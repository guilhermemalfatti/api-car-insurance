var modifier = require('../config/modifierRule.json');
var _ = require('lodash');

module.exports.calculate = function(gender, age) {
    var value = null;
    modifier.map(function(item){
        if(_.isEqual(item.gender, gender) && (age > item.rangeA && (age <item.rangeB || _.isNull(item.rangeB)))){
            value = item.modifier;
        }
    });

    return value;

};
