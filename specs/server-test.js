const {mongoServer, daas} = require('./shared');
let mongoMemoryServer;
let daaSServer;

async function run(){
    mongoMemoryServer = mongoServer();
    await mongoMemoryServer.start();
    daaSServer = await daas('mongodb://localhost/smartstock');
    await daaSServer.start();
};

run().catch(console.log);
