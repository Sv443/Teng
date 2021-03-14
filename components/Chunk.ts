/*********************************************************************/
/* Teng - Chunks contain cells. They are used to improve performance */
/*********************************************************************/

import { TengObject } from "../base/TengObject";
import { Area, Position, Size } from "../base/Base";
import { Cell } from "./Cell";


/**
 * Chunks contain cells and are in turn contained in a grid.  
 * They are used to improve the performance.  
 * More info [here.](https://sites.google.com/site/letsmakeavoxelengine/home/chunks)
 */
export class Chunk extends TengObject
{
    /** The index of this chunk inside a parent grid */
    readonly chunkIndex: Position;
    readonly size: Size;
    readonly area: Area;

    private cells: Cell[][] = [];

    /**
     * Creates an instance of the Chunk class
     * @param chunkIndex The index of this chunk inside a parent grid
     * @param area The area that spans the contained cells - also determines the size of this chunk
     * @param cells Optional - initial value of the cells
     */
    constructor(chunkIndex: Position, area: Area, cells?: Cell[][])
    {
        super("Chunk", `${chunkIndex.toString()}/${area.toString()}`);

        this.chunkIndex = chunkIndex;
        this.area = area;
        this.size = Size.fromArea(area);

        if(Array.isArray(cells))
            this.cells = cells;
    }

    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `Chunk @ ${this.chunkIndex.toString()} - size: ${this.size.toString()} - area: ${this.area.toString()} - UID: ${this.uid.toString()}`;
    }

    //#MARKER getters

    /**
     * Returns all cells of this chunk
     */
    getCells(): Cell[][]
    {
        return this.cells;
    }

    /**
     * Returns a single cell of this chunk
     */
    getCell(pos: Position): Cell
    {
        return this.cells[pos.y][pos.x];
    }

    //#MARKER setters

    /**
     * Sets this chunk's cells
     */
    setCells(cells: Cell[][]): void
    {
        this.cells = cells;
    }

    /**
     * Sets a single cell at the given position
     */
    setCell(cell: Cell, pos: Position): void
    {
        this.cells[pos.y][pos.x] = cell;
    }
}
