import "./yargs-parser";
import {Question as BaseQuestion} from "inquirer";


declare module "radical-console" {

    import { HelperOptionsConfig } from 'radical-console';

    interface HelpersOptionsConfig {
        'ssh.bash': HelperOptionsConfig
        'connect': HelperOptionsConfig
    }

}

namespace global {
    export interface CliTable extends Array<string[]> {

    }
    export interface Question extends BaseQuestion {
        source?: (answers:any, input:any) => Promise<string[]>
    }
}

// Common interface between Arrays and jQuery objects
interface List<T> {
    [index: number]: T;
    length: number;
}

interface Dictionary<T> {
    [index: string]: T;
}

interface NumericDictionary<T> {
    [index: number]: T;
}

interface StringRepresentable {
    toString(): string;
}

interface Cancelable {
    cancel(): void;
    flush(): void;
}


declare module 'download' {
    import { download } from './download/index';
    export = download
}