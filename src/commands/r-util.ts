import { command } from 'radical-console';

@command('util|u {command}', 'Utility stuff', {
    isGroup: true
})
export class RcliUtilCmd {
}

export default RcliUtilCmd