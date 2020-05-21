const {DaaSServer} = require("../dist/daas");
const {MongoMemoryServer} = require('mongodb-memory-server');
const {MongoMemoryReplSet} = require('mongodb-memory-server');


/**
 *
 * @return {MongoMemoryServer}
 */
const mongoServer = () => {
    return new MongoMemoryServer({
        autoStart: false,
        replSet: {storageEngine: 'wiredTiger'},
    });
}

/**
 *
 * @return {MongoMemoryReplSet | MongoMemoryServer}
 */
const mongoMemoryReplSet = () => {
    return new MongoMemoryReplSet({
        autoStart: false,
        replSet: {
            count: 3,
            storageEngine: "wiredTiger",
        }
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
        port: "3001",
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
exports.serverUrl = 'http://localhost:3001/daas';
exports.mongoServer = mongoServer;
exports.mongoRepSet = mongoMemoryReplSet;
exports.daas = daas;
