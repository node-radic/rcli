import { Cli, command, CommandArguments, CommandConfig, Config, Dispatcher, inject, InputHelper, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../../";
import { ConnectHelper } from "../../helpers/helper.connect";
import { BaseCommand } from "../../core/commands";
import { SemVer, valid } from "semver";
import { bin } from "../../core/static";
const git = bin('git');

@command(`tag
[version/bump-type:string@which version]
[message:string[]@message]`, 'Git tag with bumping', <CommandConfig> {
    onMissingArgument: 'help',
    example          : `{bold}tag by passing the name{/bold}
r git tag 1.2.3
r git tag v1.44.0-alpha.5
r git tag foobar

{bold}tag using version bump. valid bump-types: major, minor, patch, build{/bold}
r git tag 
r git tag minor

{bold}tag using a bump-type as name{/bold}
r git tag minor -n
r git tag minor --no-bump
`
})
export class GitTagCmd extends BaseCommand {
    showHelp: () => void

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper;

    @inject('cli.helpers.connect')
    connect: ConnectHelper

    @inject('r.log')
    log: Log;

    @inject('r.config')
    config: RConfig

    @inject('cli')
    cli: Cli


    @inject('cli.config')
    cliconfig: Config

    @inject('cli.events')
    events: Dispatcher;


    @option('b', 'Use this if you want to tag `bump type` names like "major", "minor", etc')
    noBump: boolean

    @option('p', 'Disable pushing to remote')
    noPush: boolean

    @option('C', 'Disables confirmation question')
    noConfirm: boolean

    @option('c', 'Validate if given tag is valid semver')
    check: boolean

    @option('t', 'Shows all "bump-types" like "major", "minor", etc')
    listTypes: boolean

    @option('d', 'Prevents actual git changes, just shows the results')
    dryRun: boolean

    bumpTypes: string[] = [ 'major', 'premajor', 'minor', 'preminor', 'patch', 'prepatch', 'prerelease' ];

    async handle(args: CommandArguments, ...argv: any[]) {

        if ( ! args.version ) {
            return this.returnError('No version or bump-type specified.')
        }

        if ( this.check ) {
            if ( valid(args.version) ) {
                return this.promiseOk('Validate version success. This is valid a semver string')
            }
            return this.promiseError('Invalid semver version.')
        }

        if ( this.listTypes ) {
            return this.promiseOk('Valid types ::\n - ' + this.bumpTypes.join('\n - '))
        }


        if ( true == this.bumpTypes.includes(args.version) && false === this.noBump ) {
            let tags     = git('describe', { tags: true, abbrev: 0 });
            let lastTag  = tags.split('\n').reverse().filter((val) => val !== '')[ 0 ];
            let version  = new SemVer(lastTag)
            args.version = version.inc(args[ 'bump-type' ]).version;

        }

        return this.tag(args.version, args.message && args.message.length > 0 ? args.message.join(' ') : 'tagged ' + args.version);

    }


    protected async tag(version: string, message: string) {

        if ( await this.ask.confirm(`You are going to tag version ${version} ${this.noPush ? '' : 'and push it to remote. Are you sure'}`) ) {
            if ( ! this.dryRun ) {
                this.log.verbose(git('tag', { a: version, m: message }))
                if ( this.noPush === false ) {
                    this.log.verbose(git('push', { u: `origin` }, version))
                }
            }
            return this.returnOk(`Tagged ${version} ` + this.noPush ? '' : 'and pushed it')
        }
        return this.returnLog('notice', 'You stopped the operation. No changes have been made.')
    }

}
export default GitTagCmd