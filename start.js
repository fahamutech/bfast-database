// const {exec} = require('child_process')
//
// const cp = exec(`bfast fs serve`, {
//     cwd: __dirname,
//     env: {
//         APPLICATION_ID: "bfast",
//         MASTER_KEY: "bfast",
//         PROJECT_ID: "bfast",
//         MONGO_URL: "mongodb://localhost/bfast",
//         PORT: "3000",
//         LOGS: '1',
//         PRODUCTION: "1",
//         // S3_BUCKET=
//         // export S3_ACCESS_KEY=
//         // export S3_SECRET_KEY=
//         // export S3_ENDPOINT=
//     }
// });
//
// cp.stdout.on("data", chunk => {
//     console.log(chunk.toString());
// })
//
// cp.stderr.on("data", chunk => {
//     console.log(chunk.toString());
// })
//
// cp.on("message", message => {
//     console.log(message.toString());
// })
//
// cp.on("error", err => {
//     console.log(err.toString())
// });
