const axios = require('axios');
const {mongoServer, mongoRepSet, daas, serverUrl} = require('../shared');
const assert = require('assert');
let mongoMemoryServer;
let daaSServer;

// mongodb://fahamuskills:it69ZUHYEWZeUnVNBTSlBiAhIZ3BDEG8@1.mongo.fahamutech.com:27017,2.mongo.fahamutech.com:27017,3.mongo.fahamutech.com:27017/fahamuskills?authSource=admin\u0026replicaSet=mdbRepl

describe('Transaction', function () {
    before(async function () {
        this.timeout(10000);
        mongoMemoryServer = mongoRepSet();
        await mongoMemoryServer.start();
        await mongoMemoryServer.waitUntilRunning();
        daaSServer = await daas(await mongoMemoryServer.getUri());
        await daaSServer.start();
    });
    after(async function () {
        await daaSServer.stop();
        await mongoMemoryServer.stop();
    });

    it('should be able to perform transaction anonymously', async function () {
        const transaction = {
            applicationId: 'daas',
            CreateTest: {
                 id: 'ethan',
                // // age: 20,
                // // // year: 2020,
                // // // message: 'hello, world!',
                // // return: ['createdAt']
            },
            DeleteTest: {
                id: 'ethan'
            },
            Transaction: {
                commit: {
                    CreateTest: {
                        id: 'joshua',
                        age: 16,
                        year: 2020,
                        message: 'hello, josh!',
                        return: []
                    },
                    // CreateLog: {
                    //     id: 'log234',
                    //     age: 23,
                    //     return: ['createdAt']
                    // },
                    // CreatePayment: {
                    //     id: 'pay234',
                    //     amount: 100,
                    //     return: ['createdAt']
                    // },
                    QueryTest: {
                        id: 'joshua',
                        return: ['age']
                    }
                }
            }
        }
        const transactionResponse = await axios.post(serverUrl, transaction);
        console.log(transactionResponse.data);
    });
});
