const axios = require('axios');
const {mongoServer, daas, serverUrl} = require('../shared');
const assert = require('assert');
let mongoMemoryServer;
let daaSServer;

describe('Aggregation', function () {
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

    it('should be able to perform aggregation', async function () {
        const aggregation = {
            applicationId: 'daas',
            masterKey: 'daas',
            CreateTest: [
                {
                    role:'manager',
                    salary:20
                },
                {
                    role:'manager',
                    salary:26
                },
                {
                    role:'cashier',
                    salary:10
                }
            ],
            AggregateTest: [
                {
                    $group: {
                        _id: '$role',
                        salary: {$sum:'$salary'}
                    }
                }
            ]
        }
        const aggregationResponse = await axios.post(serverUrl, aggregation);
        console.log(aggregationResponse.data);
    });
});
