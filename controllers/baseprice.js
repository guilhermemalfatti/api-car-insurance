var _ = require('lodash');
const DEFAULT_VALUE = 1000
module.exports.calculate = function(type ,year, model, make, incident) {
    var basePrices = require('../config/baseprice.json');
    var price = {
        value: null,
        priority: null
    };
    var car = {
        "type":  type,  
        "year": year,
        "model": model,
        "make": make,
        "incidentAVG": incident
    };
    
    basePrices.map(function(baseprice){
        var item = _.clone(baseprice);
        var basePrice = item.baseprice;        
        delete item.baseprice;
        var clonedCar = _.clone(car);
        if(_.isEqual(item, clonedCar) && (_.isNull(price.value) || price.priority < 5)){
            price = {
                value : basePrice,
                priority: 5
            }
            return;
        }
        
        delete item.incidentAVG;
        delete clonedCar.incidentAVG;
        if(_.isEqual(item, clonedCar) && (_.isNull(price.value) || price.priority < 4)){
            price = {
                value : basePrice,
                priority: 4
            }
            return;
        }
        
        delete item.make;
        delete clonedCar.make;
        if(_.isEqual(item, clonedCar) && (_.isNull(price.value) || price.priority < 3)){
            price = {
                value : basePrice,
                priority: 3
            }
            return;
        }
        
        delete item.model;
        delete clonedCar.model;
        if(_.isEqual(item, clonedCar) && (_.isNull(price.value) || price.priority < 2)){
            price = {
                value : basePrice,
                priority: 2
            }
            return;
        }
        
        delete item.year;
        delete clonedCar.year;
        if(_.isEqual(item, clonedCar) && (_.isNull(price.value) || price.priority < 1)){
            price = {
                value : basePrice,
                priority: 1
            }
            return;
        }
        
    });

    return price.value || DEFAULT_VALUE;

};
