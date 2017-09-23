import { JsonSchema } from 'objection';
import { AbstractInteractiveModel } from './AbstractInteractiveModel';
import { InteractionSchema } from '../model-interaction';
import { merge } from 'lodash';


export class SSHConnection extends AbstractInteractiveModel {
    readonly id: number
             name: string
             user: string
             host: string
             port: number
             method: string
             password: string
             localPath: string
             hostPath: string


    static tableName = 'SSHConnections';

    static get jsonSchema(): JsonSchema {
        return {
            type       : 'object',
            required   : [ 'name', 'user', 'host', 'port', 'method', 'localPath', 'hostPath' ],
            uniqueItems: true,
            properties : {
                id  : { type: 'integer' },
                name: { type: 'string', minLength: 1, maxLength: 255, uniqueItems: true },

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

    static get interactionSchema(): InteractionSchema {
        let schema: InteractionSchema = { properties: {} }
        Object.keys(SSHConnection.jsonSchema.properties).forEach(propertyName => schema.properties[ propertyName ] = schema.properties[ propertyName ] || {});

        return merge(schema, <InteractionSchema> {
            properties: {
                port    : {
                    filter: (input): any => {
                        return parseInt(input);
                    }
                },
                password: { type: 'password' },
                name    : {
                    validate: (input): Promise<boolean | string> => {
                        return SSHConnection.query()
                            .where('name', input)
                            .execute()
                            .then(has => has.name ? Promise.reject('Name should be unique, but already exists') : Promise.resolve(true))
                    }
                }
            }
        });
    };


}

export default SSHConnection