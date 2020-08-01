const axios = require('axios');
const {serverUrl} = require('../shared');
const assert = require('assert');

describe('Update document anonymous', function () {
    before(async function () {
    });
    after(async function () {
    });

    it('should update a document with an id supplied and without login and any authorization permission set', async function () {
        const createTest = {
            applicationId: 'daas',
            CreateTest: [
                {
                    id: 'ethan',
                    age: 20,
                    year: 2020,
                    message: 'hello, world!',
                    return: []
                },
                {
                    id: "568576g78ti78",
                    age: 20,
                    year: 2090,
                    message: 'hello, Z!',
                    return: []
                }
            ]
        }
        await axios.post(serverUrl, createTest);
        const updateTest = {
            applicationId: 'daas',
            UpdateTest: {
               // id: 'ethan',
                filter: {
                    age: 20
                },
                update: {
                    $set: {age: 30},
                },
                return: ['updatedAt']
            }
        }
        const updateResponse = await axios.post(serverUrl, updateTest);
        console.log(updateResponse.data);
    });
});
