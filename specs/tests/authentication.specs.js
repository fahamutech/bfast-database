const axios = require('axios');
const {
    describe,
    it,
    after,
    before,
    beforeEach,
    afterEach
} = require('mocha');
const {mongoServer, daas, serverUrl} = require('../shared');
const assert = require('assert');
let mongoMemoryServer;
let daaSServer;

describe('Authentication Integration Test', function () {
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

    it('should create a new user', async function () {
        const user = {
            applicationId: 'daas',
            Authentication: {
                signUp: {
                    username:'joshua',
                    password: 'joshua'
                }
            }
        };
        const response = await axios.post(serverUrl, user);
        console.log(response.data);

    });
});
