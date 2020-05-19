const process = require('child_process');
const pkg = require('./package');
const gulp = require('gulp');
const del = require('del');

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

function pushToDocker(cb) {
    const pushImage = process.exec(`sudo docker push joshuamshana/bfast-ce-daas:v${pkg.version}`);
    pushImage.on('exit', _ => {
        console.log('push image exit');
        cb();
    });
    handleBuild(pushImage, cb);
}

function devStart(cb) {
    const devStart = process.exec('node .', {
        env: {
            PORT: '3000',
            APPLICATION_ID: 'daas',
            MONGO_URL: 'mongodb://localhost:27017/daas',
            MASTER_KEY: 'daas'
        }
    });
    devStart.on('exit', _ => {
        cb();
    });
    handleBuild(devStart, cb);
}

function copyBFastJson(cb) {
    gulp.src('./src/utils/bfast.json').pipe(gulp.dest('./dist/utils'));
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
    del(['dist/**','!dist'], {force:true});
    cb();
}

exports.build = gulp.series(deleteBuild, compileTs, copyBFastJson);
exports.devStart = gulp.series(deleteBuild, compileTs, copyBFastJson,devStart);
exports.publishContainer = gulp.series(buildDockerImage, pushToDocker);
