var test = require('tape');
var controller = require('../controllers/customerModifier.js');

test('Calculate modifier', function(t){
    t.plan(1);
    var modifier = controller.calculate('male', 27);

    t.equal(modifier, 1.2, 'Modifier is: ' + modifier + ' and should be: ' + 1.2);
    t.end();
});
