/**********************************************************/
/* Teng - To be used in LayeredNoise to create noise maps */
/**********************************************************/

import Perlin from "pf-perlin";
import Simplex from "simplex-noise";
import { seededRNG } from "svcorelib";
import { DeepPartial } from "tsdef";

import TengObject from "../core/TengObject";
import { Size } from "../core/BaseTypes";

import { tengSettings } from "../settings";


//#MARKER types

/**
 * Describes the coherent noise algorithm to use
 */
export type NoiseAlgorithm = "Perlin" | "Simplex";

/**
 * Settings for the coherent noise generation
 */
export interface INoiseAlgorithmSettings
{
    [index: string]: string | number | undefined;

    /** Using the same seed will yield the same noise map. Leave empty to generate a random seed. Use `getSeed()` to read the set or generated seed. */
    seed: number;
    /** Higher number = more zoomed in / smooth noise - Base level is around 30-100 */
    resolution: number;
}

const defaultINoiseAlgorithmSettings: INoiseAlgorithmSettings = {
    seed: seededRNG.generateRandomSeed(tengSettings.game.noise.defaultSeedLength),
    resolution: 75
};

declare type CoherentRNG = Perlin | Simplex;

/**
 * A 2D array of noise values
 */
export type NoiseMap = number[][];

//#MARKER class
/**
 * A two-dimensional layer of noise to be used in coherent noise layering
 */
export default class NoiseLayer extends TengObject
{
    readonly size: Size;
    readonly algorithm: NoiseAlgorithm;
    readonly settings: INoiseAlgorithmSettings;

    /** The noise map data. Created by calling the `generate()` method */
    private data: NoiseMap = [];
    /** Is set to `true` if the noise map data is generated. */
    private generated = false;

    /** The noise generator that will be used to generate the noise map */
    readonly generator: CoherentRNG;

    /**
     * Creates an instance of the NoiseLayer class
     * @param size The size of this layer
     */
    constructor(size: Size, algorithm: NoiseAlgorithm, algorithmSettings?: DeepPartial<INoiseAlgorithmSettings>)
    {
        super("NoiseLayer", `${size.toString()}`);

        this.size = size;
        this.algorithm = algorithm;

        this.settings = { ...defaultINoiseAlgorithmSettings, ...algorithmSettings };

        // randomly generate seed if it isn't set for some reason even though it should:
        this.settings.seed = (this.settings.seed || seededRNG.generateRandomSeed(tengSettings.game.noise.defaultSeedLength));

        // set up noise generator based on algorithm:
        switch(algorithm)
        {
            case "Perlin":
                this.generator = new Perlin({
                    dimensions: 2,
                    seed: this.settings.seed.toString()
                });
            break;
            case "Simplex":
                this.generator = new Simplex(this.settings.seed.toString());
            break;
        }
    }

    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `${this.objectName} <${this.algorithm}> [${this.size.toString()}] - UID: ${this.uid.toString()}`;
    }

    //#MARKER other

    /**
     * Generates this noise layer.  
     * Use `getData()` after to get the generated data.
     */
    generate(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            try
            {
                const resolution = this.settings.resolution || tengSettings.game.noise.defaultResolution;
                
                for(let y = 0; y < this.size.height; y++)
                {
                    this.data.push([]);

                    for(let x = 0; x < this.size.width; x++)
                    {
                        let value: number = NaN;

                        switch(this.algorithm)
                        {
                            case "Perlin":
                                value = (this.generator as Perlin).get([ x / resolution, y / resolution ]);
                            break;
                            case "Simplex":
                                value = (this.generator as Simplex).noise2D(x / resolution, y / resolution);
                            break;
                        }

                        // push generated value onto NoiseMap data
                        this.data[y].push(value);
                    }
                }

                this.generated = true;
                return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Returns the noise map data that has been created with `generate()`  
     * Returns an empty array if the map wasn't generated yet
     */
    getData(): NoiseMap
    {
        return this.data;
    }

    /**
     * Sets the seed of this layer
     */
    setSeed(seed: number): void
    {
        this.settings.seed = seed;
    }

    /**
     * Returns the seed that has been set or randomly generated.  
     * Returns `NaN` if no seed was found.
     */
    getSeed(): number
    {
        return this.settings?.seed || NaN;
    }

    /**
     * Returns the state of the noise map generation
     */
    isGenerated(): boolean
    {
        return this.generated;
    }

    /**
     * Resets the noise map data
     */
    reset(): void
    {
        this.generated = false;
        this.data = [];
    }
}
