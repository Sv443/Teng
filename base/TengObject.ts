/*********************************************************/
/* Teng - Base class for all instantiatable Teng classes */
/*********************************************************/

import { EventEmitter } from "events";
import { tengSettings } from "../settings";


/**
 * Base class of all instantiatable Teng classes.  
 * All instantiatable classes in Teng should inherit this class.  
 * As this class inherits Node's `EventEmitter` class, every TengObject can emit and hook events.
 */
export abstract class TengObject extends EventEmitter
{
    /** 1000% unique identification of type `Symbol` that's assigned to each Teng object at instantiation - you literally can't get more unique than this */
    readonly uid: Symbol;
    /** Unique index number that is assigned to each Teng object at instantiation. Note that as an index, this number increments with each instantiated object */
    readonly uniqueIdx: number;
    /** The name of this TengObject - assigned at instantiation */
    readonly objectName: string;
    /** Timestamp at which this object was created (with millisecond accuracy) - assigned at instantiation */
    readonly creationTime: number;


    /**
     * Creates an instance of the TengObject class.  
     * All instantiatable classes in Teng should inherit this class.  
     * As this class inherits Node's `EventEmitter` class, every TengObject can emit and hook events.
     * @param objectName The name of the object (usually the class name)
     * @param descriptor Something to more precisely describe this object. To separate passed properties, you should use a `/` character.
     */
    constructor(objectName: string, descriptor?: string)
    {
        super();


        descriptor = (typeof descriptor === "string" ? `/${descriptor}` : "");

        this.uniqueIdx = uniqueIdxGen.next().value;
        this.objectName = objectName;
        this.uid = Symbol(`${tengSettings.info.abbreviation}~${this.uniqueIdx}/${objectName}${descriptor}`);
        this.creationTime = Date.now();
    }

    //#MARKER getters

    /**
     * Returns the timestamp at which this object was created - with millisecond accuracy
     */
    getCreationTime(): number
    {
        return this.creationTime;
    }

    /**
     * Returns the unique index number that is assigned to this object at instantiation
     */
    getUniqueIndex(): number
    {
        return this.uniqueIdx;
    }

    //#MARKER abstract

    /**
     * Returns a string representation of this TengObject.  
     *   
     * @abstract This is an abstract method that needs to be implemented in every extended class or in some common ancestor of an "inheritance chain"
     */
    abstract toString(): string;

    //#MARKER static

    /**
     * Limits the length of a passed teng object descriptor (or just a regular string)
     * @param descriptor A descriptor (string) to limit / truncate
     * @param maxLength The max length the `descriptor` should be
     * @param suffix Suffix to add after the descriptor, if it was truncated - defaults to `…`
     */
    static truncateDescriptor(descriptor: string, maxLength: number = tengSettings.objects.descriptorDefaultMaxLength, suffix: string = "…"): string
    {
        if(maxLength % 1 != 0)
            maxLength = Math.round(maxLength);

        if(maxLength < 1)
            throw new TypeError(`Maximum length has to be a number bigger than 0 (got ${maxLength})`);

        if(descriptor.length > maxLength)
            descriptor = `${descriptor.substr(0, (maxLength - suffix.length))}${suffix}`;

        return descriptor;
    }

    /**
     * Checks if the passed value is a TengObject
     */
    static isTengObject(value: any): value is TengObject
    {
        value = (value as TengObject);

        if(typeof value.uid !== "symbol")
            return false;

        if(!(value.creationTime instanceof Date))
            return false;

        return true;
    }

    /**
     * Generator function that returns a number that starts at `0` and incrementing by `1` each time `next()` is called
     * @generator
     */
    static *uniqueIndexGenerator(): Generator<number>
    {
        let idx = 0;

        while(true)
            yield idx++;
    }
}


/**
 * Generator function that generates a unique, 0-based, auto-incrementing index number.  
 * Used to assign a unique index to TengObjects at instantiation.
 */
const uniqueIdxGen = TengObject.uniqueIndexGenerator();
