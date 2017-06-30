import { AbstractModel } from "./AbstractModel";
import { InteractionSchema, ModelInteractor } from "../model-interaction";


export class AbstractInteractiveModel extends AbstractModel {
    readonly id?: number;

    static interactionSchema: InteractionSchema;

    static interact():ModelInteractor {
        return new ModelInteractor(new this, this);
    }
}

export default AbstractInteractiveModel