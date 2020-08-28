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

exports.serverUrl = 'http://localhost:3111/';
exports.mongoServer = mongoServer;
exports.mongoRepSet = mongoMemoryReplSet;
exports.daas = daas;
/**
 *
 * @return {Promise<RulesController>}
 */
exports.getRulesController = async function (memoryReplSet) {
    try {
        process.setMaxListeners(0);
        await memoryReplSet.start();
        await memoryReplSet.waitUntilRunning();
        const config = {
            mongoDbUri: await memoryReplSet.getUri(),
            applicationId: 'daas',
            port: 3111,
            adapters: {},
            mountPath: '/',
            masterKey: 'daas'
        }
        return new RulesController(config);
    } catch (e) {
        console.log(e);
    }
}
