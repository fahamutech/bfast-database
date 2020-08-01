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
 * @return {Promise<DaaSServer>}
 */
const daas = async () => {
    return new DaaSServer();
}

/**
 * @param mongoMemoryServer
 * @param daaSServer
 * @return {Promise<void>}
 */
exports.initiateServer = async (mongoMemoryServer, daaSServer) => {
    mongoMemoryServer = mongoServer();
    await mongoMemoryServer.start();
    daaSServer = await daas();
    await daaSServer.start({
        mongoDbUri: await mongoMemoryServer.getUri(),
        applicationId: 'daas',
        port: 3111,
        adapters: {
            // s3Storage: {
            //     bucket: 'daas',
            //     direct: false,
            //     accessKey: '5IGXSX5CU52C2RFZFALG',
            //     secretKey: '2q2vteO9lQp6LaxT3lGMLdkUF5THdxZWmyWmb1y9',
            //     endPoint: 'https://eu-central-1.linodeobjects.com/'
            // }
        },
        mountPath: '/daas',
        masterKey: 'daas'
    });
}
exports.serverUrl = 'http://localhost:3111/daas';
exports.mongoServer = mongoServer;
exports.mongoRepSet = mongoMemoryReplSet;
exports.daas = daas;
