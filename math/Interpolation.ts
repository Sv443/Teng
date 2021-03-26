/**************************************************/
/* Teng - Offers functions to interpolate numbers */
/**************************************************/


/**
 * Method of interpolating between values
 */
export enum InterpolationMethod
{
    Linear,
    Quadratic,
    Cubic
}

/**
 * Linear interpolation
 */
export function linear(offset: number, a: number, b: number): number
{
    return (1 - offset) * a + offset * b;
}

/**
 * Quadratic interpolation
 */
export function quadratic(offset: number, a: number, b: number, c: number): number
{
    return linear(offset, linear(offset, a, b), linear(offset, b, c));
}

/**
 * Cubic interpolation
 */
export function cubic(offset: number, a: number, b: number, c: number, d: number): number
{
    return linear(offset, quadratic(offset, a, b, c), quadratic(offset, b, c, d));
}
