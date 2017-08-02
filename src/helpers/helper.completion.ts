import { CliExecuteCommandParsedEvent, container, helper } from "radical-console";
import * as omelette from "omelette";
@helper('completion', {
    listeners: {
        'cli:execute:parsed': 'onExecuteParsedEvent'
    }
})
export class CompletionHelper {
    onExecuteParsedEvent(event: CliExecuteCommandParsedEvent) {
        // let tree       = container.get<any>('cli.helpers.help').getSubcommandsNameTree(event.cli.rootCommand);
        // const complete = omelette('r').tree(tree);
        // complete.init();
        // event.cli.log.debug('complete')
        // process.exit();
    }
}
export default CompletionHelper