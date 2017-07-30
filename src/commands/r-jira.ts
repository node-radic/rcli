import Axios from "axios";
import { command, CommandArguments, inject, InputHelper, Log, OutputHelper } from "@radic/console";
import { Credential } from "../database/Models/Credential";
import { fileSync } from "tmp";
import { readFile, readFileSync, writeFileSync } from "fs";

@command('jira {command}', 'remote jira communication', {
    isGroup: true
})
export class JiraCmd {

    handle(args: CommandArguments) {

    }

}
export default JiraCmd
