/********************************************************/
/* Teng - Describes a currency, offering useful methods */
/********************************************************/

/**
 * Ideas for the future:
 * - Add an inflation system
 */


import { DeepPartial } from "tsdef";

import TengObject from "../core/TengObject";
import { abbreviateNumber } from "../math/Numbers";


//#MARKER types

/**
 * Settings for the Currency class
 */
export interface ICurrencySettings
{
    [index: string]: boolean | number | string | undefined;

    /** Whether the currency can go below zero */
    negativeAllowed: boolean;
    /** A number, at or below which the "thresholdPassed" event is emitted. Set to `NaN` to disable. */
    minThreshold: number;
    /** A number, at or above which the "thresholdPassed" event is emitted. Set to `NaN` to disable. */
    maxThreshold: number;
    /** When returning the current amount of currency, whether to pre-/suffix the number with a [metric prefix](https://en.wikipedia.org/wiki/Metric_prefix#List_of_SI_prefixes), like `1k` for 1000 or `1M` for 1 million */
    metricUnitPrefix: boolean;
    /** On which side the currency abbreviation should be put. (Example: left = `$ 420.69k`, right = `420.69 k$`)*/
    currencyAbbreviationPosition: "left" | "right";
    /** What character should be used as a decimal point, e.g. the dot in 0.5 (zero point five) */
    decimalPoint: string;
}

/**
 * Default values for the Currency class settings
 */
const defaultICurrencySettings: ICurrencySettings = {
    negativeAllowed: true,
    minThreshold: NaN,
    maxThreshold: NaN,
    metricUnitPrefix: true,
    currencyAbbreviationPosition: "right",
    decimalPoint: ".",
};


/**
 * The [metric prefix](https://en.wikipedia.org/wiki/Metric_prefix#List_of_SI_prefixes) of a number / unit.  
 * Can be `undefined` if no prefix applies (the number is between `-999.99…` and `999.99…` or the number is set to the constant `NaN` or `Infinity`).
 */
export type UnitPrefix = ( MetricPrefix | undefined );

/**
 * These prefixes are multiplicative (describe a number larger than `999.99…`):
 *   
 * | Symbol | Name | Example Number|
 * | :-- | :-- | --: |
 * | `Y` | Yotta- | `1000000000000000000000000`
 * | `Z` | Zetta- | `1000000000000000000000`
 * | `E` | Exa- | `1000000000000000000`
 * | `P` | Peta- | `1000000000000000`
 * | `T` | Tera- | `1000000000000`
 * | `G` | Giga- | `1000000000`
 * | `M` | Mega- | `1000000`
 * | `k` | Kilo- | `1000`
 */
export type MetricPrefix = ( "k" | "M" | "G" | "T" | "P" | "E" | "Z" | "Y" );


/**
 * The type of crossed threshold (minimum or maximum)
 */
declare type ThresholdType = ( "min" | "max" );


//#MARKER class


export interface Currency
{
    on(event: "thresholdPassed", listener: (type: ThresholdType, currentValue: number, definedThreshold: number) => void): this;
}

/**
 * Describes a currency and offers some useful methods
 */
export class Currency extends TengObject
{
    readonly name: string;
    readonly abbreviation: string;

    /** The current currency value */
    private value: number = 0;

    private settings: ICurrencySettings;


    /**
     * Creates an instance of the Currency class
     * @param name The full name of the currency
     * @param abbreviation An abbreviation of the currency (1-3 characters, shorter than `name`)
     */
    constructor(name: string, abbreviation: string, initialValue: number = 0, settings?: DeepPartial<ICurrencySettings>)
    {
        super("Currency", `${name}_[${abbreviation}]`);


        if(abbreviation.length > 3 || abbreviation.length < 1)
            throw new TypeError(`Currency abbreviation "${abbreviation}" is not between 1 and 3 characters in length`);

        if(abbreviation.length >= name.length)
            throw new TypeError(`Currency abbreviation "${abbreviation}" is not shorter than name "${name}"`);

        this.name = name;
        this.abbreviation = abbreviation;

        if(initialValue)
            this.value = initialValue;

        this.settings = { ...defaultICurrencySettings, ...settings };
    }

    /**
     * Converts this TengObject into a string.  
     * **Does not give you your value as a pretty string like `$ 420.69k` - use `valueAsString()` instead!**
     */
    toString(): string
    {
        return `Currency ${this.name} [${this.abbreviation}]`;
    }

    //#MARKER other

    /**
     * Turns the value, metric prefix and currency abbreviation into a pretty string
     */
    valueAsString(): string
    {
        let valueStr = "";

        const val = this.getValue();

        const currencyAbbr = this.abbreviation;
        
        const abbrVal = abbreviateNumber(val);


        if(this.settings.currencyAbbreviationPosition === "left")
            valueStr += `${currencyAbbr} `;

        valueStr += abbrVal.value.toString();

        if(!isNaN(abbrVal.decimals) && abbrVal.decimals !== 0)
        {
            valueStr += this.settings.decimalPoint;
            valueStr += abbrVal.decimals.toString().substr(0, 2).replace(/[0]$/, "");
        }

        if(this.settings.currencyAbbreviationPosition === "right")
            valueStr += ` ${abbrVal.suffix}${currencyAbbr}`;
        else
            valueStr += abbrVal.suffix;

        return valueStr;
    }

    /**
     * Increment the currency value by a certain number
     */
    increase(num: number): void
    {
        this.value += num;

        if(!this.settings.negativeAllowed && this.value < 0)
        {
            this.setValue(0);
            return;
        }

        this.checkValidity();
    }

    /**
     * Decrement the currency value by a certain number (same as calling `increment()` with a negative number)
     */
    decrease(num: number): void
    {
        this.value -= num;

        if(!this.settings.negativeAllowed && this.value < 0)
        {
            this.setValue(0);
            return;
        }

        this.checkValidity();
    }

    /**
     * Overrides the current currency value
     * @param noCheck Set to `true` to skip checking the set value's validity (prevents events from being emitted)
     */
    setValue(num: number, noCheck: boolean = false): void
    {
        this.value = num;

        if(!this.settings.negativeAllowed && this.value < 0)
        {
            this.value = 0;
            return;
        }

        if(!noCheck)
            this.checkValidity();
    }

    /**
     * Returns the current currency value
     */
    getValue(): number
    {
        return this.value;
    }

    /**
     * Sets a threshold.  
     * If the value ever passes this threshold, the `thresholdPassed` event will be emitted.
     */
    setThreshold(type: ThresholdType, threshold: number): void
    {
        if(type === "min")
            this.settings.minThreshold = threshold;

        else if(type === "max")
            this.settings.maxThreshold = threshold;
    }

    /**
     * Sets whether negative values are allowed
     */
    setNegativeValueAllowed(negativeAllowed: boolean): void
    {
        this.settings.negativeAllowed = negativeAllowed;
    }

    /**
     * Checks the current value for validity and emits events if it's invalid.  
     *    
     * Validity checks include whether the value has...  
     * - passed a threshold (min and max)
     */
    checkValidity(): void
    {
        const val = this.getValue();
        const { minThreshold, maxThreshold } = (this.settings as ICurrencySettings);

        if(!isNaN(minThreshold) && val < minThreshold)
            this.emit("thresholdPassed", "min", val, minThreshold);

        else if(!isNaN(maxThreshold) && val > maxThreshold)
            this.emit("thresholdPassed", "max", val, maxThreshold);

        return;
    }
}
