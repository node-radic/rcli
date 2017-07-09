import { JsonSchema, Model } from "objection";
import { container } from "@radic/console";
import { GitHubServer, GitServer } from "../../services/apis/git";
import { Jira } from "../../services/apis/jira";

export interface CredentialsExtraField {
    [key: string]: any
    host?: string
    port?: number
    protocol?: string | 'https' | 'http',
    version?: string
    strict?: boolean
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

    static getDefaultFor(service:string):Promise<Credential>{
        return Credential.query().where('service', 'jira').andWhere('default_for_service', 1).first().execute()
    }

    getApiService(): GitServer {
        if ( this.service === 'github' ) {
            return container.get<GitHubServer>('r.api.github').setCredentials(this)
        }
    }


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
    getJiraService(): any {
        if ( this.service === 'jira' ) {
            return container.get<Jira>('r.api.jira').getApi(this);
        }
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
                extra              : {
                    type: 'object', default: {
                        port    : 443,
                        protocol: 'https',
                        strict  : false
                    }
                },
                default_for_service: { type: 'boolean', default: false }
            }
        }
    }
}
export default Credential