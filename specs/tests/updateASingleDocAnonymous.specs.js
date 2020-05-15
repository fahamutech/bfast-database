const axios = require('axios');
const {mongoServer, daas, serverUrl} = require('../shared');
const assert = require('assert');
let mongoMemoryServer;
let daaSServer;

describe('Authentication Integration Test', function () {
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

    it('should update a document with an id supplied and without login and any authorization permission set', async function () {
        const createTest = {
            applicationId: 'daas',
            CreateTest: {
                id: 'ethan',
                age: 20,
                year: 2020,
                message: 'hello, world!',
                return: []
            }
        }
        const createResponse = await axios.post(serverUrl, createTest);
        console.log(createResponse.data);
        const updateTest = {
            applicationId: 'daas',
            UpdateTest: {
              id: 'ethan',
                // filter: {
                //     age: 20
                // },
                update: {
                    $set: {age: 30},
                    return: ['age']
                }
            }
        }
        const updateResponse = await axios.post(serverUrl, updateTest);
        console.log(updateResponse.data);
    });
});
