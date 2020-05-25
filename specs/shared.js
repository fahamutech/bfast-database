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
 * @param port
 * @return {Promise<DaaSServer>}
 */
const daas = async (uri, port = 3111) => {
    return new DaaSServer({
        mongoDbUri: uri,
        applicationId: 'daas',
        port: port,
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
exports.serverUrl = 'http://localhost:3111/daas';
exports.mongoServer = mongoServer;
exports.mongoRepSet = mongoMemoryReplSet;
exports.daas = daas;
