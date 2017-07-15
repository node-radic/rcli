import { helper, HelperOptionsConfig, InputHelper, lazyInject } from "@radic/console";
import { kindOf } from "@radic/util";
import { Services } from "../services/Services";
import { Credential } from "../database/Models/Credential";
import { IService } from "../interfaces";

@helper('connect', {
    depends  : [ 'input' ],
    singleton: true
})
export class ConnectHelper {
    config: HelperOptionsConfig = {}

    @lazyInject('r.services')
    services: Services;

    @lazyInject('cli.helpers.input')
    ask: InputHelper

    getCredentialForService(service: string | string[], connectionArg?: string): Promise<Credential> {
        let services: string[] = [];
        if ( kindOf(service) === 'string' ) {
            services.push(<string>service);
        } else {
            services = <string[]> service
        }

        return new Promise(async (resolve, reject) => {
            const choices          = await Credential.query().column('name').whereIn('service', services)
            const connectionName   = connectionArg || await this.ask.list('The service connection', choices);
            const cred: Credential = await Credential.query().where('name', connectionName).first().execute()
            if ( ! cred ) return reject(`Connection [${connectionName}] not found`)
            resolve(cred);
        })
    }

    getService<T extends IService>(service:string|string[], connectionArg?:string) : Promise<T> {
        return new Promise(async(resolve) => {
            const cred = await this.getCredentialForService(service, connectionArg);
            resolve(this.services.make<T>(cred.service, cred));
        })
    }
}