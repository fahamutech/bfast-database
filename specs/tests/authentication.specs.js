const axios = require('axios');
// const {
//     describe,
//     it,
//     after,
//     before,
//     beforeEach,
//     afterEach
// } = require('mocha');
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

    it('should send a reset password email', async function () {
        const user = {
            applicationId: 'daas',
            Authentication: {
                signUp: {
                    username: 'joshua2',
                    password: 'joshua2',
                    email:'joshua2@gmail.com'
                }
            }
        };
        const response = await axios.post(serverUrl, user);
        // console.log(response.data);
        const user1 = {
            applicationId: 'daas',
            Authentication: {
                resetPassword: {
                    email: 'joshua2@gmail.com'
                }
            }
        };
        const response1 = await axios.post(serverUrl, user1);
        console.log(response1.data);
    });

    it('should signIn a registered user', async function () {
        const user = {
            applicationId: 'daas',
            Authentication: {
                signUp: {
                    username: 'joshua1',
                    password: 'joshua1',
                    email:'joshua1@gmail.com'
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

    it('should create a new user', async function () {
        const user = {
            applicationId: 'daas',
            Authentication: {
                signUp: {
                    username: 'joshua',
                    password: 'joshua',
                    email:'joshua@gmail.com'
                }
            }
        };
        const response = await axios.post(serverUrl, user);
        console.log(response.data);

    });
});
