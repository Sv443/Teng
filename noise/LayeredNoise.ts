/********************************************************************/
/* Teng - Creates noise maps from multiple layers of coherent noise */
/********************************************************************/

import { Size } from "../base/Base";
import { TengObject } from "../base/TengObject";
import { NoiseLayer } from "./NoiseLayer";


//#MARKER types
/**
 * Function that is used to calculate the noise layer importance
 * @param currentIdx The index of the current layer (0 based)
 * @param lastVal The importance of the last layer - will be `NaN` on the first layer
 * @param layerAmount The total amount of layers
 * @returns Should return a floating point number between 0.0 and 1.0
 */
export type LayerImportanceFormula = (currentIdx: number, lastVal: number, layerAmount: number) => number;

/**
 * A 2D array of noise values
 */
export type NoiseMap = number[][];

const defaultLayerImportanceFormula: LayerImportanceFormula = (currentIdx, lastVal, layerAmount) => {
    if(isNaN(lastVal))
        return 1.0;
    else
        return lastVal / 2;
};

//#MARKER class
/**
 * This class layers multiple instances of the NoiseLayer class on top of each other, producing a coherent noise map
 */
export class LayeredNoise extends TengObject
{
    private importanceFormula: LayerImportanceFormula = defaultLayerImportanceFormula;

    readonly layers: NoiseLayer[];
    readonly size: Size;

    /**
     * Creates an instance of the LayeredNoise class
     * @param layers The different noise layers to apply. Items with a lower index have the largest effect on the generated noise map.
     * @param size The size of the noise layers
     */
    constructor(size: Size, layers?: NoiseLayer[])
    {
        super("LayeredNoise", `L${layers ? layers.length : 0}_${size.width}x${size.height}`);

        if(layers)
            this.layers = layers;
        else
            this.layers = [];

        this.size = size;
    }

    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `${this.objectName} - ${this.layers.length} layers, size = ${this.size.toString()} - UID: ${this.uid.toString()}`;
    }

    /**
     * Adds a noise layer
     */
    addLayer(layer: NoiseLayer): void
    {
        this.layers.push(layer);
    }

    /**
     * Overrides the default importance calculation formula
     */
    setImportanceFormula(func: LayerImportanceFormula): void
    {
        this.importanceFormula = func;
    }

    /**
     * Generates the noise map
     */
    generateMap(): NoiseMap
    {
        let lastImportance = NaN;

        this.layers.forEach((layer, i) => {
            /** Importance is a modifier to noise layers, which dictates how much a layer contributes to the final noise map */
            const importance = this.importanceFormula(i, lastImportance, this.layers.length);
            lastImportance = importance;

            // TODO:
        });

        return [];
    }
}
