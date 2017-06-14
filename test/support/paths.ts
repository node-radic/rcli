import { Paths, setPaths } from '../../src'
import { resolve } from "path";
import { container } from "@radic/console";

export let paths:Paths;

export function setFixturePaths(): Paths {
    let _root          = resolve('..', 'fixtures', 'files')
    let _home          = resolve('..', 'fixtures', 'home')
    let r              = 'rcli'
    paths = setPaths({}, _root, _home, r)
    if ( container.isBound('paths') ) {
        container.unbind('paths')
    }
    container.bind('r.paths').toConstantValue(paths);
    return paths;
}

setFixturePaths();