import { command, CommandArguments, inject, InputHelper, Log, option, OutputHelper } from "radical-console";
import { PKG } from "../../core/static";
import { Database } from "../../database/Database";

@command('db', 'General information')
export class DBCmd {

    @inject('cli.helpers.output')
    out: OutputHelper;

    @inject('cli.helpers.input')
    in: InputHelper

    @inject('r.log')
    log: Log

    @inject('r.db')
    db: Database




    @option('d', 'lists all dependencies and development dependencies')
    deps: boolean


    async handle(args: CommandArguments) {
        await this.db.migrate.rollback({
            tableName: 'SSHConnections'
        })
        this.log.info('Rolled back')
    }

}
export default DBCmd
