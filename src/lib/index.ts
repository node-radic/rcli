import { paths } from "./core/paths";
export * from './core/index'
export *  from './auth/index'
export * from './git/index'
import { Cli, container } from "@radic/console";
import * as loki from "lokijs";
// import * as lokiCryptedFileAdapter from "lokijs/src/loki-crypted-file-adapter.js";
import * as lfsa from "lokijs/src/loki-fs-structured-adapter.js";

export interface DB extends Loki{}
const adapter = new lfsa()
let db:DB        = new loki(paths.userDatabase, {
    autoload        : true,
    adapter         : adapter,
    autoloadCallback(){

    },
    autosave        : true,
    autosaveInterval: 1000
})
container.constant<DB>('r.db', db);
