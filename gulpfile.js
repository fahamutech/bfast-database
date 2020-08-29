const process = require('child_process');
const pkg = require('./package');
const gulp = require('gulp');
const del = require('del');
const glob = require('glob');

function handleBuild(childProcess, cb) {
    childProcess.on('error', (err) => {
        console.error(err);
        cb();
    });

    childProcess.stdout.on('data', (data) => {
        console.log(data);
    });

    childProcess.stderr.on('data', (data) => {
        console.log(data);
    });
}

function buildDockerImage(cb) {
    const buildImage = process.exec(`sudo docker build -t joshuamshana/bfast-ce-daas:v${pkg.version} .`);
    buildImage.on('exit', (code, signal) => {
        console.log('build image task exit');
        cb();
    });
    handleBuild(buildImage, cb);
}

function buildDockerImageLatest(cb) {
    const buildImage = process.exec(`sudo docker build -t joshuamshana/bfast-ce-daas:latest .`);
    buildImage.on('exit', (code, signal) => {
        console.log('build image task exit');
        cb();
    });
    handleBuild(buildImage, cb);
}

function buildDockerImageBeta(cb) {
    const buildImage = process.exec(`sudo docker build -t joshuamshana/bfast-ce-daas:beta .`);
    buildImage.on('exit', (code, signal) => {
        console.log('build image task exit');
        cb();
    });
    handleBuild(buildImage, cb);
}

function pushToDocker(cb) {
    const pushImage = process.exec(`sudo docker push joshuamshana/bfast-ce-daas:v${pkg.version}`);
    pushImage.on('exit', _ => {
        console.log('push image exit');
        cb();
    });
    handleBuild(pushImage, cb);
}

function pushToDockerLatest(cb) {
    const pushImage = process.exec(`sudo docker push joshuamshana/bfast-ce-daas:latest`);
    pushImage.on('exit', _ => {
        console.log('push image exit');
        cb();
    });
    handleBuild(pushImage, cb);
}

function pushToDockerBeta(cb) {
    const pushImage = process.exec(`sudo docker push joshuamshana/bfast-ce-daas:beta`);
    pushImage.on('exit', _ => {
        console.log('push image exit');
        cb();
    });
    handleBuild(pushImage, cb);
}

function devStart(cb) {
    const {mongoServer, mongoRepSet, daas} = require('./specs/mock.config');
    const {EnvUtil} = require('./dist/utils/env.util');
    let mongoMemoryServer;
    let daaSServer;

    async function run() {
        mongoMemoryServer = mongoRepSet();
        await mongoMemoryServer.start();
        await mongoMemoryServer.waitUntilRunning();
        daaSServer = await daas();
        const file = await new EnvUtil().getEnv(__dirname + '/db.env.txt');
        await daaSServer.start({
            mongoDbUri: file,
            applicationId: 'daas',
            port: 3003,
            adapters: {},
            mountPath: await new EnvUtil().getEnv('/'),
            masterKey: 'daas'
        });
    }

    run().catch(reason => {
        console.log(reason);
        cb();
    });
}

function copyBFastJson(cb) {
    gulp.src('./src/bfast.json').pipe(gulp.dest('./dist/'));
    cb();
}

function compileTs(cb) {
    const compileTs = process.exec('tsc');
    compileTs.on('exit', _ => {
        console.log('compile ts exit');
        cb();
    });
    handleBuild(compileTs, cb);
}

function deleteBuild(cb) {
    del(['dist/**', '!dist'], {force: true});
    cb();
}

function test(cb) {
    const testPath = __dirname + '/specs/rest';
    glob('**/*.js', {absolute: true, cwd: testPath}, (err, files) => {
        if (err) {
            console.error(err);
        }
        files.forEach(file => {
            const result = process.execSync(`npx mocha ${file}`);
            console.log(result.toString());
        });
        cb();
    });
}

exports.test = gulp.series(test);
exports.build = gulp.series(deleteBuild, compileTs, copyBFastJson);
exports.devStart = gulp.series(deleteBuild, compileTs, copyBFastJson, devStart);
exports.buildDocker = gulp.series(deleteBuild, compileTs, copyBFastJson, buildDockerImage);
exports.publishContainer = gulp.series(deleteBuild, compileTs, copyBFastJson, buildDockerImage, pushToDocker);
exports.publishContainerLatest = gulp.series(deleteBuild, compileTs, copyBFastJson, buildDockerImageLatest, pushToDockerLatest);
exports.publishContainerBeta = gulp.series(deleteBuild, compileTs, copyBFastJson, buildDockerImageBeta, pushToDockerBeta);
