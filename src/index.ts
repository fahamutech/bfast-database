import {DaaSServer} from "./daas";

new DaaSServer({
    port: process.env.PORT,
    applicationId: process.env.APPLICATION_ID,
    masterKey: process.env.MASTER_KEY,
    mongoDbUri: process.env.MONGO_URL,
    mountPath: process.env.MOUNT_PATH ? process.env.MOUNT_PATH : '/daas',
}).start()
    // .then(_ => console.log('Daas Server Started At Port : 3000'))
    .catch(console.log);
