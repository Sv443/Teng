/**
 * ### [pf-perlin](https://www.npmjs.com/package/pf-perlin)
 * N-Dimensional Perlin Noise Generator
 * @author pillowfication
 */
declare module "pf-perlin"
{
    interface IPerlinOptions
    {
        /** RNG's seed - using the same seed will yield the same noise map */
        seed: string;
        /** The number of spatial dimensions. Specifies the number of coordinates that can be used in `get()` */
        dimensions: number;
        /** Minimum value returned */
        min: number;
        /** Maximum value returned */
        max: number;
        /** Size of the first octave */
        wavelength: number;
        /** Number of octaves to sample */
        octaves: number;
        /** Scaling for successive octaves */
        octaveScale: number;
        /** Weight for successive octaves */
        persistence: number;
        /** Interpolation function used */
        interpolation: () => void;
    }

    /**
     * Represents a Perlin noise generator.
     */
    class Perlin
    {
        /**
         * Creates an instance of the Perlin noise generator.
         * @param options An object of options. All options are optional.
         */
        constructor(options?: Partial<IPerlinOptions>);

        /**
         * Returns the value of the noise map at the specified coordinates
         * @param coordinates The data point to get. The length of this array should match dimensions.
         * @returns a floating point number between `0.0` and `1.0`
         */
        get(coordinates: number[]): number;
    }

    export = Perlin;
}
