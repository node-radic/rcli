import "./yargs-parser";

declare namespace global {
    export interface CliTable extends Array<string[]> {

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