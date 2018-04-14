var test = require('tape');
var controller = require('../controllers/basePrice.js');

test('Base price all fields', function(t){
    t.plan(1);
    var basePrice = controller.calculate('other', 2013, 'unknown', 'unknown', 30);
    var expectedBasePrice = 2500;

    t.equal(basePrice, expectedBasePrice, 'Base price is: ' + basePrice + ' and should be: ' + expectedBasePrice);
    t.end();
}); 

test('Base price fields (Type+Year+Make+Model)', function(t){
    t.plan(1);
    var basePrice = controller.calculate('motorcycle', 2013, 'k13000', 'BMW', 1);
    var expectedBasePrice = 4000;

    t.equal(basePrice, expectedBasePrice, 'Base price is: ' + basePrice + ' and should be: ' + expectedBasePrice);
    t.end();
}); 

test('Base price fields (Type+Year+Make)', function(t){
    t.plan(1);
    var basePrice = controller.calculate('car', 2013, 'Uno', 'fiat', 22);
    var expectedBasePrice = 3000;

    t.equal(basePrice, expectedBasePrice, 'Base price is: ' + basePrice + ' and should be: ' + expectedBasePrice);
    t.end();
});
 
test('Base price fields (Type+Year)', function(t){
    t.plan(1);
    var basePrice = controller.calculate('car', 2011, 'palio', 'fiat', 12);
    var expectedBasePrice = 2000;

    t.equal(basePrice, expectedBasePrice, 'Base price is: ' + basePrice + ' and should be: ' + expectedBasePrice);
    t.end();
});
 
test('Base price fields (Type)', function(t){
    t.plan(1);
    var basePrice = controller.calculate('truck', 2011, '1120', 'mercedes', 12);
    var expectedBasePrice = 8000;

    t.equal(basePrice, expectedBasePrice, 'Base price is: ' + basePrice + ' and should be: ' + expectedBasePrice);
    t.end();
});
