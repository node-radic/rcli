import * as gulp from "gulp";
import * as fs from "fs-extra";
import * as tsc from "gulp-typescript";
import { join, resolve } from "path";
import { exec, execSync } from "child_process";
import { rm } from "shelljs";
import { tmpdir } from "os";

// import * as npm from 'npm'
// npm.
const c = {
    binFile      : 'bin/r.js',
    src          : [ "src/**/*.ts", "!src/**/*.spec.ts" ],
    fileName     : 'rcli',
    moduleName   : '@radic/rcli',
    umdModuleName: 'radic.rcli'
};

// const binFile = `#!/usr/bin/env node
// import cli from '../spec/groups/fixture/index'
// let parsedRootNode = cli.parse()
// let parsedNode = cli.resolve()
//
// cli.handle(parsedNode);`

const tsProject = {
    lib : tsc.createProject("tsconfig.json", { module: "es2015", declaration: true, typescript: require("typescript") }),
    src : tsc.createProject("tsconfig.json", { typescript: require("typescript") }),
    test: tsc.createProject("tsconfig.json", { typescript: require("typescript") })
};

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
    pump         = require('pump'),
    source       = require("vinyl-source-stream"),
    buffer       = require("vinyl-buffer"),
    sourcemaps   = require("gulp-sourcemaps"),
    uglify       = require("gulp-uglify"),
    rollup       = require('gulp-rollup'),
    rename       = require("gulp-rename"),
    runSequence  = require("run-sequence"),
    istanbul     = require("gulp-istanbul"),
    jasmine      = require("gulp-jasmine"),
    clean        = require('gulp-clean'),
    SpecReporter = require('jasmine-spec-reporter'),
    ghPages      = require("gulp-gh-pages"),
    download     = require('download')
;

gulp.task('clean', [ 'clean:src', 'clean:build' ]);

gulp.task('clean:build', () => gulp.src([ 'dist', 'dts', 'es', 'lib', 'umd', 'coverage', '.publish', 'docs' ]).pipe(clean()));

gulp.task('clean:src', () => gulp.src([ '{src,spec}/*.{js,js.map}', '*.{js,js.map}' ]).pipe(clean()));

gulp.task("build:lib", () => {
    return gulp.src(c.src)
        .pipe(tsProject.lib())
        .on("error", function (err) {
            process.exit(1);
        })
        .pipe(gulp.dest("lib/"))
});

// gulp.task('build:umd', [ 'build:lib' ], (cb) => {
//     pump([
//
//         gulp.src('lib/**/*.js'),
//         rollup({
//             entry     : './lib/index.js',
//             format    : 'umd',
//             moduleName: c.moduleName,
//             globals   : { lodash: '_' }
//         }),
//         gulp.dest('./'),
//         clean(),
//         rename(c.fileName),
//         gulp.dest('./')
//     ], cb)
// });
//
// gulp.task('build:umd:minify', [ 'build:umd' ], (cb) => {
//     pump([
//         gulp.src('./radic.console.js'),
//         uglify(),
//         rename('radic.console.min.js'),
//         gulp.dest('./')
//     ], cb)
// });

gulp.task("build:src", () => {
    return gulp.src([
        "src/**/*.ts"
    ])
        .pipe(tsProject.src())
        .on("error", function (err) {
            process.exit(1);
        })
        .js.pipe(gulp.dest("src/"));
});

gulp.task("build:test", () => {
    return gulp.src([
        "spec/**/*.ts"
    ])
        .pipe(tsProject.test())
        .on("error", function (err) {
            process.exit(1);
        })
        .js.pipe(gulp.dest("spec/"));
});

gulp.task("build", (cb) => {
    runSequence(
        "clean",
        [ "build:src", "build:lib" ],   // tests + build es and lib
        "build:test", cb);
    // , "build:umd", "build:umd:minify"
});

//https://github.com/pmq20/node-compiler
gulp.task('compiler:init', (cb) => {
    if ( fs.existsSync('nodec') ) {
        return cb();
    }
    const { from, archiveFileName, to } = getCompilerData();
    download(from, to, { extract: true }).then(cb);
})


gulp.task('compiler:compile', (cb) => {
    execSync('npm uninstall @radic/console', { stdio: 'inherit' })
    rm('-r', 'node_modules/@radic/console')
    execSync('npm install @radic/console', { stdio: 'inherit' })
    process.stdout.write(require.resolve('@radic/console'))
    execSync(resolve('nodec') + ' ' + c.binFile, { stdio: 'inherit' })
    execSync('npm link @radic/console', { stdio: ['inherit'] })
    cb();
})

gulp.task("test", () => {

    // runSequence("jasmine", cb);
    execSync('npm uninstall @radic/console#latest')
    rm('-r', 'node_modules/@radic/console')
    execSync('npm install @radic/console#latest')
    process.stdout.write(require.resolve('@radic/console'))

    let jasmineJson = join(__dirname, 'jasmine.json');
    let done        = gulp.src(jasmineJson[ 'spec_files' ])
        .pipe(jasmine({
            reporter: new SpecReporter({
                displayStacktrace  : true,
                displaySpecDuration: true
            }),
            config  : jasmineJson
        }))
    execSync('npm link @radic/console')
});

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
