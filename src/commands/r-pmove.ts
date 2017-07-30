import { command, CommandArguments, CommandConfig, Dispatcher, lazyInject, Log } from "@radic/console";
import { BaseCommand, RConfig } from "../";
import { basename, join, resolve } from "path";
import * as globule from "globule";
import { renameSync, existsSync, mkdirpSync, moveSync } from "fs-extra";

@command(`pmove
{from:string@path to directory}
{to:string@path to directory}`, <CommandConfig> {})
export class PMoveCmd extends BaseCommand {

    @lazyInject('cli.events')
    protected events: Dispatcher;


    async handle(args: CommandArguments, argv?: string[]) {
        let from = resolve(args.from)
        let to   = resolve(args.to)
        if ( ! existsSync(from) ) {
            return this.returnError(`argument [from] should be a valid path.`, from)
        }
        let extensions = this.config.get<string[]>('commands.pmove.extensions', []);
        from = join(from, `**/*.{${extensions.join(',')}}`);
        let files = globule.find(from);

        this.log.verbose(`Found ${files.length} files`, files);
        if(await this.ask.confirm(`Are you sure you want to move ${files.length} files to: ${to}`)) {
            if ( ! existsSync(to) ) {
                mkdirpSync(to);
            }
            files.forEach(filePath => {
                let newFilePath = join(to, basename(filePath))
                renameSync(filePath, newFilePath);
                this.log.verbose('Moved file', { filePath, newFilePath })
            })
            return this.returnInfo(`Moved ${files.length} files to: ${to}`)
        }
    }
}
export default PMoveCmd