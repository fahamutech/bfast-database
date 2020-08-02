const {
    before,
    after,
    it,
    describe
} = require('mocha');
const {serverUrl} = require('../mock.config');
const {createMany} = require('../controller/database.controller.specs');
const assert = require('assert');

describe('CreateRule with Many Document & Default Database', function () {

    it('Create Many Resource Anonymously and Return specified fields', async function () {
        const data = await createMany([
            {
                name: 'joshua',
                return: ['id', 'createdAt']
            },
            {
                name: 'eitan',
                return: ['id']
            }
        ]);
        console.log(data);
        assert(typeof data === 'object');
        assert(Array.isArray(data.Test));
        assert(data.Test.length === 2);
        assert(data.errors === undefined);
    });


});
