const {getRulesController, mongoRepSet} = require('../../mock.config');
const {before, after} = require('mocha');
const assert = require('assert');

describe('RulesController::Create Unit Test', function () {
    let _rulesController;
    let mongoMemoryReplSet
    before(async function () {
        this.timeout(10000000);
        mongoMemoryReplSet = mongoRepSet();
        _rulesController = await getRulesController(mongoMemoryReplSet);
    });
    after(async function () {
        await mongoMemoryReplSet.stop();
    });

    describe('RulesController::Create::Anonymous', function () {
        it('should return added record with write access public', async function () {
            const results = await _rulesController.handleCreateRules({
                createTest: {
                    name: 'doe',
                    age: 20,
                    return: []
                }
            }, {errors: {}});
            assert(results.createTest !== undefined);
            assert(typeof results.createTest === 'object');
            assert(typeof results.createTest['id'] === 'string');
            assert(typeof results.createTest['objectId'] === 'string');
            assert(results.createTest['name'] === 'doe');
            assert(results.createTest['age'] === 20);
        });
    });
});
