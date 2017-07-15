import { join as j, resolve as r } from "path";
import * as _ from "lodash";
import { existsSync, statSync } from "fs";
import { container } from "@radic/console";
import { chmod, mkdir } from "shelljs";
import { PersistentFileConfig } from "./config";
let root = j(__dirname, '..', '..'),
    home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE,
    cwd  = process.cwd()

export interface Paths {
    root: string
    prefix: string
    home: string
    cwd: string
    env: string
    bin: string
    src: string
    packageFile: string
    tsconfig: string
    tsd: string
    user: string
    logFile: string
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
        if ( existsSync(dir) ) {
            mkdir('-p', dir)
            chmod(755, dir)
        }
    })
    let homeStats = statSync(paths.prefix);
}


export let paths: Paths;
export function setPaths(overrides: any = {}, _root: string = null, _prefix: string = null, directory: string = '.rcli'): Paths {
    let prefix = home;
    if ( _root ) root = _root
    if ( _prefix ) prefix = _prefix

    paths = <Paths> {
        root, prefix, home, cwd,
        env              : j(cwd, '.env'),
        bin              : j(root, 'bin'),
        src              : j(root, 'src'),
        packageFile      : j(root, 'package.json'),
        tsconfig         : j(root, 'tsconfig.json'),
        tsd              : j(root, 'tsd.json'),
        // user             : prefix,
        logFile          : j(prefix, directory, 'events.log'),
        rcFile           : j(prefix, '.rclirc'),
        userData         : j(prefix, directory),
        userCache        : j(prefix, directory, 'r.cache'),
        userDatabase     : j(prefix, directory, 'r.db'),
        userDataConfig   : j(prefix, directory, 'r.conf'),
        userSecretKeyFile: j(prefix, directory, 'secret.key'),
        userPublicKeyFile: j(prefix, directory, 'public.key'),
        backups          : j(prefix, directory, 'backups'),
        dbBackups        : j(prefix, directory, 'backups', 'db')
    };
    _.merge(paths, overrides)
    if ( container.isBound('r.paths') ) {
        container.unbind('r.paths')
    }
    container.bind('r.paths').toConstantValue(paths);
    setPermissions(paths)

    return paths
}
setPaths();
