"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var daas_1 = require("./daas");
new daas_1.DaaSServer({
    port: process.env.PORT,
    applicationId: process.env.APPLICATION_ID,
    masterKey: process.env.MASTER_KEY,
    mongoDbUri: process.env.MONGO_URL,
    mountPath: process.env.MOUNT_PATH ? process.env.MOUNT_PATH : '/daas',
}).start()
    .catch(console.log);
