import { OutputHelper ,command, option ,Config,inject, lazyInject } from "radical-console";

@command('git|2 {command}', 'Remote git communication', {
    isGroup: true,
})
export class GitCmd {
    handle(args: { [name: string]: any }) {

    }
}
export default GitCmd