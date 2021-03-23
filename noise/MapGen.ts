/*****************************************/
/* Teng - Responsible for map generation */
/*****************************************/

import { gameSettings } from "../../settings";

import { Cell } from "../components/Cell";
import { seededRNG } from "svcorelib";
import { NoiseMap } from "./NoiseLayer";
import { Position } from "../base/Base";


/**
 * The preset of a map
 */
export enum MapPreset
{
    Debug
}

/**
 * The algorithm to use when smoothing a noise map.  
 *   
 * Algorithm Types:  
 * 
 * | Prefix | Type |
 * | :-- | :-- |
 * | `CA_` | Cellular Automata |
 */
export enum SmoothingAlgorithm
{
    /** Very coarse filter - only looks at the 4 adjacent cells */
    CA_Coarse,
    /** Pretty smooth filter - looks at the 8 adjacent cells */
    CA_Smooth,
    /** Very smooth filter - looks at 20 adjacent cells */
    CA_ExtraSmooth
}

/**
 * Generates the game world based on a preset and seed
 */
export abstract class MapGen
{
    /**
     * Generates a map based on a preset and seed
     * @param preset
     * @param seed
     */
    static generate(preset: MapPreset, seed?: number): Cell[][]
    {
        if(seed == undefined)
            seed = seededRNG.generateRandomSeed(gameSettings.mapGen.seed.digitCount);

        if(seed < 10000000 || seed > 99999999)
            throw new TypeError(`Provided seed is not 8 digits in length or starts with a 0`);

        let generatedCells: Cell[][] = [];

        // TODO: generate shit, obviously
        switch(preset)
        {
            case MapPreset.Debug:

            break;
        }

        return generatedCells;
    }

    static smoothMap(noiseMap: NoiseMap, algorithm: SmoothingAlgorithm): NoiseMap
    {
        switch(algorithm)
        {
            //#SECTION Cellular Automata
            case SmoothingAlgorithm.CA_Coarse:
            case SmoothingAlgorithm.CA_Smooth:
            case SmoothingAlgorithm.CA_ExtraSmooth:
                noiseMap.forEach((row, y) => {
                    row.forEach((noiseVal, x) => {
                        const adjacentCellIndexes: Position[] = [];


                        //  ▒ ▒ ▒ ▒ ▒
                        //  ▒ ▒ ▒ ▒ ▒
                        //  ▒ ▒ ■ ▒ ▒
                        //  ▒ ▒ ▒ ▒ ▒
                        //  ▒ ▒ ▒ ▒ ▒

                        adjacentCellIndexes.push(new Position(x, y));


                        switch(algorithm)
                        {
                            case SmoothingAlgorithm.CA_ExtraSmooth:
                                //  ▒ ■ ■ ■ ▒
                                //  ■ ▒ ▒ ▒ ■
                                //  ■ ▒ ▒ ▒ ■
                                //  ■ ▒ ▒ ▒ ■
                                //  ▒ ■ ■ ■ ▒

                                adjacentCellIndexes.push(new Position(x - 1, y - 2)); // NNW
                                adjacentCellIndexes.push(new Position(x,     y - 2)); // NN
                                adjacentCellIndexes.push(new Position(x + 1, y - 2)); // NNE

                                adjacentCellIndexes.push(new Position(x + 2, y - 1)); // EEN
                                adjacentCellIndexes.push(new Position(x + 2, y    )); // EE
                                adjacentCellIndexes.push(new Position(x + 2, y + 1)); // EES

                                adjacentCellIndexes.push(new Position(x + 1, y + 2)); // SSE
                                adjacentCellIndexes.push(new Position(x    , y + 2)); // SS
                                adjacentCellIndexes.push(new Position(x - 1, y + 2)); // SSW

                                adjacentCellIndexes.push(new Position(x - 2, y + 1)); // WWS
                                adjacentCellIndexes.push(new Position(x - 2, y    )); // WW
                                adjacentCellIndexes.push(new Position(x - 2, y - 1)); // WWN


                            case SmoothingAlgorithm.CA_Smooth:
                                //  ▒ ▒ ▒ ▒ ▒
                                //  ▒ ■ ▒ ■ ▒
                                //  ▒ ▒ ▒ ▒ ▒
                                //  ▒ ■ ▒ ■ ▒
                                //  ▒ ▒ ▒ ▒ ▒

                                adjacentCellIndexes.push(new Position(x - 1, y - 1)); // NW
                                adjacentCellIndexes.push(new Position(x + 1, y - 1)); // NE
                                adjacentCellIndexes.push(new Position(x + 1, y + 1)); // SE
                                adjacentCellIndexes.push(new Position(x - 1, y + 1)); // SW


                            case SmoothingAlgorithm.CA_Coarse:
                                //  ▒ ▒ ▒ ▒ ▒
                                //  ▒ ▒ ■ ▒ ▒
                                //  ▒ ■ ▒ ■ ▒
                                //  ▒ ▒ ■ ▒ ▒
                                //  ▒ ▒ ▒ ▒ ▒

                                adjacentCellIndexes.push(new Position(x,     y - 1)); // N
                                adjacentCellIndexes.push(new Position(x + 1, y    )); // E
                                adjacentCellIndexes.push(new Position(x,     y + 1)); // S
                                adjacentCellIndexes.push(new Position(x - 1, y    )); // W


                            break;
                        }


                        //TODO: go through indexes, check if they exist and then apply cellular automata base algorithm:
                        adjacentCellIndexes.forEach(pos => {

                        });
                    });
                });
            break;
        }

        return []; // TODO:
    }
}
