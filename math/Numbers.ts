/*****************************************************/
/* Teng - This is for basic and advanced number math */
/*****************************************************/


export type NumberSuffix = "" | "k" | "M" | "B" | "T" | "q" | "Q" | "s" | "S" | "O" | "N" | "D";

const numberSuffixes: NumberSuffix[] = ["", "k", "M", "B", "T", "q", "Q", "s", "S", "O", "N", "D"];

/**
 * An object that describes an abbreviated number
 */
export interface IAbbreviatedNumber
{
    [index: string]: number | string | boolean;

    /** The abbreviated numerical value. */
    value: number;
    /** Up to three decimal places. Set to `NaN` if the number is below 1000. */
    decimals: number;
    /** The suffix of the number. Set to an empty string if the number is below 1000. */
    suffix: NumberSuffix;
    /** Whether the maximum abbreviatable value of `999.99…` decillion was passed. */
    maxReached: boolean;
}

/**
 * Deconstructs a number into an abbreviated form.  
 * [Source](https://stackoverflow.com/a/32638472/8602926)
 */
export function abbreviateNumber(num: number): IAbbreviatedNumber
{
    if(num === 0 || num < 1e-3) // terminate early
        return { value: 0, decimals: 0, suffix: "", maxReached: false };

    const fixed = 3; // number of decimal places to show

    const pow = (num).toPrecision(2).split("e"); // get power
    const powIdx = pow.length === 1 ? 0 : Math.floor(Math.min(parseInt(pow[1].slice(1)), 35) / 3); // floor at decimals, ceiling at decillions
    const tVal = parseInt(powIdx < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, powIdx * 3) ).toFixed(1 + fixed)); // divide by power
    const decimals = num > 1000 ? parseInt(BigInt(num).toString().substr(BigInt(tVal).toString().length, 3)) : NaN;
    const value = tVal < 0 ? tVal : Math.abs(tVal); // enforce absolute value
    const suffix = numberSuffixes[powIdx]; // get suffix

    const maxReached = (value > 1000);

    return { value, decimals, suffix, maxReached };
}
