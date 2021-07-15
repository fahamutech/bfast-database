const { exec } = require('child_process');
const { generate } = require('keypairs');

generate({ kty: 'RSA', modulusLength: 2048 }).then(kp => {
    const cp = exec(`bfast fs serve --port 3010`, {
        cwd: __dirname,
        env: {
            APPLICATION_ID: "bfast",
            MASTER_KEY: "bfast",
            PROJECT_ID: "bfast",
            MONGO_URL: "mongodb://localhost/bfast",
            PORT: "3010",
            LOGS: '1',
            PRODUCTION: "1",
            RSA_KEY: JSON.stringify(kp.private),
            RSA_PUBLIC_KEY: JSON.stringify(kp.public),
            TAARIFA_TOKEN: 'abc'
            // S3_BUCKET: "bfast-cloud",
            // S3_ACCESS_KEY: "",
            // S3_SECRET_KEY: "",
            // S3_ENDPOINT: "https://us-east-1.linodeobjects.com"
        }
    });

    cp.stdout.on("data", chunk => {
        console.log(chunk.toString());
    })

    cp.stderr.on("data", chunk => {
        console.log(chunk.toString());
    })

    cp.on("message", message => {
        console.log(message.toString());
    })

    cp.on("error", err => {
        console.log(err.toString())
    });
    // return kp; 
    return 'App start in dev-mode';
}).then(console.log).catch(console.log);