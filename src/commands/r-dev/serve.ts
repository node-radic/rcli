import { Cli, command, CommandArguments, inject, InputHelper, Log, OutputHelper } from "@radic/console";
import { ChildProcess, fork } from "child_process";
import { paths } from "../../core/paths";

@command('serve', 'start serve')
export class Servecmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    ask: InputHelper

    @inject('cli.log')
    log: Log;
    @inject('cli')
    cli: Cli;

    handle(args: CommandArguments) {
        const isForked = ! ! process.send
        if ( isForked ) return this.handleForked(args);
        let binFilePath = `${paths.bin}/r.js`;
        this.log.info(`forking ${binFilePath}`)
        let proc: ChildProcess = fork(binFilePath, [ 'serve' ], {})

        proc.on('error', function (err) {
            if ( err[ 'code' ] == "ENOENT" ) {
                console.error('\n  %s(1) does not exist, try --help\n', binFilePath);
            } else if ( err[ 'code' ] == "EACCES" ) {
                console.error('\n  %s(1) not executable. try chmod or run with root\n', binFilePath);
            }
            process.exit(1);
        });
        proc.on('message', (m: any) => {
            console.log('GOT SERVER MSG', m, typeof m)
            process.send('ok 2')
        });
        proc.on('close', () => {
            console.log('close');
        });
        // return new Promise((res,rej)=>{
        //
        // })
        // console.log({proc});
    }

    protected handleForked(args: CommandArguments) {
        this.log.info(`handleForked`, process)
        process.on('message', (m: any) => {
            console.log('GOT CLIENT MSG', m, typeof m)
            process.send('ok')
        });

    }
}
export default Servecmd