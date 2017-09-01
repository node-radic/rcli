import * as gulp from "gulp";
import { WatchOptions } from "gulp";
import * as fs from "fs-extra";
import * as tsc from "gulp-typescript";
import * as ts from "typescript";

import { join, resolve } from "path";
import { execSync } from "child_process";
import { cp, mkdir, rm } from "shelljs";
import { tmpdir } from "os";
import { dir } from "tmp";

// import * as npm from 'npm'
// npm.
const c = {
    binFile  : 'bin/r.js',
    src      : [ "src/**/*.ts", "!src/**/*.spec.ts" ],
    fileName : 'rcli',
    watchOpts: <WatchOptions>{ debounceDelay: 3000, interval: 3000 }
};

// const binFile = `#!/usr/bin/env node
// import cli from '../spec/groups/fixture/index'
// let parsedRootNode = cli.parse()
// let parsedNode = cli.resolve()
//
// cli.handle(parsedNode);`

const isPlatform: (name: string) => boolean = (name: string) => process.platform === name

function getCompilerData(): { from: string, archiveFileName: string, to: string, output: string } {

    let from            = 'http://enclose.io/nodec/nodec-x64.zip',
        archiveFileName = 'nodec-x64.zip',
        output          = 'r.exe',
        to;

    if ( isPlatform('linux') ) {
        from            = 'http://enclose.io/nodec/nodec-linux-x64.gz'
        output          = 'r'
        archiveFileName = 'nodec-linux-x64.gz';
    } else if ( isPlatform('darwin') ) {
        from            = 'http://enclose.io/nodec/nodec-darwin-x64.gz'
        output          = 'r'
        archiveFileName = 'nodec-darwin-x64.gz';
    }

    to = join(tmpdir(), archiveFileName);

    return { from, archiveFileName, to, output }
}

const
    pump        = require('pump'),
    source      = require("vinyl-source-stream"),
    buffer      = require("vinyl-buffer"),
    sourcemaps  = require("gulp-sourcemaps"),
    uglify      = require("gulp-uglify"),
    rollup      = require('gulp-rollup'),
    rename      = require("gulp-rename"),
    runSequence = require("run-sequence"),
    clean       = require('gulp-clean'),
    ghPages     = require("gulp-gh-pages"),
    download    = require('download')
;

const tsProject = {
    es  : tsc.createProject("tsconfig.json", { module: "es2015", declaration: false, typescript: ts }),
    src : tsc.createProject("tsconfig.json", { typescript: ts, sourceMap: true }),
    lib : tsc.createProject("tsconfig.json", { typescript: ts, declaration: false, target: 'es5' }),
    dts : tsc.createProject("tsconfig.json", { typescript: ts, declaration: true, target: 'es5' }),
    test: tsc.createProject("tsconfig.json", { target: "es6", sourceMap: true, typescript: ts })
};


gulp.task('clean', [ 'clean:src:js', 'clean:build' ]);
gulp.task('clean:build', (cb) => pump([ gulp.src([ 'lib', 'lib-es6', 'dts', 'coverage', '.publish', 'docs' ]), clean() ]));
gulp.task('clean:watch', (cb) => pump([ gulp.src([ 'lib', 'dts' ]), clean() ]));

gulp.task('clean:src:js', (cb) => pump([ gulp.src([ '{src,spec}/**/*.{js,js.map}', '*.{js,js.map}' ]), clean() ]));
gulp.task('clean:test:js', (cb) => pump([ gulp.src([ '{tests}/*.{js,js.map}', '*.{js,js.map}' ]), clean() ]));

gulp.task('clean:dts:js', (cb) => pump([ gulp.src([ 'dts/**/*.js' ]), clean() ]))


gulp.task("build:lib:es6", (cb) => pump([
    gulp.src(c.src),
    tsProject.es(),
    gulp.dest("lib-es6/")
]))

