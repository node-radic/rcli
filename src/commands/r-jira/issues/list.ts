import { command, CommandArguments, option } from "radical-console";
import { BaseServiceCommand } from "../../../core/commands";
import { JiraService } from "../../../services/service.jira";

@command(`list
[name:string="asdfrr"@the string for this]
[projects:string[]=["asdf","ffd"]@project key or keys]
[num:number=123@single number]
[nums:number[]=[123,321]@array of numbers]
[bool:boolean=true@signle boolean]
[bools:boolean[]=[true,false,true]@array of booleans]`, 'List issues', {

})
export class JiraIssuesListCmd extends BaseServiceCommand {
    @option('c', 'name of credential to use')
    credential:string

    async handle(args:CommandArguments, argv:string[]){
        this.out.dump(args);
        const jira = await this.connect.getService<JiraService>('jira', this.credential)
        // jira.listIssues();
    }
}
export default JiraIssuesListCmd