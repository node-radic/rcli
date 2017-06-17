import { paths } from "./paths";
export const PKG = require(paths.packageFile);

export const services = {
    github   : [ 'token', 'basic' ],
    jira     : [ 'oauth2', 'basic' ],
    bitbucket: [ 'oauth2', 'basic' ]
}