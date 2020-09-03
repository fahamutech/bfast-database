const {getRulesController, mongoRepSet} = require('../../mock.config');
const {before, after} = require('mocha');
const assert = require('assert');

describe('RulesController::Update Unit Test', function () {
    let _rulesController;
    let mongoMemoryReplSet;
    before(async function () {
        this.timeout(100000);
        mongoMemoryReplSet = mongoRepSet();
        _rulesController = await getRulesController(mongoMemoryReplSet);
    });
    after(async function () {
        this.timeout(100000);
        await mongoMemoryReplSet.stop();
    });
    describe('RulesController::Update::Anonymous', function () {
        before(async function () {
            await _rulesController.handleCreateRules({
                createProduct: [
                    {name: 'xyz', price: 50, status: 'new', id: 'xyz'},
                    {name: 'wer', price: 100, status: 'new'},
                    {name: 'poi', price: 30, status: 'new'},
                ]
            }, {errors: {}});
        });
        it('should update a document by id', async function () {
            const results = await _rulesController.handleUpdateRules({
                updateProduct: {
                    id: 'xyz',
                    update: {
                        $set: {
                            name: 'apple'
                        }
                    },
                    return: []
                }
            }, {errors: {}});
            assert(results.updateProduct !== null);
            assert(results.updateProduct.name === 'apple');
            assert(results.updateProduct.price === 50);
        });
        it('should update a document by filter', async function () {
            const results = await _rulesController.handleUpdateRules({
                updateProduct: {
                    filter: {
                        status: 'new'
                    },
                    update: {
                        $set: {
                            name: 'apple',
                            status: 'old'
                        }
                    },
                    return: []
                }
            }, {errors: {}});
            assert(results.updateProduct !== null);
            assert(Array.isArray(results.updateProduct));
            assert(results.updateProduct.length === 3);
            assert(results.updateProduct[0].name === 'apple');
            assert(results.updateProduct[0].status === 'old');
            assert(results.updateProduct[1].name === 'apple');
            assert(results.updateProduct[1].status === 'old');
            assert(results.updateProduct[2].name === 'apple');
            assert(results.updateProduct[2].status === 'old');
        });
        it('should not update objects by empty filter', async function () {
            const results = await _rulesController.handleUpdateRules({
                updateProduct: {
                    filter: {},
                    update: {
                        $set: {
                            name: 'apple'
                        }
                    },
                    return: []
                }
            }, {errors: {}});
            assert(results.updateProduct === undefined);
            assert(results.errors !== undefined);
            assert(results.errors['update.Product']['message'] === 'Empty map is not supported in update rule');
        });
        it('should update when empty filter and id is supplied', async function () {
            const results = await _rulesController.handleUpdateRules({
                updateProduct: {
                    id: 'xyz',
                    filter: {},
                    update: {
                        $set: {
                            name: 'apple'
                        }
                    },
                    return: []
                }
            }, {errors: {}});
            assert(results.updateProduct !== undefined);
            assert(results.updateProduct['id'] === 'xyz');
            assert(typeof results.updateProduct === 'object');
        })
    });
});
