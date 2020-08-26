const {BFastDatabase} = require('../../dist/bfastDatabase')

new BFastDatabase().start({
    applicationId: 'daas',
    masterKey: 'daas',
    mongoDbUri: 'mongodb://localhost:27017/daas',
    port: '5000',
    mountPath: '/',
    adapters: {}
}).catch(console.log);
