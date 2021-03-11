/******************************/
/* Teng - Grids contain cells */
/******************************/

import {  } from "../../settings";

import { Size, Position, Area, dbg, Color, ColorType } from "../base/Base";
import { TengObject } from "../base/TengObject";

import { Cell } from "./Cell";
import { Land } from "../../game/components/cells/Land";
import { mapRange } from "svcorelib";


/**
 * Options that can be set on a Grid
 */
export interface IGridOptions
{
    [index: string]: any; // change this
}

/**
 * A Grid is the 2D area that contains the game.  
 * It contains all chunks and cells.
 */
export class Grid extends TengObject
{
    private size: Size;
    private area: Area;
    private options: Partial<IGridOptions> = {};

    private cursorApplied = false;
    private cursorPos: Position;

    private cells: Cell[][];


    /**
     * Creates an instance of the Grid class
     * @param size The size of the grid
     * @param options Grid options
     */
    constructor(size: Size, options?: Partial<IGridOptions>)
    {
        super("Grid", `${size.toString()}`);

        this.size = size;

        if(options)
            this.options = options;

        this.area = Grid.calculateArea(size);

        const cursorPos = new Position(Math.floor(size.width / 2), Math.floor(size.height / 2));
        this.cursorPos = cursorPos;

        this.cells = [];
    }

    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        const size = this.getSize(), area = this.getArea();
        return `Grid [${size.toString()}] - area: ${area.toString()} - UID: ${this.uid.toString()}`;
    }

    //#MARKER methods
    /**
     * Call this method on every tick to update the grid - use the GameLoop class for timing.  
     * This call is propagated throughout all cells.
     */
    update(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            // TODO: only update active chunks

            const updatePromises: Promise<void>[] = [];

            this.cells.forEach((row, y) => {
                row.forEach((cell, x) => {
                    if(!this.cursorApplied && this.cursorPos.x === x && this.cursorPos.y === y)
                        cell.setCursorActive(true);

                    updatePromises.push(cell.update());
                });
            });

            try
            {
                await Promise.all(updatePromises);

                return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Tries to bulldoze a cell.  
     * The returned Promise resolves with a boolean value that tells you if the cell could be bulldozed.
     * @param pos The position of the cell to try to bulldoze
     */
    bulldozeCell(pos: Position): Promise<boolean>
    {
        return new Promise<boolean>(async (res) => {
            const bulldozedCell = await this.getCell(pos).bulldoze();

            return res(bulldozedCell);
        });
    }

    /**
     * Moves the cursor from the old position to a new position
     */
    moveCursor(pos: Position): void
    {
        // remove old cursor pos
        this.getCell(this.getCursorPos()).setCursorActive(false);

        // set new cursor pos
        this.getCell(pos).setCursorActive(true);
        this.cursorPos = pos;
    }

    /**
     * Developer method: Fills the grid with empty cells
     */
    devFill(): void
    {
        const size = this.getSize();

        let cells: Cell[][] = [];
        let cellsAmount = 0;

        let colIdx = Color.Green;

        for(let row = 0; row < size.height; row++)
        {
            cells.push([]);

            for(let col = 0; col < size.width; col++)
            {
                const cellPos: Position = {
                    x: col,
                    y: row
                };

                const emptyCell = new Land(cellPos);

                cellsAmount++;
                
                // const colorsAmount = Object.keys(Color).length / 2;

                // if(colIdx == colorsAmount)
                //     colIdx = 1;

                emptyCell.setColor(ColorType.Foreground, colIdx, true);
                // colIdx++;
                
                cells[row].push(emptyCell);
            }
        }

        dbg("Grid", `Filled grid of size ${size.width}x${size.height} with ${cellsAmount} cells`);

        this.setCells(cells);
    }

    /**
     * Sets this grid's cells
     * @param cells 2D array of cells
     */
    setCells(cells: Cell[][]): void
    {
        this.cells = cells;
    }

    /**
     * Sets the cell at the provided position
     * @param position Position of the cell
     * @param cell The cell to set at the provided position
     */
    setCell(position: Position, cell: Cell)
    {
        const size = this.getSize();

        if(
            position.x < 0 || position.y < 0
            || position.x > size.width || position.y > size.height
        )
            throw new TypeError(`Passed cell position is out of range - got [${position.x},${position.y}] - expected between [0,0] and [${size.width},${size.height}]`);

        this.cells[position.x][position.y] = cell;
    }

    //#MARKER static
    /**
     * Calculates the area of a grid based on its size
     * @param size The size of the grid
     */
    static calculateArea(size: Size): Area
    {
        const tl = new Position(0, 0);
        const br = new Position(size.width, size.height);

        return new Area(tl, br);
    }

    //#MARKER getters
    /**
     * Returns the size of this grid
     */
    getSize(): Size
    {
        return this.size;
    }

    /**
     * Returns the area of this grid
     */
    getArea(): Area
    {
        return this.area;
    }

    /**
     * Returns the options of this grid
     */
    getOptions(): IGridOptions
    {
        return this.options;
    }

    /**
     * Returns the 2D array of cells of this grid
     */
    getCells(): Cell[][]
    {
        return this.cells;
    }

    /**
     * Returns the cell at the provided position
     * @param position Position of the cell
     */
    getCell(position: Position): Cell
    {
        const size = this.getSize();

        if(
            position.x < 0 || position.y < 0
            || position.x > size.width || position.y > size.height
        )
            throw new TypeError(`Passed cell position is out of range - got [${position.x},${position.y}] - expected between [0,0] and [${size.width},${size.height}]`);

        return this.cells[position.x][position.y];
    }

    /**
     * Returns the current position of the cursor
     */
    getCursorPos(): Position
    {
        return this.cursorPos;
    }

    //#MARKER static

    /**
     * Checks if the passed value is a Grid
     */
    static isGrid(value: any): value is Grid
    {
        value = (value as Grid);

        if(typeof value.getSize !== "function" || !(value.getSize() instanceof Size))
            return false;

        if(typeof value.getArea !== "function" || !(value.getArea() instanceof Area))
            return false;

        return true;
    }
}
