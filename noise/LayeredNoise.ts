/********************************************************************/
/* Teng - Creates noise maps from multiple layers of coherent noise */
/********************************************************************/

import { Size } from "../base/Base";
import { TengObject } from "../base/TengObject";
import { NoiseLayer, NoiseMap } from "./NoiseLayer";


//#MARKER types
/**
 * Function that is used to calculate the noise layer importance
 * @param currentIdx The index of the current layer (0 based)
 * @param lastVal The importance of the last layer - will be `NaN` on the first layer
 * @param layerAmount The total amount of layers
 * @returns Should return a floating point number between 0.0 and 1.0
 */
export type LayerImportanceFormula = (currentIdx: number, lastVal: number, layerAmount: number) => number;

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

    //#MARKER other

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
     * Resets the importance calculation formula to the default one of `lastVal / 2`
     */
    resetImportanceFormula(): void
    {
        this.importanceFormula = defaultLayerImportanceFormula;
    }

    /**
     * Generates the noise map
     */
    generateMap(): Promise<NoiseMap>
    {
        return new Promise<NoiseMap>(async (res, rej) => {
            let lastImportance = NaN;

            const layerPromises: Promise<void>[] = [];

            // generate layer data:
            this.layers.forEach((layer) => {
                if(!layer.isGenerated())
                    layerPromises.push(layer.generate());
            });

            // even if the layerPromises array is empty, this will still work as intended:
            await Promise.all(layerPromises);


            /** Importances need to be accumulated in order to calculate the final noise values */
            let importanceAccumulator: number = 0;

            const layersData: NoiseMap[] = [];

            // layer data has been generated, so concatenate layers into a single layer now:
            this.layers.forEach((layer, i) => {
                /** Importance is a modifier to noise layers, which dictates how much a layer contributes to the final noise map */
                const importance = this.importanceFormula(i, lastImportance, this.layers.length);
                importanceAccumulator += importance;
                lastImportance = importance;

                // get noise map of current layer
                const currentLayerData: NoiseMap = layer.getData();

                if(currentLayerData.length == 0)
                    return rej(`Error in noise layer #${i} (${layer.toString()}): layer data wasn't generated yet or was reset prior to concatenation`);


                const values: NoiseMap = [];

                currentLayerData.forEach((row, y) => {
                    values.push([]);

                    row.forEach((val) => {
                        values[y].push(importance * val);
                    });
                });

                // #DEBUG# overwrite noiseMap just so there is some output
                // noiseMap = currentLayerData;

                layersData.push(values);
            });

            /*
            >>>> For each cell:

            (layer_number: importance * value = result)

            l1:  1.0  * 0.5  = 0.5
                  +             +
            l2:  0.5  * 0.3  = 0.15
                  +             +
            l3:  0.25 * 0.45 = 0.11
                  =             =
                 1.75          0.76  /  1.75  =  0.43
                  ▼                      ▲
                  └──────────────────────┘
            */
            const finalNoiseMap: NoiseMap = [];
            const layersAmount = layersData.length;

            this.size.forEachPosition(pos => {
                if(finalNoiseMap.length == pos.y)
                    finalNoiseMap.push([]);

                let addedValue = 0.0;

                for(let i = 0; i < layersAmount; i++)
                    addedValue += layersData[i][pos.y][pos.x];


                const finalValue = addedValue / importanceAccumulator;

                finalNoiseMap[pos.y].push(finalValue);
            });

            return res(finalNoiseMap);
        });
    }

    //#MARKER static

    /**
     * Returns the default layer importance calculation formula of `lastVal / 2`
     */
    static getDefaultImportanceFormula(): LayerImportanceFormula
    {
        return defaultLayerImportanceFormula;
    }
}
