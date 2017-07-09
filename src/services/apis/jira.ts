import { singleton } from "@radic/console";
import { Credential } from "../../database/Models/Credential";
const JiraApi: any = require('jira').JiraApi;

@singleton('r.api.jira')
export class Jira {
    api: typeof JiraApi

    constructor() {
    }

    getApi(cred?: Credential): typeof JiraApi {
        return this.api = this.api ? this.api : new JiraApi(
            cred.extra.protocol || 'https',
            cred.extra.host,
            cred.extra.port || 443,
            cred.key,
            cred.secret,
            cred.extra.version || '2',
            cred.extra.strict || true
        );
    }
}
export default Jira
//
// jira.findIssue(issueNumber, function(error, issue) {
//     console.log('Status: ' + issue.fields.status.name);
// });