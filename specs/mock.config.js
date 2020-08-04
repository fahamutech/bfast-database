const {BFastDatabase} = require("../dist/bfastDatabase");
const {MongoMemoryServer} = require('mongodb-memory-server');
const {MongoMemoryReplSet} = require('mongodb-memory-server');
const {RulesController} = require('../dist/controllers/RulesController');

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
 * @return {Promise<BFastDatabase>}
 */
const daas = async () => {
    return new BFastDatabase();
}

exports.serverUrl = 'http://localhost:3111/daas';
exports.mongoServer = mongoServer;
exports.mongoRepSet = mongoMemoryReplSet;
exports.daas = daas;
/**
 *
 * @return {Promise<RulesController>}
 */
exports.getRulesController = async function (memoryReplSet) {
    try {
        await memoryReplSet.start();
        await memoryReplSet.waitUntilRunning();
        const config = {
            mongoDbUri: await memoryReplSet.getUri(),
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
        }
        return new RulesController(config);
    } catch (e) {
        console.log(e);
    }
}
