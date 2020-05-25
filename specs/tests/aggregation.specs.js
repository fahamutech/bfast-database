const axios = require('axios');
const {serverUrl} = require('../shared');
const assert = require('assert');

describe('Aggregation', function () {
    before(async function () {
    });
    after(async function () {
    });

    it('should be able to perform aggregation', async function () {
        const aggregation = {
            applicationId: 'daas',
            masterKey: 'daas',
            CreateTest: [
                {
                    role: 'manager',
                    salary: 20
                },
                {
                    role: 'manager',
                    salary: 26
                },
                {
                    role: 'cashier',
                    salary: 10
                }
            ],
            AggregateTest: [
                {
                    $group: {
                        _id: '$role',
                        salary: {$sum: '$salary'}
                    }
                }
            ]
        }
        const aggregationResponse = await axios.post(serverUrl, aggregation);
        console.log(aggregationResponse.data);
    });
});
