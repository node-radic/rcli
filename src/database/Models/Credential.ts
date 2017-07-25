import { JsonSchema, Model } from "objection";
import { container } from "@radic/console";
import { ServiceConfig } from "../../interfaces";
import { Services } from "../../services/Services";

export interface CredentialsExtraField {
    [key: string]: any
}

export class Credential<T extends CredentialsExtraField=CredentialsExtraField>extends Model {
    readonly id: number
             service: string
             name: string
             method: string
             key: string
             secret: string
             extra: T
             default_for_service: boolean

    protected static _services: Services;

    public static get services(): Services {
        if ( ! Credential._services ) {
            Credential._services = container.get<Services>('r.services')
        }
        return Credential._services;
    }

    // /**
    //  * @deprecated
    //  * @returns {GitHubServer}
    //  */
    // getApiService(): GitServer {
    //     if ( this.service === 'github' ) {
    //         return container.get<GitHubServer>('r.api.github').setCredentials(this)
    //     }
    // }


    // // This object defines the relations to other models.
    // static relationMappings = {
    //     user: <RelationMapping> {
    //         relation  : Model.BelongsToOneRelation,
    //         modelClass: __dirname + '/User.js',
    //         join      : {
    //             from: 'Credentials.user_id',
    //             to  : 'Users.id'
    //         }
    //     }
    // }

    //
    // /**
    //  * @deprecated
    //  * @returns {GitHubServer}
    //  */
    // getJiraService(): any {
    //     if ( this.service === 'jira' ) {
    //         return container.get<Jira>('r.api.jira').getApi(this);
    //     }
    // }

    public static getDefaultFor(service: string): Promise<Credential> {
        return Credential.query().where('service', service).andWhere('default_for_service', 1).first().execute()
    }

    static tableName = 'Credentials';

    static get jsonSchema(): JsonSchema {
        return {
            type      : 'object',
            required  : [ 'name', 'service', 'method', 'secret' ],
            properties: {
                id                 : { type: 'integer' },
                // user_id: { type: 'integer' },
                service            : { type: 'string', minLength: 1, maxLength: 255 },
                name               : { type: 'string', minLength: 1, maxLength: 255 },
                method             : { type: 'string', minLength: 1, maxLength: 255 },
                key                : { type: 'string', minLength: 1, maxLength: 255 },
                secret             : { type: 'string', minLength: 1, maxLength: 255 },
                extra              : { type: 'object', default: {} },
                default_for_service: { type: 'boolean', default: false }
            }
        }
    }
}
export default Credential