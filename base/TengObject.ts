/*********************************************************/
/* Teng - Base class for all instantiatable Teng classes */
/*********************************************************/

import { tengSettings } from "../settings";


/**
 * Base class of all instantiatable Teng classes
 */
export abstract class TengObject
{
    /** Unique identification of type `Symbol` that's assigned to each Teng object at instantiation */
    readonly uid: Symbol;
    /** The name of this Teng object */
    readonly objectName: string;
    /** The time at which this object was created (with millisecond accuracy) */
    readonly creationTime: Date;

    /**
     * Creates an instance of the TengObject class  
     * All instantiatable classes in Teng should inherit this class and should have a call to `super()`
     * @param objectName The name of the object (usually the class name)
     * @param descriptor Something to more precisely describe this object
     */
    constructor(objectName: string, descriptor?: string)
    {
        descriptor = (typeof descriptor === "string" ? `/${descriptor}` : "");

        this.objectName = objectName;
        this.uid = Symbol(`${tengSettings.info.abbreviation}/${objectName}${descriptor}`);
        this.creationTime = new Date();
    }

    //#MARKER getters
    /**
     * Returns the time at which this object was created
     */
    getCreationTime(): Date
    {
        return this.creationTime;
    }

    //#MARKER abstract
    /**
     * Returns a string representation of this teng object
     */
    abstract toString(): string;

    //#MARKER static
    /**
     * Limits the length of a passed teng object descriptor (string)
     * @param descriptor A descriptor to limit
     * @param limit How many characters to limit the descriptor to
     */
    static limitedLengthDescriptor(descriptor: string, limit: number = tengSettings.objects.descriptorDefaultMaxLength): string
    {
        const suffix = "…";

        if(limit < 1 || limit % 1 != 0)
            throw new TypeError(`Limit has to be a number bigger than 0 (got ${limit})`);

        if(descriptor.length > limit)
            descriptor = `${descriptor.substr(0, (limit - suffix.length))}${suffix}`;

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
}
