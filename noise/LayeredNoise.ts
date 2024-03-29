/********************************************************************/
/* Teng - Creates noise maps from multiple layers of coherent noise */
/********************************************************************/

import { Index2, Size } from "../core/BaseTypes";
import TengObject from "../core/TengObject";
import NoiseLayer, { NoiseMap } from "./NoiseLayer";


//#MARKER types
/**
 * Function that is used to calculate the noise layer importance (how much a layer contributes to the final noise map)
 * @param currentIdx The index of the current layer (0 based)
 * @param lastVal The importance of the last layer - will be `NaN` on the first layer (the layer with index `0`)
 * @param layerAmount The total amount of layers - this value will always stay the same
 * @returns This function has to return a floating point number between 0.0 and 1.0
 */
export type LayerImportanceFormula = (currentIdx: number, lastVal: number, layerAmount: number) => number;

/**
 * The algorithm to use when smoothing a noise map.  
 *   
 * Algorithms:  
 * 
 * | Name | Type | Description |
 * | :-- | :-- | :-- |
 * | `CA_Coarse` | Cellular Automata | Algorithm only looks at the 4 adjacent cells |
 * | `CA_Smooth` | Cellular Automata | Algorithm looks at the 8 adjacent cells |
 * | `CA_ExtraSmooth` | Cellular Automata | Algorithm looks at 20 adjacent cells |
 */
