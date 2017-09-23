import { paths } from "./paths";
import * as _ from "lodash";
import { execSync, ExecSyncOptionsWithStringEncoding } from "child_process";

export const PKG = () => require(paths.packageFile);

export const MILISECOND = 1
export const SECOND     = MILISECOND * 1000
export const MINUTE     = SECOND * 60
export const HOUR       = MINUTE * 60
export const DAY        = HOUR * 24
export const WEEK       = DAY * 7
export const MONTH      = WEEK * 4
export const YEAR       = MONTH * 12

export function createExecString(cmd: string, args: any[]) {
    _.forEach(args, function (arg, i) {
        if ( typeof arg === 'string' ) {
            arg = arg.includes(' ') ? JSON.stringify(arg) : arg;
            cmd += ' ' + arg;
        } else if ( typeof arg === 'number' ) {
            cmd += ' ' + arg;
        } else if ( typeof arg === 'object' ) {
            _.forEach(arg, function (opt, optk) {
                var dashes = '--'; // --orphan
                if ( optk['length'] === 1 ) {  // -m
                    dashes = '-';
                }
                if ( typeof opt === 'boolean' ) {
                    cmd += ' ' + dashes + optk;
                } else {
                    cmd += ' ' + dashes + optk + (dashes.length === 2 ? '=' : ' ') + JSON.stringify(opt);
                }
            });
        }
    });
    return cmd;
}

export function bin(cmd, options?: ExecSyncOptionsWithStringEncoding): (...args: any[]) => string {
    return (...args: any[]): any => {
        options = options || { encoding: 'utf8' }
        let cm  = createExecString(cmd, args);
        return execSync(cm, <ExecSyncOptionsWithStringEncoding> _.merge({
            encoding: 'utf8'
        }, options));
    }
}

/**
 *
 * @link https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
 formatBytes(1000);       // 1 KB
 formatBytes('1000');     // 1 KB
 formatBytes(1234);       // 1.23 KB
 formatBytes(1234, 3);    // 1.234 KB

 * @param {number} bytes
 * @param decimals
 * @returns {any}
 */
export function formatBytes(bytes: number, decimals?: number) {
    if ( bytes == 0 ) return '0 Bytes';
    var k     = 1000,
        dm    = decimals || 2,
        sizes = [ 'Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ],
        i     = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[ i ];
}

export async function folderSize(path:string):Promise<number> {
    return <any> new Promise((res, rej) => {
        require('get-folder-size')(path, (err:string, size:number) => {
            if(err) return rej(err);
            res(size);
        })
    })
}