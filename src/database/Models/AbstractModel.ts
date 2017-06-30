import { JsonSchema, Model } from "objection";


export abstract class AbstractModel extends Model {
    readonly id ?: number;
}
export default AbstractModel