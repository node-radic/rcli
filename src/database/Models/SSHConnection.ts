import { JsonSchema, Model } from "objection";


export class SSHConnection extends Model {
    readonly id: number
    name      : string
    user      : string
    host      : string
    port      : number
    method    : string
    password  : string
    localPath : string
    hostPath  : string


    static tableName = 'SSHConnections';

    static get jsonSchema(): JsonSchema {
        return {
            type      : 'object',
            required  : [ 'name', 'user', 'host' ],
            properties: {
                id       : { type: 'integer' },
                name     : { type: 'string', minLength: 1, maxLength: 255, uniqueItems: true },

                user     : { type: 'string', minLength: 1, maxLength: 255 },
                host     : { type: 'string', minLength: 1, maxLength: 255 },
                port     : { type: 'integer', 'default': 22 },
                method   : { type: 'string', minLength: 1, maxLength: 255, 'default': 'password' },
                password : { type: 'string', minLength: 1, maxLength: 255 },
                localPath: { type: 'string', minLength: 1, maxLength: 255 },
                hostPath : { type: 'string', minLength: 1, maxLength: 255 }
            }
        }
    }

}
export default SSHConnection