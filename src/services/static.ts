import { paths } from "../core/paths";
import { Dictionary } from "../interfaces";
export const PKG = require(paths.packageFile);

export const services: Dictionary<string[]> = {
    github   : [ 'token', 'basic' ],
    jira     : [ 'oauth2', 'basic' ],
    bitbucket: [ 'oauth2', 'basic' ]
}
