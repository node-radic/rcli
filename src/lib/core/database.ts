

import { PersistentFileConfig } from "./config";
import { paths } from "./paths";
import { container, singleton } from "@radic/console";


export class Database extends PersistentFileConfig {

    protected autoload:boolean = false;
    constructor(obj: Object) {
        super({});
        this.defaultConfig = obj;
        this.filePath = paths.userDatabase + '2';
        this.data = obj;
        this.load();
    }

    filter<T extends Array<any>>(path, options){
        return this.get<T>(path).filter(options);
    }

    find<T extends Array<any>>(path, key, value){
        return this.get<T>(path).find((item) => item[key] === value)
    }
}

const db = new Database({users: {}, credentials: {}})
console.dir(db);
container.bind('db').toConstantValue(db);