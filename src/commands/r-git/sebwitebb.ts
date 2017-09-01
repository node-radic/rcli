import { command, CommandArguments, CommandConfig, Dispatcher, inject, InputHelper, LoggerInstance, option, OutputHelper } from "radical-console";
import { BitbucketService, ConnectHelper ,Cache,RConfig } from "../../";
import { execSync } from "child_process";
import * as globule from "globule";
import { basename, dirname } from "path";

@command(`sebwitebb`)
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

    @option('c', 'clean cache before run')
    cleanCache: boolean

    async handle(args: CommandArguments, ...argv: any[]) {
        this.log.info('init bitbucket service')
        const sleep = async (time: number) => new Promise((res) => setTimeout(() => res(this.log.verbose('waiting ms: ' + time)), time))
        const bb    = await this.connect.getService<BitbucketService>('git', 'bb')
        // bb.createRepository()
        const o     = {
            target: '/mnt/safe/sebwite/repos/**/.git'
        }

        if ( this.cleanCache ) {
            this.cache.unset('sebwitebb');
        }

        let paths = this.cache.get<string[]>('sebwitebb.paths', () => {
            return globule.find(o.target)
        });


        let bbOwner    = 'radic-sebwite'
        let testOrigin = new RegExp('.*' + bbOwner + '.*', 'g')
        let repos      = await bb.listRepositories(bbOwner)

        let runTimes = [];
        let avgTime  = 0;
        this.log.info(`target [${o.target}] :: results ${paths.length}` + (this.cleanCache ? '' : ' (cached)'))
        for ( let i = 0; i < paths.length; i ++ ) {
            let startTime = process.uptime();
            let gitPath   = paths[ i ];
            let repoPath  = dirname(gitPath)
            let bbName    = basename(dirname(repoPath)) + '-' + basename(repoPath)
            let cacheKey  = `sebwitebb.target.${i}:${bbName}`;
            if ( this.cache.get(cacheKey + ':done', false) === true ) {
                continue;
            }
            let steps: any = this.cache.get(cacheKey, () => {return { renameOrigin: false, setOrigin: false, createRepo: false, push: false, pushTags: false }})

            const step = (...name: string[]) => {
                this.log.verbose(`Steps done: ${name.join(', ')}`)
                name.forEach(name => steps[ name ] = true)
                this.cache.set(cacheKey, steps)
            }

            const sh = (cmd: string): string => {
                this.log.verbose(`exec: "${cmd}" in ${repoPath}`)
                return execSync(cmd, { cwd: repoPath, stdio: 'pipe' }).toString('utf-8');
            }

            let origin = sh('git remote -v | grep origin | grep fetch')

            0 === origin.length && step('renameOrigin')
            true === testOrigin.test(origin) && step('renameOrigin', 'setOrigin')

            if ( ! steps.renameOrigin ) {
                origin = origin.replace('origin\t', '').replace(/\s\(fetch\)(?:\n|)/, '').trim()
                sh('git remote rename origin sebwite')
                step('renameOrigin');
            }

            if ( ! steps.setOrigin ) {
                sh(`git remote add origin bitbucket.org:${bbOwner}/${bbName}`);
                step('setOrigin')
            }

            if ( repos.includes(bbOwner + '/' + bbName) ) {
                this.log.verbose('Skipping create repo, already exists')
                step('createRepo')
            }

            if ( ! steps.createRepo ) {
                let createdRepo = false
                try {
                    createdRepo = await bb.createRepository(bbName, bbOwner, true)
                } catch ( e ) {}
                if ( ! createdRepo ) {
                    if ( ! await this.ask.confirm(`create repo [${bbOwner}/${bbName}] failed, continue?`) ) {
                        break;
                    }
                } else {
                    step('createRepo')
                    await sleep(2000);
                }
            }

            if ( ! steps.push ) {
                if ( sh('git branch').split('\n').length > 1 ) {
                    sh('git push origin --all')
                }
                step('push')
            }

            if ( ! steps.pushTags ) {
                if ( sh('git tag').split('\n').length > 1 ) {
                    sh('git push origin --tags')
                }
                step('pushTags')
            }

            runTimes.push(process.uptime() - startTime);
            avgTime = 0;
            runTimes.forEach(time => avgTime += time)
            avgTime = avgTime / runTimes.length;

            this.cache.set(cacheKey + ':done', true)
            let remaining = Math.round((avgTime * (paths.length - i)) / 60)
            this.log.info(`Target ${i}/${paths.length} [${bbName}] done. estimated remaining time: ${remaining}m`)
        }

    }


}

export default AuthoCmd