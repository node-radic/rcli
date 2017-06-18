import { JsonSchema, Model, RelationMapping } from "objection";
import { Credential } from "./Credential";

export class User extends Model {
    readonly id: number
             name: string
             password: string
             logged_in: boolean
             credentials?: Credential[]

    static tableName = 'Users';

    static get jsonSchema(): JsonSchema {
        return {
            type      : 'object',
            required  : [ 'name', 'password' ],
            properties: {
                id      : { type: 'integer' },
                name    : { type: 'string' },
                password: { type: 'string' },
                logged_in: { type: 'boolean', default: false }
            }
        }
    }

    // This object defines the relations to other models.
    static relationMappings = {
        credentials: <RelationMapping> {
            relation  : Model.HasManyRelation,
            modelClass: Credential,
            join      : {
                from: 'Users.id',
                to  : 'Credentials.user_id'
            }
        }
    }
}


export default User