import { command, CommandArguments, CommandConfig, Dispatcher, inject, InputHelper, LoggerInstance, option, OutputHelper } from "radical-console";
import { RConfig } from "../core/config";
import * as globule from "globule";
import { basename, dirname, join, resolve, sep } from "path";
import { Cache } from "../core/cache";
import { statSync } from "fs";
import * as moment from "moment";
import { folderSize, formatBytes } from "../core/static";
import { rm } from "shelljs";
import { kindOf } from "@radic/util";
import * as async from "async";

@command(`rm-packages 
[action:string@list|details|remove] 
[paths:string[]@target paths (defaults to cwd)]`, {
    description: 'Remove package manager library folders recursive',
    example    : `
{green}\${/green} r rm-packages -nj
{green}\${/green} r rm-packages --node --jspm
{green}\${/green} r rm-packages -c some-folder-name,some-folder2-name2
{green}\${/green} r rm-packages --custom some-folder-name,some-folder2-name2        
`
})
export class AuthoCmd {


    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('r.log')
    log: LoggerInstance;

    @inject('r.config')
    config: RConfig

    @inject('cli.events')
    events: Dispatcher;

    @inject('r.cache')
    cache: Cache;

    @option('d', 'max directory depth to look into')
    maxDepth: number = 2

    @option('n', 'include node_modules')
    node: boolean

    @option('j', 'include jspm_packages')
    jspm: boolean

    @option('b', 'include bower_components')
    bower: boolean

    @option('c', 'include vendor (composer) ')
    composer: boolean

    @option('a', 'include all folder options (same as -njbc)')
    all: boolean

    @option('C', 'include custom named folder(s) (comma-seperated)')
    custom: string

    protected actions = [ 'list', 'details', 'remove' ]

    validate(args: CommandArguments) {
        // format / resolve paths
        if ( args[ 'paths' ].length === 0 ) args[ 'paths' ] = [ process.cwd() ]
        args[ 'paths' ] = args[ 'paths' ].map(path => resolve(path))

        if ( this.all ) {
            this.node = this.jspm = this.bower = this.composer = true;
        }

        return args;
    }

    async handle(args: CommandArguments, ...argv: any[]) {
        // this.out.dump(args)

        // resolve action
        if ( ! args[ 'action' ] || ! this.actions.includes(args[ 'action' ].toString()) ) {
            args[ 'action' ] = await this.ask.list(`action?`, this.actions);
        }

        let packageFolders = []

        if ( this.node ) packageFolders.push('node_modules')
        if ( this.jspm ) packageFolders.push('jspm_packages')
        if ( this.bower ) packageFolders.push('bower_components')
        if ( this.composer ) packageFolders.push('vendor')
        if ( this.custom ) packageFolders.concat(this.custom.split(','))

        if ( packageFolders.length === 0 ) {
            return this.log.error('You need to define at least 1 folder type.')
        }

        let findPaths = [];
        args[ 'paths' ].forEach(target => {
            for ( let currentDepth = 0; currentDepth < this.maxDepth; currentDepth ++ ) {
                findPaths.push(join(target, ('*' + sep).repeat(currentDepth + 1), `{${packageFolders.join(',')}}`))
            }
        });

        this.log.debug('maxDepth', this.maxDepth)
        this.log.debug('findPaths', findPaths)
        let spinner = this.out.spinner('Finding all package directories').start()
        let paths   = globule.find(findPaths)
        spinner.stop();

        this.log.debug(`in [${args[ 'paths' ].join(', ')}] :: found ${paths.length} package directories`)
        if ( paths.length === 0 ) {
            return this.log.warn('Nothing found')
        }

        if ( args[ 'action' ] === 'list' ) {
            return paths.forEach(path => this.out.line('- ' + path))
        } else if ( args[ 'action' ] === 'details' ) {
            moment.locale('en-gb')
            let tbl       = this.out.table([ 'path', 'size', 'created', 'modified' ])
            let spinner   = this.out.spinner(`Generating 0/${paths.length}`).start()

            let totalSize = await new Promise((res, rej) => {
                let totalSize = 0;
                let i = 0
                async.forEach(paths, (path, cb) => {
                    i++;
                    let stats = statSync(path)
                    if ( this.cache.get('rmnm.' + path + '.modified', () => stats.mtime.toISOString()) !== stats.mtime.toISOString() ) {
                        this.cache.unset('rmnm.' + path + '.size');
                    }
                    if ( ! this.cache.has('rmnm.' + path + '.size') ) {
                        folderSize(path).then(size => {
                            this.cache.set('rmnm.' + path + '.size', size)
                            totalSize+=size
                            spinner.text=`Generating ${i}/${paths.length} : ${formatBytes(totalSize)}`
                            cb()
                        })
                    } else {
                        totalSize += this.cache.get<number>('rmnm.' + path + '.size')
                        spinner.text=`Generating ${i}/${paths.length} : ${formatBytes(totalSize)}`
                        cb()
                    }
                }, (err) => {
                    if(err) return rej(err)
                    res(totalSize)
                })
            })

            await Promise.all(paths.map(async (path, i) => {
                let stats = statSync(path)
                let size  = this.cache.get<number>('rmnm.' + path + '.size')
                tbl.push([
                    path,
                    stats.isSymbolicLink() ? 'link' : formatBytes(size),
                    moment(stats.ctime).format('L'),
                    moment(stats.mtime).format('L'),

                ])
                return Promise.resolve()
            }))
            spinner.stop()
            return this.out.line(tbl.toString()).line('Total size: ' + formatBytes(parseInt(<any> totalSize)));
        } else if ( args[ 'action' ] === 'remove' ) {
            let spinner = this.out.spinner().start()
            paths.forEach((path, i) => {
                rm('-rf', path);
                spinner.text = `Removing (${i}/${paths.length}) ${path}`
                this.log.verbose('Removed ' + path)
            })
            spinner.succeed(`Removed ${paths.length} folders`);
            this.log.verbose('Removed ' + paths.length + ' folders')
        }

    }


}

export default AuthoCmd