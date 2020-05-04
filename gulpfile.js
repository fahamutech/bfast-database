const process = require('child_process');
const pkg = require('./package');
const gulp = require('gulp');

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

    pushImage.on('exit', (code, signal) => {
        console.log('push image exit');
        cb();
    });
    handleBuild(pushImage, cb);
}

function pushLatestToDocker(cb) {
    const pushImage = process.exec(`sudo docker push joshuamshana/bfast-ce-daas`);

    pushImage.on('exit', (code, signal) => {
        console.log('push latest image exit');
        cb();
    });
    handleBuild(pushImage, cb);
}

exports.publishContainer = gulp.series(buildDockerImage, pushToDocker, pushLatestToDocker);