const axios = require('axios');
const {mongoServer, daas, serverUrl} = require('../shared');
const assert = require('assert');
let mongoMemoryServer;
let daaSServer;

describe('Authorization', function () {
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

    it('should add an auth permission to a resource', async function () {
        const user = {
            applicationId: 'daas',
            Authentication: {
                signUp: {
                    username: 'joshua1',
                    password: 'joshua1',
                    email: 'joshua1@gmail.com'
                }
            }
        };
        const response = await axios.post(serverUrl, user);
        // console.log(response.data);
        const user1 = {
            applicationId: 'daas',
            Authentication: {
                signIn: {
                    username: 'joshua1',
                    password: 'joshua1',
                }
            }
        };
        const response1 = await axios.post(serverUrl, user1);
        console.log(response1.data);
    });

});
