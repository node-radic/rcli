import { JsonSchema, Model, RelationMapping } from "objection";
import { container } from "@radic/console";
import { GitHubServer, GitServer } from "../../services/apis/git";
import { AxiosInstance } from "axios";


export class Credential extends Model {
    readonly id: number
             service: string
             name: string
             method: string
             key: string
             secret: string

    public getApiService() : GitServer {
        if(this.service === 'github'){
            return container.get<GitHubServer>('r.api.github').setCredentials(this)
        }

    }



    static tableName = 'Credentials';

    static get jsonSchema(): JsonSchema {
        return {
            type      : 'object',
            required  : [ 'name', 'service', 'method', 'secret' ],
            properties: {
                id     : { type: 'integer' },
                // user_id: { type: 'integer' },
                service: { type: 'string', minLength: 1, maxLength: 255 },
                name   : { type: 'string', minLength: 1, maxLength: 255 },
                method : { type: 'string', minLength: 1, maxLength: 255 },
                key    : { type: 'string', minLength: 1, maxLength: 255 },
                secret : { type: 'string', minLength: 1, maxLength: 255 }
            }
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
}
export default Credential