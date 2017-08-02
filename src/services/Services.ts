import { container, lazyInject, singleton } from "radical-console";
import { AuthMethod } from "./AuthMethod";
import { Dictionary, IService, ServiceConfig } from "../interfaces";
import { Credential } from "../database/Models/Credential";


container.bind('r.services.factory').toFactory((ctx) => {
    return async (name: string, credentials: Credential) => {
        const service             = ctx.container.get<IService>('r.services.' + name)
        let config: ServiceConfig = Reflect.getMetadata('service', service.constructor)
        service[ 'service' ]      = config;
        await service.setCredentials(credentials);
        return service;
    }
})

@singleton('r.services')
export class Services {
    protected items: Dictionary<ServiceConfig> = {}

    @lazyInject('r.services.factory')
    factory: (name: string, credentials: Credential) => IService


    has(name: string): boolean {
        return this.items[ name ] !== undefined
    }

    getNames(): string[] {
        return Object.keys(this.items);
    }

    all(): Dictionary<ServiceConfig> {
        return this.items;
    }

    getMethodsFor(name: string) {
        return this.items[ name ].methods
    }

    supportsMethod(name: string, method: AuthMethod | string) {
        return method.toString() in this.items[ name ].methods
    }

    make<T extends IService>(name: string, credentials: Credential): T {
        return <T> this.factory(name, credentials);
    }

    get(name: string): ServiceConfig {
        return this.items[ name ];
    }

    register(config: ServiceConfig) {
        if ( this.has(config.name) ) {
            throw new Error(`Cannot register service [${config.name}] because it already exists`);
        }
        this.items[ config.name ] = config;
    }
}