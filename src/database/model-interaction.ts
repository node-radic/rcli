import { AbstractInteractiveModel } from "./Models/AbstractInteractiveModel";
import { container, InputHelper, Log } from "@radic/console";
import * as inquirer from "inquirer";
import { Answers, ChoiceType } from "inquirer";
import * as _ from "lodash";
import { kindOf } from "@radic/util";
const argToArray = <T>(arg: T | T[]): T[] => kindOf(arg) === 'array' ? <T[]>arg : [ <T>arg ];

/**
 * @link https://github.com/sboudrias/Inquirer.js#list---type-list
 * @link https://github.com/mokkabonna/inquirer-autocomplete-prompt
 * @link https://github.com/DerekTBrown/inquirer-datepicker-prompt
 */
export type InteractionSchemaPropertyType = string | 'input' | 'confirm' | 'list' | 'rawlist' | 'expand' | 'checkbox' | 'password' | 'autocomplete' | 'datetime';

/**
 * @link https://github.com/sboudrias/Inquirer.js
 * @link https://github.com/mokkabonna/inquirer-autocomplete-prompt
 * @link https://github.com/DerekTBrown/inquirer-datepicker-prompt
 */
export interface InteractionSchemaProperty {
    [key: string]: any

    type?: InteractionSchemaPropertyType

    /**
     * The question to print. If defined as a function,
     * the first parameter will be the current inquirer session answers.
     */
    message?: string | ((answers: Answers) => string);

    /**
     * Default value(s) to use if nothing is entered, or a function that returns the default value(s).
     * If defined as a function, the first parameter will be the current inquirer session answers.
     */
    default?: any | ((answers: Answers) => any);

    /**
     * Choices array or a function returning a choices array. If defined as a function,
     * the first parameter will be the current inquirer session answers.
     * Array values can be simple strings, or objects containing a name (to display) and a value properties
     * (to save in the answers hash). Values can also be a Separator.
     */
    choices?: ChoiceType[] | ((answers: Answers) => ChoiceType[]);

    /**
     * Receive the user input and should return true if the value is valid, and an error message (String)
     * otherwise. If false is returned, a default error message is provided.
     */
    validate?(input: string): Promise<boolean | string> | boolean | string;

    /**
     * Receive the user input and return the filtered value to be used inside the program.
     * The value returned will be added to the Answers hash.
     */
    filter?(input: string): string;

    /**
     * Receive the current user answers hash and should return true or false depending on whether or
     * not this question should be asked. The value can also be a simple boolean.
     */
    when?: boolean | ((answers: Answers) => boolean);

    paginated?: boolean;

    /** @link https://github.com/mokkabonna/inquirer-autocomplete-prompt */
    source?: <T>(answersSoFar, input) => Promise<T>
    /** @link https://github.com/mokkabonna/inquirer-autocomplete-prompt */
    suggestOnly?: boolean

    /**
     * @link https://github.com/DerekTBrown/inquirer-datepicker-prompt
     * @link https://www.npmjs.com/package/dateformat
     */
    format?: string[]

    /**
     * @link https://github.com/DerekTBrown/inquirer-datepicker-prompt
     */
    date?: { min?: string, max?: string },

    /**
     * @link https://github.com/DerekTBrown/inquirer-datepicker-prompt
     */
    time?: { min?: string, max?: string, minutes?: { interval: number } }
}

export interface InteractionSchema {
    resolve?: {
        message?: boolean,
        default?: boolean,
        validate?: boolean,
        type?: boolean
    }
    properties?: { [field: string]: InteractionSchemaProperty }
}

export class ModelInteractor {

    protected properties: InteractionSchemaProperty[];
    protected fieldNames: string[]
    private _ask: InputHelper;

    constructor(protected model: AbstractInteractiveModel, protected cls: typeof AbstractInteractiveModel) {
        this.initSchemaProperties();
    }

