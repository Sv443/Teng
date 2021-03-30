/**************************************************/
/* Teng - Offers functions to interpolate numbers */
/**************************************************/



/**
 * Method of interpolating between values
 */
declare type InterpolationMethod = "linear" | "quadratic" | "cubic";

/**
 * Linear interpolation
 */
function linear(offset: number, a: number, b: number): number
{
    return (1 - offset) * a + offset * b;
}

/**
 * Quadratic interpolation
 */
function quadratic(offset: number, a: number, b: number, c: number): number
{
    return linear(offset, linear(offset, a, b), linear(offset, b, c));
}

/**
 * Cubic interpolation
 */
function cubic(offset: number, a: number, b: number, c: number, d: number): number
{
    return linear(offset, quadratic(offset, a, b, c), quadratic(offset, b, c, d));
}


/**
 * Interpolate between multiple numbers based on a certain method
 * @param offset Median point offset between 0.0 and 1.0 - default is 0.5
 */
export default function interpolate(method: "linear", offset: number | undefined, a: number, b: number): number;
/**
 * Interpolate between multiple numbers based on a certain method
 * @param offset Median point offset between 0.0 and 1.0 - default is 0.5
 */
export default function interpolate(method: "quadratic", offset: number | undefined, a: number, b: number, c: number): number;
/**
 * Interpolate between multiple numbers based on a certain method
 * @param offset Median point offset between 0.0 and 1.0 - default is 0.5
 */
export default function interpolate(method: "cubic", offset: number | undefined, a: number, b: number, c: number, d: number): number;



export default function interpolate(method: InterpolationMethod, offset: number | undefined, ...numbers: number[]): number
{
    if(!offset)
        offset = 0.5;

    switch(method)
    {
        case "linear":
            return linear(offset, numbers[0], numbers[1]);
        case "quadratic":
            return quadratic(offset, numbers[0], numbers[1], numbers[2]);
        case "cubic":
            return cubic(offset, numbers[0], numbers[1], numbers[2], numbers[3]);
    }
}
