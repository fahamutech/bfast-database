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

    it('should add a permission policy to a resource url', async function () {
        const authorization = {
            applicationId: 'daas',
            masterKey: 'daas',
            Authorization: {
                rules: {
                    "create.Test": 'console.log(context);return false;',
                    // "create.*": `const auth = context.auth;return auth === true;`,
                }
            },
            // Query_Policy: {
            //     return: []
            // }
        };
        const response = await axios.post(serverUrl, authorization);
        // console.log(JSON.stringify(response.data));
    });

    it('should protect a resource for non authorized request', async function () {
        const authorization = {
            applicationId: 'daas',
            masterKey: 'daas',
            // Authorization: {
            //     rules: {
            //         "create.Test": `const auth = context.auth;return auth === true;`,
            //     }
            // },
            CreateTest: {
                name: 'joshua',
                age: 20,
                return: []
            }
        };
        const response = await axios.post(serverUrl, authorization);
        console.log(response.data);
    });

});