    protected initSchemaProperties(fieldNames?: string[]) {
        const schema = _.cloneDeep(this.cls.interactionSchema)
        const res    = schema.resolve = _.merge({
            message : true,
            default : true,
            validate: true,
            type    : true
        }, schema.resolve);

        this.fieldNames = fieldNames = fieldNames || Object.keys(schema.properties);

        this.properties = fieldNames.map(fieldName => {

            const mp                         = this.cls.jsonSchema.properties[ fieldName ];
            let p: InteractionSchemaProperty = _.merge({ name: fieldName }, _.cloneDeep(schema.properties[ fieldName ]))

            //
            if ( res.default && mp.default ) p.default = mp.default;

            //
            if ( res.type ) {
                p.type = p.type ? p.type : ((): any => {
                    let t: 'string' | 'number' | 'object' | 'array' | 'boolean' | 'null' = <any> mp.type;
                    if ( t === 'array' || t === 'object' ) return 'list';
                    return 'input'
                })()
            }

            //
            if ( res.validate ) {
                let oldValidate = p.validate
                p.validate      = input => {
                    let min = mp.minimum || mp.minItems || mp.minLength
                    if ( min && input.length < min ) return `Minimum size/length of [${min}] required`

                    let max = mp.maximum || mp.maxItems || mp.maxLength
                    if ( max && input.length > max ) return `Maximum size/length of [${max}] required`

                    if ( ((this.cls.jsonSchema.required || []).includes(fieldName) || mp.required) && (! input || input.length === 0) ) return 'This value is required';

                    return oldValidate ? oldValidate(input) : true;
                }
            }

            //
            if ( res.message ) {
                p.message = fieldName + '?'
            }

            return p;
        })

    }

    get ask(): InputHelper {
        this._ask = this._ask ? this._ask : this._ask = container.get<InputHelper>('cli.helpers.input')

        let promptNames = Object.keys(inquirer.prompts);

        if ( ! promptNames.includes('autocomplete') ) inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
        if ( ! promptNames.includes('datetime') ) inquirer.registerPrompt('datetime', require('inquirer-datepicker-prompt'))

        return this._ask;
    }

    property(name: string) {
        return _.find(this.properties, { name })
    }

    getPropertyArrayFor(fieldNames: string | string[], overrides: { [key: string]: InteractionSchemaProperty } = {}): InteractionSchemaProperty[] {
        return argToArray(fieldNames).map(name => overrides[ name ] ? _.merge(this.property(name), overrides[ name ]) : this.property(name))
    }

    askFor(fieldNames: string | string[], overrides: { [key: string]: InteractionSchemaProperty } = {}): Promise<any> {
        return this.ask.prompts(<any> this.getPropertyArrayFor(fieldNames, overrides))
    }

    setDefaultsFor(defaults: { [key: string]: any }): this {
        Object.keys(defaults).forEach(key => {
            let index = _.findIndex(this.properties, { name: key })
            if ( index !== undefined ) {
                this.properties[ index ].default = defaults[ key ];
            }
        })
        return this;
    }

    async create<T extends AbstractInteractiveModel>(fieldNames: string | string[],
                                                     overrides: { [key: string]: InteractionSchemaProperty } = {},
                                                     set: { [key: string]: any }                             = {}): Promise<T> {
        let data = await this.askFor(argToArray(fieldNames).filter(name => ! set[ name ]), overrides)

        Object.keys(set).forEach(name => { // merge?!?
            data[ name ] = set[ name ];
        })

        return this.cls.query()
            .insertAndFetch(data)
            .execute()
            .catch(this.onError);
    }

    async update<T extends AbstractInteractiveModel>(id: number,
                                                     fieldNames: string | string[],
                                                     overrides: { [key: string]: InteractionSchemaProperty } = {},
                                                     set: { [key: string]: any }                             = {}): Promise<T> {
        let data = await this.askFor(argToArray(fieldNames).filter(name => ! set[ name ]), overrides)

        Object.keys(set).forEach(name => { // merge?!?
            data[ name ] = set[ name ];
        })

        return this.cls.query()
            .updateAndFetchById(id, data)
            .execute()
            .catch(this.onError);

    }

    async remove(name?:string): Promise<boolean> {
        if(name){
            return this.cls.query().where({name}).delete().execute()
        }
        let con = await this.pick()
        return this.cls.query().deleteById(con.id).execute();
    }

    async pick<T extends AbstractInteractiveModel>(exclude: string[] = [], msg: string = 'Pick'): Promise<T> {
        let choices = await this.cls.query().select('name').execute()
        let name    = await this.ask.list(msg, choices)
        return this.cls.query().where({ name }).first().execute();
    }

    onError(err) {
        let log = container.get<Log>('r.log')
        log.error(err.message ? err.message : err) && process.exit(1)
    }

}

