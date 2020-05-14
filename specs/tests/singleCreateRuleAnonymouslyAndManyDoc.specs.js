const {
    describe,
    it,
    after,
    beforeEach,
    afterEach
} = require('mocha');
const {daas, mongoServer, serverUrl} = require('../shared');
const {createMany} = require('../controller/createController');
const assert = require('assert');
let mongoMemoryServer;
let daaSServer;

describe('CreateRule with Many Document & Default Database', function () {
    beforeEach(async function () {
        mongoMemoryServer = mongoServer();
        await mongoMemoryServer.start();
        daaSServer = await daas(await mongoMemoryServer.getUri());
        await daaSServer.start();
    });
    afterEach(async function () {
        await daaSServer.stop();
        await mongoMemoryServer.stop();
    });

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
