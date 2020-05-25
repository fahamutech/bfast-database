const axios = require('axios');
const {serverUrl} = require('../shared');
const assert = require('assert');
const {
    before,
    after,
    it,
    describe
} = require('mocha');

describe('Authorization', function () {
    before(async function () {
    });
    after(async function () {
    });

    describe('Add Authorization Policy', function () {
        it('should add a permission policy to a resource url', async function () {
            const authorization = {
                applicationId: 'daas',
                masterKey: 'daas',
                Authorization: {
                    rules: {
                        "create.Test": `const auth = context.auth;const uid = context.uid;return auth === true;`,
                    }
                }
            };
            const response = await axios.post(serverUrl, authorization);
            console.log(response.data);
        });
    });

    describe('Non Authorized Request', function () {
        it('should protect create a resource for non authorized request', async function () {
            const authorization = {
                applicationId: 'daas',
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

    describe('Authorized request', function () {
        it('should allow create a resource for authorized request', async function () {
            const authorizationRule = {
                applicationId: 'daas',
                masterKey: 'daas',
                Authorization: {
                    rules: {
                        "create.Test": `const auth = context.auth;const uid = context.uid;return auth === true;`,
                    }
                }
            };
            await axios.post(serverUrl, authorizationRule);
            const authentication = {
                applicationId: 'daas',
                Authentication: {
                    signUp: {
                        username: 'joshua',
                        password: 'joshua',
                        email: 'mama27j@gmail.com'
                    }
                }
            }
            const authResponse = await axios.post(serverUrl, authentication);
            const token = authResponse.data['ResultOfAuthentication']['signUp'].token;
            const authorization = {
                applicationId: 'daas',
                token: token,
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

});
