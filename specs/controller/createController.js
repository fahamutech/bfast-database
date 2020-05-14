const axios = require('axios');
const {serverUrl} = require('../shared');
/**
 *
 * @param dataToCreate {[]}
 * @return {Promise<void>}
 */
exports.createMany = async function (dataToCreate) {
    const rule = {
        applicationId: 'daas',
        CreateTest: dataToCreate
    }
    const response = await axios.post(serverUrl, rule);
    return response.data;
}
