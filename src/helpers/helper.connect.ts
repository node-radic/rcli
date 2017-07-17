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
        return new Promise(async (resolve, reject) => {
            let services: string[] = [];
            if ( kindOf(service) === 'string' ) {
                services.push(<string>service);
            } else {
                services = <string[]> service
            }

            let connectionName = connectionArg;

            if ( ! connectionName ) {
                let choices: any = await Credential.query()
                    .column('name')
                    .whereIn('service', services)
                    .andWhere('default_for_connection', true);

                if ( choices.length === 0 ) {
                    choices = await Credential.query().column('name').whereIn('service', services)
                }

                if ( choices.length === 1 ) {
                    connectionName = choices[ 0 ].name
                } else if ( choices.length > 1 ) {
                    connectionName = await this.ask.list('The service connection', choices.map(choice => choice.name));
                }
            }

            const cred: Credential = await Credential.query().where('name', connectionName).first().execute()

            if ( ! cred ) return reject(`Connection [${connectionName}] not found`)
            resolve(cred);
        })
    }

    getService<T extends IService>(service: string | string[], connectionArg?: string): Promise<T> {
        return new Promise(async (resolve) => {
            const cred = await this.getCredentialForService(service, connectionArg);
            resolve(this.services.make<T>(cred.service, cred));
        })
    }
}