var test = require('tape');
var controller = require('../controllers/customerModifier.js');

test('Calculate modifier', function(t){
    t.plan(4);
    var modifier = controller.calculate('male', 27);

    t.equal(modifier, 1.2, 'Modifier is: ' + modifier + ' should be: ' + 1.2);

    modifier = controller.calculate('male', 66);
    t.equal(modifier, 1.3, 'Modifier is: ' + modifier + ' should be: ' + 1.3);

    modifier = controller.calculate('female', 66);
    t.equal(modifier, 1.2, 'Modifier is: ' + modifier + ' should be: ' + 1.2);

    modifier = controller.calculate('female', 18);
    t.equal(modifier, 1.4, 'Modifier is: ' + modifier + ' should be: ' + 1.4);
    t.end();
});

