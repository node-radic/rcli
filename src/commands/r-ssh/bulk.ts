import { command, CommandArguments, InputHelper, lazyInject, Log, option, OutputHelper } from "@radic/console";
import { RConfig, SshBashHelper } from "../..";
import { existsSync } from "fs";
import { readJSONSync } from "fs-extra";
import * as _ from "lodash";

export interface ConnectBulkArguments extends CommandArguments {
    import: string
}
@command(`bulk [import:string@import json]`, 'SSH bulk operations')
export class RcliConnectBulkCmd {

    @lazyInject('cli.helpers.output')
    out: OutputHelper;

    @lazyInject('cli.helpers.input')
    ask: InputHelper;

    @lazyInject('r.log')
    log: Log;

    @lazyInject('r.config')
    config: RConfig

    @lazyInject('cli.helpers.ssh.bash')
    ssh: SshBashHelper

    @option('b', 'Create a simple in-db backup on another table')
    backup: boolean

    @option('r', 'Restore a earlier simple in-db backup')
    restore: boolean

    @option('s', 'seed connections')
    seed: boolean

    @option('c', 'clean all connections')
    clear: boolean

    @option('i', 'interactive')
    interactive: boolean

    handle(args: ConnectBulkArguments , ...argv: any[]) {
        if ( args.import ) {
            return this.ssh.runImport(args.import)
        }
        if ( this.interactive ) {
            return this.interact();
        }
        if ( this.backup ) this.ssh.simpleBackup();
        if ( this.restore ) this.ssh.simpleRestore()
        if ( this.seed ) this.ssh.runSeeder()
        if ( this.clear ) this.ssh.runCleaner();

        this.log.info('All done')
    }


    async interact() {
        this.out.line('Bulk will do a bunch of things. Check out the list, pick the one you like, then lets do it')
        let choice = await
            this.ask.list('Pick one or cancel it', [
                'simple-backup',
                'simple-restore',
                'seed',
                'clean',
                'nevermind'
            ])

        switch ( choice ) {
            case 'simple-backup':
                this.ssh.simpleBackup();
            case 'simple-restore':
                this.ssh.simpleRestore();
        }
        console.log(choice);

    }

}
export default RcliConnectBulkCmd