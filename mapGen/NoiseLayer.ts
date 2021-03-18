/**********************************************************/
/* Teng - To be used in LayeredNoise to create noise maps */
/**********************************************************/

import { Size } from "../base/Base";
import { TengObject } from "../base/TengObject";


//#MARKER types
/**
 * Describes the coherent noise algorithm to use
 */
export enum NoiseAlgorithm
{
    Perlin,
    Simplex
}

/**
 * Settings for the coherent noise generation
 */
export interface INoiseAlgorithmSettings
{
    [index: string]: any; // change this
}

//#MARKER class
/**
 * A single layer of noise to be used in coherent noise layering
 */
export class NoiseLayer extends TengObject
{
    readonly size: Size;
    readonly algorithm: NoiseAlgorithm;
    readonly settings: INoiseAlgorithmSettings;

    /**
     * Creates an instance of the NoiseLayer class
     * @param size The size of this layer
     */
    constructor(size: Size, algorithm: NoiseAlgorithm, algorithmSettings: INoiseAlgorithmSettings)
    {
        super("NoiseLayer", `${size.toString()}`);

        this.size = size;
        this.algorithm = algorithm;
        this.settings = algorithmSettings;
    }
    
    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `${this.objectName} <${NoiseAlgorithm[this.algorithm]}> [${this.size.toString()}] - UID: ${this.uid}`;
    }
}
