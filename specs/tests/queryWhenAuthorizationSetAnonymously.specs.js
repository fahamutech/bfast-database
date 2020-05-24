const axios = require('axios');
const {
    describe,
    it,
    after,
} = require('mocha');
const {mongoServer, daas, serverUrl} = require('../shared');
const assert = require('assert');
let mongoMemoryServer;
let daaSServer;

describe('QueryRule Integration Test', function () {

    before(async function () {
        mongoMemoryServer = mongoServer();
        await mongoMemoryServer.start();
        daaSServer = await daas(await mongoMemoryServer.getUri());
        await daaSServer.start();
        const authorizationRule = {
            applicationId: 'daas',
            masterKey: 'daas',
            Authorization: {
                rules: {
                    'create.*': `return true;`,
                    'query.*': `return true;`,
                }
            },
            CreateTest: [
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
            ],
        }
        await axios.post(serverUrl, authorizationRule);
    });

    after(async function () {
        await daaSServer.stop();
        await mongoMemoryServer.stop();
    });

    it('should query by id when applicationId supplied and authorization is anonymously', async function () {
        const queryRule = {
            applicationId: 'daas',
            QueryTest: {
                id: 'joshua',
                return: []
            }
        };
        const response = await axios.post(serverUrl, queryRule);
        // console.log(response.data);
        assert(response.data.errors === undefined);
        assert(response.data['ResultOfQueryTest'] !== undefined);
        assert(typeof response.data['ResultOfQueryTest'] === "object");
        assert(!Array.isArray(response.data['ResultOfQueryTest']));
        assert(response.data['ResultOfQueryTest'].id === "joshua");
    });

    it('should  not query if applicationId not supplied and authorization is anonymously', async function () {
        const queryRule = {
            QueryTest: {
                id: 'joshua',
                return: []
            }
        };
        try {
            await axios.post(serverUrl, queryRule);
        } catch (e) {
            assert(e.response.status === 401);
            assert(e.response.data.message === 'unauthorized');
            assert(typeof e.response.data === 'object');
        }
    });

    it('should query by filter when applicationId supplied and authorization is anonymously', async function () {
        const queryRule = {
            applicationId: 'daas',
            QueryTest: {
                filter: {
                    name: 'eitan'
                },
                return: []
            }
        };
        const response = await axios.post(serverUrl, queryRule);
        // console.log(response.data);
        assert(response.data.errors === undefined);
        assert(response.data['ResultOfQueryTest'] !== undefined);
        assert(Array.isArray(response.data['ResultOfQueryTest']));
        assert(response.data['ResultOfQueryTest'][0].name === "eitan");
        assert(response.data['ResultOfQueryTest'].length === 1);
    });

});
