import { OutputHelper ,command, option ,Config,inject, lazyInject } from "@radic/console";

@command('git {command}', 'Remote git communication', ['repo'], {
    onMissingArgument: 'help'
})
export class GitCmd {
    handle(args: { [name: string]: any }) {

    }
}
export default GitCmd