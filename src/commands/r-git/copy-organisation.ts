import { command, CommandArguments, Dispatcher, inject, InputHelper, LoggerInstance, OutputHelper } from 'radical-console';
import { Cache, ConnectHelper, RConfig } from '../../';
import { cd, mkdir } from 'shelljs';
import { execSync } from 'child_process';
import { basename, resolve } from 'path';


@command(`copy-organisation`)
export class AuthoCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('cli.helpers.connect')
    connect: ConnectHelper;

    @inject('r.log')
    log: LoggerInstance;

    @inject('r.config')
    config: RConfig

    @inject('cli.events')
    events: Dispatcher;

    @inject('r.cache')
    cache: Cache;

    async handle(args: CommandArguments, ...argv: any[]) {
        let json = require('/mnt/fat/php/projects/satis/output/include/all$cd522b3f851abdc5b0f3854f2a695a99d6d6ea6a.json')
        let packageNames = Object.keys(json.packages);
        packageNames.forEach( name => this.out.line(name))
        process.exit()
        let urls = packageNames.map(packageName => {
            let pkg     = json.packages[ packageName ]
            let version = Object.keys(pkg)[ 0 ]
            let data    = pkg[ version ]
            return data.source.url.replace('https://', 'git@')
        })

        mkdir('-p', '/mnt/fat/backups/anomaly')
        cd('/mnt/fat/backups/anomaly')
        urls.forEach(url => {
            execSync('git clone ' + url, { stdio: 'inherit', cwd: '/mnt/fat/backups/anomaly' })
            execSync(`
for branch in $(git branch --all | grep '^\\s*remotes' | egrep --invert-match '(:?HEAD|master)$'); do
    git branch --track "\${branch##*/}" "$branch"
done            
            `, {
                stdio: 'inherit',
                cwd  : resolve('/mnt/fat/backups/anomaly', basename(url.replace('.git', '')))
            })
        })

    }


}

export default AuthoCmd