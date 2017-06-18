import { AuthMethod } from "./AuthMethod";
import * as _ from "lodash";
import { Dictionary } from '../interfaces';


let available: Dictionary<string[]> = {
    github   : [ 'token', 'basic' ],
    jira     : [ 'oauth2', 'basic' ],
    bitbucket: [ 'oauth2', 'basic' ]
}

export class Services {
    items: Dictionary<AuthMethod[]> = {}

    constructor(){
        Object.keys(available).forEach(name => {
            this.items[name] = available[name].map(method => AuthMethod[method]);
        })
    }

    getAvailable(){
        return Object.keys(this.items);
    }

    getSupportedMethodsFor(name:string){

    }

    supportsMethod(name:string, method:AuthMethod|string){
        return method.toString() in this.items[name]
    }
}