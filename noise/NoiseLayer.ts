/**********************************************************/
/* Teng - To be used in LayeredNoise to create noise maps */
/**********************************************************/

import Perlin from "pf-perlin";
import Simplex from "simplex-noise";
import { seededRNG } from "svcorelib";

import { Size } from "../base/Base";
import { TengObject } from "../base/TengObject";
import { tengSettings } from "../settings";


//#MARKER types
/**
 * Describes the coherent noise algorithm to use
 */
export enum Algorithm
{
    Perlin,
    Simplex
}

/**
 * Settings for the coherent noise generation
 */
export interface INoiseAlgorithmSettings
{
    [index: string]: string | number;

    seed: string;
    resolution: number;
}

/**
 * A 2D array of noise values
 */
export type NoiseMap = number[][];

//#MARKER class
/**
 * A two-dimensional layer of noise to be used in coherent noise layering
 */
export class NoiseLayer extends TengObject
{
    readonly size: Size;
    readonly algorithm: Algorithm;
    readonly settings: Partial<INoiseAlgorithmSettings>;

    /** The noise map data. Created by calling the `generate()` method */
    private data: NoiseMap = [];
    /** Is set to `true` if the noise map data is generated. */
    private generated = false;

    /** The noise generator that will be used to generate the noise map */
    readonly generator: Perlin | Simplex;

    /**
     * Creates an instance of the NoiseLayer class
     * @param size The size of this layer
     */
    constructor(size: Size, algorithm: Algorithm, algorithmSettings?: Partial<INoiseAlgorithmSettings>)
    {
        super("NoiseLayer", `${size.toString()}`);

        this.size = size;
        this.algorithm = algorithm;

        if(algorithmSettings)
            this.settings = algorithmSettings;
        else
            this.settings = {};

        const seed = (this.settings.seed || seededRNG.generateRandomSeed(10).toString());

        // overwrite seed in case it was randomly generated:
        this.settings.seed = seed;

        // set up noise generator based on algorithm:
        switch(algorithm)
        {
            case Algorithm.Perlin:
                this.generator = new Perlin({
                    dimensions: 2,
                    seed
                });
            break;
            case Algorithm.Simplex:
                this.generator = new Simplex(seed);
            break;
        }
    }
    
    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `${this.objectName} <${Algorithm[this.algorithm]}> [${this.size.toString()}] - UID: ${this.uid.toString()}`;
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
                            case Algorithm.Perlin:
                                // needed so TypeScript shuts up:
                                if(this.generator instanceof Perlin)
                                    value = this.generator.get([ x / resolution, y / resolution ]);
                            break;
                            case Algorithm.Simplex:
                                // needed so TypeScript shuts up:
                                if(this.generator instanceof Simplex)
                                    value = this.generator.noise2D(x / resolution, y / resolution);
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