gulp.task("build:dts:ts", (cb) => pump([
    gulp.src(c.src),
    tsProject.dts(),
    gulp.dest('dts/')
]))

gulp.task('build:lib', (cb) => pump([
    gulp.src(c.src),
    tsProject.lib(),
    gulp.dest("lib/")
]))

gulp.task('build:src', (cb) => pump([
    gulp.src(c.src),
    tsProject.src(),
    gulp.dest("src/")
]))

gulp.task("build:test", (cb) => pump([
    gulp.src([ "tests/**/*.ts" ]),
    tsProject.test(),
    gulp.dest("tests/")
]))

gulp.task('build:dts', (cb) => runSequence('build:dts:ts', 'clean:dts:js'))

gulp.task("build", (cb) => runSequence(
    "clean",
    [ "build:src", "build:lib", 'build:lib:es6', 'build:dts' ],
    "build:test", cb
));

gulp.task("build:watch", (cb) => runSequence(
    "clean:watch",
    [ 'build:lib', 'build:dts' ],
    cb
));

gulp.task('watch:dev', () => { gulp.watch(c.src, c.watchOpts, [ 'build:watch' ]) })
gulp.task('watch:console', () => { gulp.watch('node_modules/radical-console/lib/**/*.js', c.watchOpts, [ 'build:watch' ]) })
gulp.task('watch', (cb) => runSequence([ 'watch:dev', 'watch:console' ], cb))

//https://github.com/pmq20/node-compiler
gulp.task('compiler:init', (cb) => {
    if ( fs.existsSync('nodec') ) {
        return cb();
    }
    const { from, archiveFileName, to } = getCompilerData();
    download(from, to, { extract: true }).then(cb);
})


gulp.task('compiler:compile', (cb) => {
    // if(true == true) return cb(); // need to compile in another folder. this is a CI job really..

    const sh = (cmd) => {
        console.log(cmd);
        execSync(cmd, { stdio: 'inherit' })
    }

    dir((err: any, path: string, cleanupCallback: () => void) => {
        try {
            let projectPath = process.cwd()
            process.chdir(path);
            sh('git clone ' + projectPath + ' console')
            process.chdir(path + '/console');
            let clonePath = process.cwd()
            sh('yarn add radical-console@file:/home/radic/node/radical-console')
            sh('yarn install --production --ignore-scripts')
            cp('-r', join(projectPath, 'lib'), clonePath)
            rm('-rf', 'bin')
            mkdir('bin')
            cp(join(projectPath, 'bin', 'r-dist.js'), join(clonePath, 'bin', 'r.js'))
            sh('nodec bin/r.js')
            cp('a.out', join(projectPath, 'r'))
            cleanupCallback();
            cb();
        } catch(e){
            console.log('error!')
            console.error(e);
            cleanupCallback();
        }

    })
// execSync('npm uninstall radical-console', { stdio: 'inherit' })
// rm('-r', 'node_modules/radical-console')
// execSync('npm install radical-console', { stdio: 'inherit' })
// process.stdout.write(require.resolve('radical-console'))
// execSync(resolve('nodec') + ' ' + c.binFile, { stdio: 'inherit' })
// execSync('npm link radical-console', { stdio: [ 'inherit' ] })
})

gulp.task("default", (cb) => {
    runSequence(
        "build",
        cb);
});

gulp.task('ghpages', () => {
    return gulp.src('./docs/**/*')
        .pipe(ghPages());
});

// gulp.task('create-bin', (cb) => {
//     fs.ensureDirSync(resolve(__dirname, 'bin'));
//     fs.writeFile(resolve(__dirname, 'bin', 'rcli.ts'), binFile, { encoding: 'utf-8' }, (err: NodeJS.ErrnoException) => {
//         if ( err ) throw err;
//         cb();
//     })
// })
// Run test once and exit
// gulp.task('karma', function (done) {
// new Server({
//     configFile: __dirname + '/karma.conf.js',
//     singleRun : true
// }, done).start();
// });
