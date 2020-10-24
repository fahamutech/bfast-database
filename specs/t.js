const {BFastDatabase} = require('../dist/bfastDatabase');

const bfastDatabase = new BFastDatabase();

bfastDatabase.init({
    port: 3003,
    mongoDbUri: 'mongodb://localhost/test',
    masterKey: 'j',
    applicationId: 'j'
}).then(console.log).catch(console.log);
