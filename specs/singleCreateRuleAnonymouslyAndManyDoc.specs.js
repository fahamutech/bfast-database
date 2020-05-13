const axios = require('axios');
const {
    describe,
    it,
    after,
    before
} = require('mocha');
const {daas, mongoServer} = require('./shared');
const assert = require('assert');
let mongoMemoryServer;
let daaSServer;

describe('CreateRule with Many Document & Default Database', function () {
    before(async function () {
        mongoMemoryServer = mongoServer();
        await mongoMemoryServer.start();
        daaSServer = await daas(await mongoMemoryServer.getUri());
        await daaSServer.start();
    });
    after(async function () {
        await daaSServer.stop();
        await mongoMemoryServer.stop();
    });

    it('Create Many Resource Anonymously and Return specified fields', async function () {
        const rule = {
            applicationId: 'daas',
            CreateTest: [
                {
                    name: 'joshua',
                    return: ['id', 'createdAt']
                },
                {
                    name: 'eitan',
                    return: ['id']
                }
            ]
        }
        const response = await axios.post('http://localhost:3000/daas', rule);
        const data = response.data;
        console.log(data);
        assert(typeof data === 'object');
        assert(Array.isArray(data.Test));
        assert(data.Test.length === 2);
        assert(data.errors === undefined);
    });


});