export type SmoothingAlgorithm = "CA_Coarse" | "CA_Smooth" | "CA_ExtraSmooth";


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
export default class LayeredNoise extends TengObject
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
     * Overrides the default importance calculation formula.  
     * You should probably look at the in-IDE documentation of the `LayerImportanceFormula` type to understand how to use it.
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

    //#MARKER generate

    /**
     * Uses the layers added to this LayeredNoise instance and the previously defined importance formula to calculate a single noise map.  
     * Add layers using the method `addLayer()`.  
     * The importance formula describes how much each layer contributes to the final noise map. Change it with the method `setImportanceFormula()`.
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
            let accumulatedImportances: number = 0;

            const layersData: NoiseMap[] = [];

            // layer data has been generated, so concatenate layers into a single layer now:
            this.layers.forEach((layer, i) => {
                /** Importance is a modifier to noise layers, which dictates how much a layer contributes to the final noise map */
                const importance = this.importanceFormula(i, lastImportance, this.layers.length);

                // if the formula is invalid, throw an error
                if(typeof importance !== "number" || importance < 0.0 || importance > 1.0 || isNaN(importance))
                    throw new TypeError(`Error in layer importance formula.\nPassed parameters { index=${i}, last_importance=${lastImportance}, layers_amount=${this.layers.length} } yielded an invalid value of ${importance} (expected number between 0.0 and 1.0)`);

                accumulatedImportances += importance;
                lastImportance = importance;

                // get noise map of current layer
                const currentLayerData: NoiseMap = layer.getData();

                if(currentLayerData.length == 0)
                    return rej(`Error in noise layer #${i} (${layer.toString()}): layer data wasn't generated yet or was reset prior to concatenation`);


                const values: NoiseMap = [];

                // go through the current layer data & apply the first part of the noise map value calculation formula (importance * value)
                currentLayerData.forEach((row, y) => {
                    values.push([]);

                    row.forEach((val) => {
                        values[y].push(importance * val);
                    });
                });

                layersData.push(values);
            });

            /*
            noise map value calculation formula
            -----------------------------------

            >>>> For each cell:

            A: importance
            B: value of current cell
            C: result

            l0:  A1 * B1 = C1
            l1:  A2 * B2 = C2

            result = (C1 + C2) / (A1 + A2)




            Example (3 layers):

            l1:  1.0  * 0.5  = 0.5
                  +             +
            l2:  0.5  * 0.3  = 0.15
                  +             +
            l3:  0.25 * 0.45 = 0.11
                  =             =
                 1.75          0.76  /  1.75  =  0.43
                  ▼                      ▲      └────┘
                  └──────────────────────┘      result
            */
            const finalNoiseMap: NoiseMap = [];
            const layersAmount = layersData.length;

            // go through each position of the final noise map
            this.size.forEachPosition(pos => {
                if(finalNoiseMap.length == pos.y)
                    finalNoiseMap.push([]);

                let sumValues = 0.0;

                // add the values from every layer but at the same exact position together:
                for(let i = 0; i < layersAmount; i++)
                    sumValues += layersData[i][pos.y][pos.x];


                // apply the final part of the noise map value calculation formula (sumValues / accumulatedImportances)
                const finalValue = sumValues / accumulatedImportances;

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

    /**
     * Uses a smoothing algorithm to smoothen out anomalies in a noise map and make it look more organic
     */
    static smoothMap(noiseMap: NoiseMap, algorithm: SmoothingAlgorithm, passes: number = 1): Promise<NoiseMap>
    {
        return new Promise<NoiseMap>((res) => {
            for(let i = 0; i < passes; i++)
            {
                switch(algorithm)
                {
                    //#SECTION Cellular Automata
                    case "CA_Coarse":
                    case "CA_Smooth":
                    case "CA_ExtraSmooth":
                        noiseMap.forEach((row, y) => {
                            row.forEach((noiseVal, x) => {
                                const adjacentCellIndexes: Index2[] = [];


                                //  ▒ ▒ ▒ ▒ ▒
                                //  ▒ ▒ ▒ ▒ ▒
                                //  ▒ ▒ ■ ▒ ▒
                                //  ▒ ▒ ▒ ▒ ▒
                                //  ▒ ▒ ▒ ▒ ▒

                                adjacentCellIndexes.push(new Index2(x, y));


                                switch(algorithm)
                                {
                                    case "CA_ExtraSmooth":
                                        //  ▒ ■ ■ ■ ▒
                                        //  ■ ▒ ▒ ▒ ■
                                        //  ■ ▒ ▒ ▒ ■
                                        //  ■ ▒ ▒ ▒ ■
                                        //  ▒ ■ ■ ■ ▒

                                        adjacentCellIndexes.push(new Index2(x - 1, y - 2)); // NNW
                                        adjacentCellIndexes.push(new Index2(x,     y - 2)); // NN
                                        adjacentCellIndexes.push(new Index2(x + 1, y - 2)); // NNE

                                        adjacentCellIndexes.push(new Index2(x + 2, y - 1)); // EEN
                                        adjacentCellIndexes.push(new Index2(x + 2, y    )); // EE
                                        adjacentCellIndexes.push(new Index2(x + 2, y + 1)); // EES

                                        adjacentCellIndexes.push(new Index2(x + 1, y + 2)); // SSE
                                        adjacentCellIndexes.push(new Index2(x    , y + 2)); // SS
                                        adjacentCellIndexes.push(new Index2(x - 1, y + 2)); // SSW

                                        adjacentCellIndexes.push(new Index2(x - 2, y + 1)); // WWS
                                        adjacentCellIndexes.push(new Index2(x - 2, y    )); // WW
                                        adjacentCellIndexes.push(new Index2(x - 2, y - 1)); // WWN

                                        // falls through

                                    case "CA_Smooth":
                                        //  ▒ ▒ ▒ ▒ ▒
                                        //  ▒ ■ ▒ ■ ▒
                                        //  ▒ ▒ ▒ ▒ ▒
                                        //  ▒ ■ ▒ ■ ▒
                                        //  ▒ ▒ ▒ ▒ ▒

                                        adjacentCellIndexes.push(new Index2(x - 1, y - 1)); // NW
                                        adjacentCellIndexes.push(new Index2(x + 1, y - 1)); // NE
                                        adjacentCellIndexes.push(new Index2(x + 1, y + 1)); // SE
                                        adjacentCellIndexes.push(new Index2(x - 1, y + 1)); // SW

                                        // falls through

                                    case "CA_Coarse":
                                        //  ▒ ▒ ▒ ▒ ▒
                                        //  ▒ ▒ ■ ▒ ▒
                                        //  ▒ ■ ▒ ■ ▒
                                        //  ▒ ▒ ■ ▒ ▒
                                        //  ▒ ▒ ▒ ▒ ▒

                                        adjacentCellIndexes.push(new Index2(x,     y - 1)); // N
                                        adjacentCellIndexes.push(new Index2(x + 1, y    )); // E
                                        adjacentCellIndexes.push(new Index2(x,     y + 1)); // S
                                        adjacentCellIndexes.push(new Index2(x - 1, y    )); // W


                                    break;
                                }


                                // go through indexes, check if they exist and then apply cellular automata based algorithm:

                                let accumulatedValues = 0;
                                let valuesAmount = 0;

                                adjacentCellIndexes.forEach(idx => {
                                    if(Array.isArray(noiseMap[idx.y]))
                                        if(typeof noiseMap[idx.y][idx.x] === "number")
                                        {
                                            accumulatedValues += noiseMap[idx.y][idx.x];
                                            valuesAmount++;
                                        }
                                });


                                const average = accumulatedValues / valuesAmount;

                                noiseMap[y][x] = average;
                            });
                        });
                    break;
                }
            }

            return res(noiseMap);
        });
    }
}
