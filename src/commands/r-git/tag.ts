import { command, CommandArguments, CommandConfig, Dispatcher, inject, InputHelper, Log, option, OutputHelper } from "@radic/console";
import { RConfig } from "../../";
import { ConnectHelper } from "../../helpers/helper.connect";
import { IGitService } from "../../services/service.git";
import { execSync } from "child_process";
import { BaseCommand } from "../../core/commands";

@command(`tag
{version/bump-type:string@which version}
[message:string[]@message]`, 'Git tag with bumping', <CommandConfig> {
    onMissingArgument: 'help',
    example: `{bold}tag by passing the name{/bold}
r git tag 1.2.3
r git tag v1.44.0-alpha.5
r git tag foobar

{bold}tag using version bump. valid bump-types: major, minor, patch, build{/bold}
r git tag <bump-type>
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

    @inject('cli.events')
    events: Dispatcher;

    @option('n', 'Use this if you want to tag `bump type` names like "major", "minor", etc')
    noBump: boolean

    @option('p', 'Disables pushing')
    noPush: boolean

    bumpTypes :string[]= ['major','minor', 'patch', 'build']

    async handle(args: CommandArguments, ...argv: any[]) {
        this.out.dump({args})

        if(!args.version){
            return this.returnError('No version or bump-type specified.')
        }

        if(false == this.bumpTypes.includes(args.version) || this.noBump){
            let msg = args.message && args.message.length > 0 ? args.message.join(' ') : 'tagged ' + args.version;
            msg = `-m "${msg}"`
            this.log.verbose(execSync(`git tag -a ${args.version} ${msg}`).toString('utf8'))
            if(this.noPush === false) {
                this.log.verbose(execSync(`git push -u origin ${args.version}`).toString())
            }
            return this.returnOk(`Tagged ${args.version} and pushed it`)
        }

        let tags = execSync('git tag').toString();
        let lastTag = process.argv[2] || tags.split('\n').reverse().filter((val) => val !== '')[0];
        let seg = this.config('commands.git.tag.regexp').exec(lastTag);
        if(seg === null) throw new Error('Could not parse last tag')
        let prefixed = seg[2] === undefined // prefixed with "v"
        let suffixed = seg[4] === undefined // suffixed with "-<suffix>.<number>"
        let parts:any = {
            major: prefixed ? seg[1].substr(1) : seg[2],
            minor: prefixed ? seg[3] : seg[3],
            patch: suffixed ? seg[5] : seg[4],
            suffix: seg[6] || null,
            build: seg[7] || null
        }
        let partsNumKeys = Object.keys(parts).filter(key => key !== 'suffix');
        partsNumKeys.forEach(key => parts[key] = parseInt(parts[key]));
        console.dir(parts);
        console.dir({prefixed, suffixed,seg});
        parts[args['bump-type']]++;
        partsNumKeys.slice(partsNumKeys.indexOf(args['bump-type'])+1).forEach(key => parts[key] = 0)
        parts = Object.values(parts);
        let version = [(prefixed ? seg[1][0] : '') + parts[0], parts[1], parts[2]].join('.').concat(suffixed ? '-' + [parts[3], parts[4]].join('.') : '')
        console.log({parts, version});

    }


}
export default GitTagCmd