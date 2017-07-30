import { interfaces } from "inversify";
import { container } from "@radic/console";
import { IService, IServiceConstructor, ServiceConfig, ServiceExtraFields } from "./interfaces";
import { Services } from "./services/Services";
import { Credential } from "./database/Models/Credential";
const set = Reflect.defineMetadata
const get = Reflect.getMetadata

export function service(config: ServiceConfig): ClassDecorator {
    return (cls:any) => {
        set('service', config, cls);
        container.get<Services>('r.services').register(config);
        container.bind('r.services.' + config.name).to(cls)
    }
}
