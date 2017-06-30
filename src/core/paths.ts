import { join as j, resolve as r } from "path";
import * as _ from "lodash";
import { readJSONSync } from "fs-extra";
import { existsSync, statSync } from "fs";
import { container } from "@radic/console";
import { chmod, mkdir } from "shelljs";
let root = j(__dirname, '..', '..'),
    home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
    cwd  = process.cwd()

export interface Paths {
    root: string
    home: string
    cwd: string
    env: string
    bin: string
    src: string
    packageFile: string
    tsconfig: string
    tsd: string
    user: string
    logFile:string
    rcFile: string
    userData: string
    userCache: string
    userDatabase: string
    userDataConfig: string
    userSecretKeyFile: string
    userPublicKeyFile: string
    backups: string
    dbBackups: string
}


export function setPermissions(paths) {

    [ paths.userDataConversion, paths.dbBackups ].forEach(dir => {
        if(existsSync(dir)) {
            mkdir('-p', dir)
            chmod(755, dir)
        }
    })
    let homeStats = statSync(paths.home);
}


export let paths: Paths;
export function setPaths(overrides: any = {}, _root: string = null, _home: string = null, r: string = '.rcli'): Paths {

    if ( _root ) root = _root
    if ( _home ) home = _home

    paths = <Paths> {
        root, home, cwd,
        env              : j(cwd, '.env'),
        bin              : j(root, 'bin'),
        src              : j(root, 'src'),
        packageFile      : j(root, 'package.json'),
        tsconfig         : j(root, 'tsconfig.json'),
        tsd              : j(root, 'tsd.json'),
        user             : home,
        logFile          : j(home, r, 'events.log'),
        rcFile           : j(home, '.rclirc'),
        userData         : j(home, r),
        userCache        : j(home, r, 'r.cache'),
        userDatabase     : j(home, r, 'r.db'),
        userDataConfig   : j(home, r, 'r.conf'),
        userSecretKeyFile: j(home, r, 'secret.key'),
        userPublicKeyFile: j(home, r, 'public.key'),
        backups          : j(home, r, 'backups'),
        dbBackups        : j(home, r, 'backups', 'db')
    };
    _.merge(paths, overrides)
    if ( container.isBound('paths') ) {
        container.unbind('paths')
    }
    container.bind('r.paths').toConstantValue(paths);
    setPermissions(paths)

    return paths
}

setPaths();


if ( existsSync(paths.rcFile) ) {
    const rcli = readJSONSync(paths.rcFile)
    if ( rcli.location ) {
        setPaths({}, null, null, rcli.location);
    }
}