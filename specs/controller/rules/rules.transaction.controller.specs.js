const {getRulesController, mongoRepSet} = require('../../mock.config');
const {before, after} = require('mocha');
const assert = require('assert');

describe('RulesController::Transaction Unit Test', function () {
    let _rulesController;
    let mongoMemoryReplSet;
    before(async function () {
        this.timeout(1000000);
        mongoMemoryReplSet = mongoRepSet();
        _rulesController = await getRulesController(mongoMemoryReplSet);
    });
    after(async function () {
        this.timeout(10000);
        await mongoMemoryReplSet.stop();
    });
    describe('RulesController::Transaction::Anonymous', function () {
        before(async function () {
            await _rulesController.handleCreateRules({
                createProduct: [
                    {name: 'xyz', price: 50, status: 'new', id: 'xyz'},
                ]
            }, {errors: {}});
        });
        it('should perform transaction', async function () {
            const results = await _rulesController.handleTransactionRule({
                transaction: {
                    commit: {
                        createProduct: [
                            {name: 'zxc', price: 100, status: 'new'},
                            {name: 'mnb', price: 30, status: 'new'},
                        ],
                        updateProduct: {
                            id: 'xyz',
                            return: [],
                            update: {
                                $set: {
                                    name: 'apple',
                                    price: 1000
                                }
                            }
                        },
                        deleteProduct: {
                            id: 'xyz'
                        },
                        queryProduct: {
                            filter: {},
                            return: []
                        }
                    }
                }
            }, {errors: {}});
            assert(results.transaction !== undefined);
            assert(results.transaction.commit !== undefined);
            assert(results.transaction.commit.createProduct !== undefined);
            assert(results.transaction.commit.queryProduct !== undefined);
            assert(results.transaction.commit.updateProduct !== undefined);
            assert(results.transaction.commit.updateProduct.name === 'apple');
            assert(results.transaction.commit.updateProduct.price === 1000);
            assert(results.transaction.commit.updateProduct.id === 'xyz');
            assert(results.transaction.commit.queryProduct !== undefined);
            assert(results.transaction.commit.deleteProduct !== undefined);
            assert(typeof results.transaction.commit.deleteProduct.id === 'string');
            assert(Array.isArray(results.transaction.commit.createProduct));
            assert(Array.isArray(results.transaction.commit.queryProduct));
            assert(results.transaction.commit.createProduct.length === 2);
            assert(results.transaction.commit.queryProduct.length === 3);

        });
    });
});
