const {mongoRepSet, daas} = require('../shared');
let mongoMemoryServer;
let daaSServer;
const glob = require('glob');

describe('All Test', function () {
    before(async function () {
        this.timeout(100000000);
        try{
            mongoMemoryServer = mongoRepSet();
            await mongoMemoryServer.start();
            await mongoMemoryServer.waitUntilRunning();
            daaSServer = await daas(await mongoMemoryServer.getUri());
            await daaSServer.start();
        }catch (e) {
            console.log(e);
        }
    });
    after(async function () {
        await daaSServer.stop();
        await mongoMemoryServer.stop();
    });

    const testPath = __dirname
    const files = glob.sync('**/*.js', {absolute: true, cwd: testPath, ignore: ['**/all.specs.js']});
    files.forEach(file => {
        require(file);
    });
});
