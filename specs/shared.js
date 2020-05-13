const {DaaSServer} = require("../dist/daas");
const {MongoMemoryServer} = require('mongodb-memory-server');


const mongoServer = () => {
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
const daas = async (uri) => {
    return new DaaSServer({
        mongoDbUri: uri,
        applicationId: 'daas',
        port: "3000",
        mountPath: '/daas',
        masterKey: 'daas'
    });
}

exports.initiateServer = async (mongoMemoryServer, daaSServer) => {
    mongoMemoryServer = mongoServer();
    await mongoMemoryServer.start();
    daaSServer = await daas(await mongoMemoryServer.getUri());
    await daaSServer.start();
}
exports.serverUrl = 'http://localhost:3000/daas';
exports.mongoServer = mongoServer;
exports.daas = daas;
