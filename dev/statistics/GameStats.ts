import { AnyObject } from "tsdef";


//#MARKER types

interface IBaseStat {
    /** Internal name of this stat - this should be unique, else you'll be overwriting other stats with the same name */
    intName: string;
}

/** Keeps track of numbers, either integers or floats, depending on the type */
export interface INumericalStat extends IBaseStat {
    /** The type of tracked data */
    type: ( "number" | "float_number" );
    /** The value of this stat - will be `undefined` if not set or still at initial unset value */
    value?: number;
    /** If `GameStat.increment()` or `decrement()` are called without any parameters, how much to increment the stat's value by.  
     * Set to 0 to prevent usage of the `increment()` and `decrement()` methods.  
     * Set negative to invert what the `increment()` and `decrement()` methods do. I'll try not to judge you based on this.  
     *   
     * Defaults to `1`
     */
    incrementBy?: number;
}

/** Keeps track of a text string */
export interface ITextStat extends IBaseStat {
    /** The type of tracked data */
    type: "text";
    /** The value of this stat */
    value?: string;
}

/** "Raw" data - JSON-compatible objects offer full customizability */
export interface IRawStat extends IBaseStat {
    /** The type of tracked data */
    type: "raw";
    /** The value of this stat - has to be a JSON-compatible object */
    value?: AnyObject;
}

/** A stat contains persistent statistical data about the game */
export type Stat = INumericalStat | ITextStat | IRawStat;

/** Describes a category, containing all of its stats */
export interface IStatCategory {
    /** Internal category name */
    intName: string;
    /** The stats that are linked to this category */
    stats: Stat[];
}


//#MARKER class


/**
 * Keeps track of statistics data
 */
export default class GameStats
{
    protected categories: IStatCategory[];
    protected filePath: string;


    /**
     * Creates an instance of the GameStats class
     * @param filePath Absolute path to the file that these stats should be stored in (include file name and extension)
     * @param initialValues The initial 
     */
    constructor(filePath: string, categories: IStatCategory[])
    {
        this.filePath = filePath;
        this.categories = categories;
    }

    //#SECTION increment

    /**
     * For incrementing **raw data** that **contains nested objects.**  
     * In order for this to work, you need to provide the object traversal path, aka an array of strings that tells Teng which properties to access to get to the incrementable value.  
     * The last item of this array should be the name of the property you want to increment.  
     *   
     * Example:  
     * ```ts
     * // Raw data that some stat contains
     * const myStatsData = {
     *     foo: {
     *         bar: {
     *             myValue: 0
     *         }
     *     }
     * };
     * 
     * // Usage:
     * GameStats.increment("my-category", "my-stat", [ "foo", "bar", "myValue" ])
     * ```
     * @param traversalPath An array of strings
     */
    increment(categoryIntName: string, statIntName: string, traversalPath: string[], incrementBy?: number): boolean;

    /**
     * For incrementing **raw data** that is shallow / **doesn't contain sub-objects.**  
     * @param property The name of the property in the raw data you want to increment
     * @param incrementBy By how much to increment the value of the stat you provided
     */
    increment(categoryIntName: string, statIntName: string, property: string, incrementBy?: number): boolean;

    /**
     * For incrementing **numerical data.**
     * @param incrementBy By how much to increment the value of the stat you provided - if left empty, uses the default set when creating GameStats instance, then defaults to `1.0`
     */
    increment(categoryIntName: string, statIntName: string, incrementBy?: number): boolean;


