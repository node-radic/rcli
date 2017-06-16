import { AbstractGitRestClient, AuthMethod } from "../git/index";

export class GithubService extends AbstractGitRestClient {
    getAuthMethods(): Array<AuthMethod> {
        return [ AuthMethod.basic, AuthMethod.token ];
    }


}