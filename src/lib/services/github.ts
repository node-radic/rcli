import { AbstractGitRestClient } from "../git/index";
import { AuthMethod } from "../auth/methods";
import { provide, singleton } from "@radic/console";

export class GithubService extends AbstractGitRestClient {
    getAuthMethods(): Array<AuthMethod> {
        return [ AuthMethod.basic, AuthMethod.token ];
    }


}