    /**
     * @param categoryIntName Internal name of the category that is linked to the stat you want to increment
     * @param statIntName Internal name of the stat you want to increment
     * @param incrementBy By how much to increment the value of the stat you provided
     */
    increment(categoryIntName: string, statIntName: string, ...overloads: any[]): boolean
    {
        /** Returns the desired increment, falling back onto two values, one set by the user, the other by the engine (`1.0`) */
        const getIncrement = (overloadIncrementBy: number, categoryIntName: string, statIntName: string) => {
            return (overloadIncrementBy || this.getStatDefaultIncrement(categoryIntName, statIntName) || 1.0);
        };


        if(Array.isArray(overloads[0]))
        {
            // nested objects
            return this.incrementRaw(categoryIntName, statIntName, overloads[0], getIncrement(overloads[1], categoryIntName, statIntName));
        }
        else if(typeof overloads[0] === "string")
        {
            // shallow objects
            return this.incrementRaw(categoryIntName, statIntName, [overloads[1]], getIncrement(overloads[1], categoryIntName, statIntName));
        }
        else
        {
            // numerical data
            return this.incrementNumerical(categoryIntName, statIntName, getIncrement(overloads[0], categoryIntName, statIntName));
        }
    }

    private incrementNumerical(categoryIntName: string, statIntName: string, incrementBy: number): boolean
    {
        const stat = this.getStat(categoryIntName, statIntName);

        if(!stat)
            return false;

        if(!stat?.value)
            stat.value = 0;
        
        stat.value = (stat.value as number) + incrementBy;

        return true;
    }

    private incrementRaw(categoryIntName: string, statIntName: string, traversalPath: string[], incrementBy: number): boolean
    {
        // TODO: test this war crime of a method

        const stat = this.getStat(categoryIntName, statIntName);

        if(!stat)
            return false;
        
        if(traversalPath.length === 0)
            throw new TypeError(`Error while incrementing raw data: provided traversal path has to be an array with at least one item - instead got ${traversalPath.length} items`);


        // if raw object is shallow

        if(traversalPath.length === 1)
        {
            const statVal = (stat?.value as AnyObject);

            if(typeof statVal[traversalPath[0]] !== "number")
                return false;

            statVal[traversalPath[0]] = statVal[traversalPath[0]] + incrementBy;

            return true;
        }
        else
        {
            // if raw object needs traversal

            const lastPropName = (traversalPath.pop() as string);

            let trav: any;

            for(let travIdx = 0; travIdx < traversalPath.length; travIdx++)
            {
                const prop = traversalPath[travIdx];

                trav = (stat.value as AnyObject)[prop];

                if(typeof trav !== "object")
                    (stat.value as AnyObject)[prop] = {};
            }

            trav[lastPropName] = trav[lastPropName] + incrementBy;

            return true;
        }
    }

    //#SECTION get, set

    /**
     * Returns the value of a stat based on its category and stat internal name.  
     * Will return `undefined` if no matching stat could be found.
     */
    getValue(categoryIntName: string, statIntName: string): (number | string | AnyObject | undefined)
    {
        return this.getStat(categoryIntName, statIntName)?.value;
    }

    /**
     * Tries to find a stat with the provided category and stat internal name, then assigns the provided value to it.  
     * Returns `true` if the stat value could be set, `false` if not (usually means the internal names are invalid).
     */
    setValue(categoryIntName: string, statIntName: string, val: (number | string | AnyObject)): boolean
    {
        const stat = this.getStat(categoryIntName, statIntName);

        if(!stat)
            return false;

        stat.value = val;

        return true;
    }

    //#MARKER private

    /**
     * Tries to read the `incrementBy` property of the provided stat, then falls back to the Teng default of `1.0`
     */
    private getStatDefaultIncrement(categoryIntName: string, statIntName: string): number
    {
        const stat = this.getStat(categoryIntName, statIntName);

        if(!stat)
            return 1;

        return (stat.type === "number") ? stat.incrementBy || 1 : 1;
    }

    /**
     * Returns a stat object, given an internal category and stat name.  
     * Returns `undefined` if no fitting stat was found.
     */
    private getStat(categoryIntName: string, statIntName: string): Stat | undefined
    {
        return this.categories.find(c => c.intName === categoryIntName)?.stats.find(st => st.intName === statIntName);
    }
}
