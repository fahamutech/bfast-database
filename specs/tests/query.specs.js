const axios = require('axios');
const {
    describe,
    it,
    after,
    before
} = require('mocha');
const {mongoServer, daas, serverUrl} = require('../shared');
const {createMany} = require('../controller/createController');
const assert = require('assert');
let mongoMemoryServer;
let daaSServer;

describe('QueryRule Integration Test', function () {
    before(async function () {
        mongoMemoryServer = mongoServer();
        await mongoMemoryServer.start();
        daaSServer = await daas(await mongoMemoryServer.getUri());
        await daaSServer.start();
        await createMany([
            {
                id: 'joshua',
                name: 'joshua',
                likes: {
                    movies: 'Action'
                }
            },
            {
                name: 'mshana',
                height: '130cm',
                likes: {
                    movies: 'Action'
                }
            },
            {
                name: 'eitan',
                age: 20,
                address: {
                    city: 'Dar Es Salaam'
                }
            }
        ]);
    });
    after(async function () {
        await daaSServer.stop();
        await mongoMemoryServer.stop();
    });

    it('should query when applicationId supplied', async function () {
        const query = {
            applicationId: 'daas',
            QueryTest: {
                id: 'joshua',
                return: []
            }
        };
        const response = await axios.post(serverUrl, query);
        console.log(response.data);
    });
});
