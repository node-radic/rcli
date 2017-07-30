import { command, CommandArguments, lazyInject, option } from "@radic/console";
import { BaseCommand } from "../../";
import { ConnectHelper } from "../../helpers/helper.connect";
import { JiraService } from "../../services/service.jira";
import * as _ from "lodash";

@command(`projects`, 'Project manager', {})
export class JiraProjectsCmd extends BaseCommand {

    @option('l', 'list projects')
    list: boolean

    @option('c', 'name of credential to use')
    credential: string

    @lazyInject('cli.helpers.connect')
    protected connect: ConnectHelper;


    async handle(args: CommandArguments, argv: string[]) {
        const jira = await this.connect.getService<JiraService>('jira', this.credential)

        if ( this.list ) {
            let projects = await jira.listProjects()
            this.out.columns(projects.map(project => _.pick(project, [ 'id', 'key', 'name' ])));
            return true;
        }


    }


}
export default JiraProjectsCmd
