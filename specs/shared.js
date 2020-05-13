const {DaaSServer} = require("../dist/daas");
const {MongoMemoryServer} = require('mongodb-memory-server');


exports.mongoServer = () => {
    return new MongoMemoryServer({
        autoStart: false,
        replSet: {storageEngine: 'wiredTiger'},
    });
}

/**
 *
 * @param uri {string}
 * @return {Promise<DaaSServer>}
 */
exports.daas = async (uri) => {
    return new DaaSServer({
        mongoDbUri: uri,
        applicationId: 'daas',
        port: "3000",
        mountPath: '/daas',
        masterKey: 'daas'
    });
}
