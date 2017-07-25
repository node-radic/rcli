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
            let connectionName = connectionArg;

            if ( ! connectionName ) {
                // try getting the default_for_connection credential first
                let query = () => {
                    let query = Credential.query().column('name')
                    if(services[0] !== '*'){
                        query.whereIn('service', services);
                    }
                    return query;
                }

                let choices: any ;
                if(services.length === 1) {
                    choices = await query().andWhere('default_for_connection', true);
                }

                // if empty result, get credentials for service
                if ( ! choices || choices.length === 0 ) {
                    choices = await query()
                }

                // if only 1 result use it. otherwise let the user pick it
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