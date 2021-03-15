/******************************/
/* Teng - Grids contain cells */
/******************************/

import {  } from "../../settings";

import { Size, Position, Area, dbg, Color, ColorType } from "../base/Base";
import { TengObject } from "../base/TengObject";

import { Cell, IRelativeCellPosition, IAbsoluteCellPosition } from "./Cell";
import { Land } from "../../game/components/cells/Land";
import { InputHandler, KeypressObject } from "../input/InputHandler";
import { Chunk } from "./Chunk";
import { tengSettings } from "../settings";


/**
 * Options that can be set on a Grid
 */
export interface IGridOptions
{
    [index: string]: boolean | NodeJS.ReadStream | undefined;

    /** Whether or not basic controls should be enabled initially - can be modified with `setInputEnabled()` */
    inputEnabled: boolean;
    /** The read stream to use when `inputEnabled` is set to `true` */
    inputStream: NodeJS.ReadStream;
}

/**
 * A Grid is the 2D area that contains the game.  
 * It contains all chunks and cells.
 */
export class Grid extends TengObject
{
    private gridSize: Size;
    private chunkSize: Size;
    private area: Area;
    private options: Partial<IGridOptions> = {};

    private cursorApplied = false;
    private cursorPos: Position;

    private inputHandler: InputHandler | undefined;

    private chunks: Chunk[][];


    /**
     * Creates an instance of the Grid class
     * @param gridSize The size of the grid
     * @param chunkSize The size of the chunks
     * @param chunks Optional initialization value of this grid's chunks
     * @param options Grid options
     */
    constructor(gridSize: Size, chunkSize: Size, chunks?: Chunk[][], options?: Partial<IGridOptions>)
    {
        super("Grid", `${gridSize.toString()}`);

        this.gridSize = gridSize;
        this.chunkSize = chunkSize;

        if(options)
            this.options = options;

        this.area = Grid.calculateArea(gridSize);

        const cursorPos = new Position(Math.floor(gridSize.width / 2), Math.floor(gridSize.height / 2));
        this.cursorPos = cursorPos;

        if(options?.inputEnabled === true)
        {
            this.inputHandler = new InputHandler(options.inputStream || process.stdin);

            this.inputHandler.on("key", (char, key) => {
                this.keyPress(char, key);
            });
        }

        if(Array.isArray(chunks))
            this.chunks = chunks;
        else
            this.chunks = [];
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
     * This call is propagated throughout all chunks and cells.
     */
    update(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            // TODO: only update active chunks

            const updatePromises: Promise<void>[] = [];

            this.chunks.forEach((row, y) => {
                row.forEach((chunk, x) => {
                    // TODO: move to chunk's update()
                    // if(!this.cursorApplied && this.cursorPos.x === x && this.cursorPos.y === y)
                    //     cell.setCursorActive(true);

                    updatePromises.push(chunk.update());
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
     * Handles the default inputs
     */
    keyPress(char: string, key: KeypressObject): void
    {
        if(!this.getOptions().inputEnabled)
            return;
        
        let { x, y } = this.cursorPos;

        switch(key.name)
        {
            case "left":
                if(x > 0)
                    x--;
            break;
            case "right":
                if(x < (this.getSize().width - 1))
                    x++;
            break;
            case "up":
                if(y > 0)
                    y--;
            break;
            case "down":
                if(y < (this.getSize().height - 1))
                    y++;
            break;

            default: return;
        }

        this.moveCursor(new Position(x, y));
    }

    /**
     * Tries to bulldoze a cell.  
     * The returned Promise resolves with a boolean value that tells you if the cell could be bulldozed.
     * @param pos The position of the cell to try to bulldoze
     */
    bulldozeCell(pos: Position): Promise<boolean>
    {
        return new Promise<boolean>(async (res) => {
            // TODO: fix
            // const bulldozedCell = await this.getCell(pos).bulldoze();

            // return res(bulldozedCell);
            return res(false);
        });
    }

    /**
     * Moves the cursor from the old position to a new position
     */
    moveCursor(pos: Position): void
    {
        // TODO: fix
        // remove old cursor pos
        const oldCursorPos = this.getCursorPos();
        // this.getCell(oldCursorPos).setCursorActive(false);

        // set new cursor pos
        // this.getCell(pos).setCursorActive(true);
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

        // TODO:
        // this.setCells(cells);
    }

    //#MARKER setters
    /**
     * Sets the cells of a chunk
     * @param chunkIndex The index of the chunk
     * @param cells 2D array of cells
     */
    setCells(chunkIndex: Position, cells: Cell[][]): void
    {
        this.chunks[chunkIndex.y][chunkIndex.x].setCells(cells);
    }

    /**
     * Sets the cell at the provided position
     * @param chunkIndex The index of the chunk
     * @param cellPosition Position of the cell inside the chunk
     * @param cell The cell to set at the provided position
     */
    setCell(chunkIndex: Position, cellPosition: Position, cell: Cell)
    {
        const size = this.getSize();

        if(
            cellPosition.x < 0 || cellPosition.y < 0
            || cellPosition.x > size.width || cellPosition.y > size.height
        )
            throw new TypeError(`Passed cell position is out of range - got [${cellPosition.x},${cellPosition.y}] - expected between [0,0] and [${size.width},${size.height}]`);

        this.chunks[chunkIndex.y][chunkIndex.x].setCell(cell, cellPosition);
    }

    /**
     * Used to enable or disable the default grid controls
     */
    setInputEnabled(inputEnabled: boolean): void
    {
        this.options.inputEnabled = inputEnabled;
    }

    //#MARKER getters
    /**
     * Returns the size of this grid
     */
    getSize(): Size
    {
        return this.gridSize;
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
    getOptions(): Partial<IGridOptions>
    {
        return this.options;
    }

    /**
     * Returns the 2D array of cells of this grid
     */
    getCells(chunkIdx: Position): Cell[][]
    {
        return this.chunks[chunkIdx.y][chunkIdx.x].getCells();
    }

    /**
     * Returns the state of the basic grid input
     */
    getInputEnabled(): boolean
    {
        return this.getOptions().inputEnabled === true;
    }

    /**
     * Returns the cell at the provided position
     * @param chunkIdx The index of the chunk
     * @param cellPosition Position of the cell within the chunk
     */
    getCell(chunkIdx: Position, cellPosition: Position): Cell
    {
        const size = this.getSize();

        if(
            cellPosition.x < 0 || cellPosition.y < 0
            || cellPosition.x > size.width || cellPosition.y > size.height
        )
            throw new TypeError(`Passed cell position is out of range - got [${cellPosition.x},${cellPosition.y}] - expected between [0,0] and [${size.width},${size.height}]`);

        return this.chunks[chunkIdx.y][chunkIdx.x].getCell(cellPosition);
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
     * Calculates the area of a grid based on its size
     * @param size The size of the grid
     */
    static calculateArea(size: Size): Area
    {
        const tl = new Position(0, 0);
        const br = new Position(size.width, size.height);

        return new Area(tl, br);
    }

    /**
     * Checks if the passed value is a Grid
     */
    static isGrid(value: any): value is Grid
    {
        if(!value)
            return false;

        value = (value as Grid);

        if(typeof value.getSize !== "function" || !(value.getSize() instanceof Size))
            return false;

        if(typeof value.getArea !== "function" || !(value.getArea() instanceof Area))
            return false;

        return true;
    }

    /**
     * Turns a passed absolute cell position (relative to the grid) into a chunk index and cell pos relative to its parent chunk
     */
    static absoluteCellPosToRelative(absPos: IAbsoluteCellPosition): IRelativeCellPosition
    {
        const { absolutePos, chunkSize } = absPos;

        // some magic bitshift fuckery to find out chunk index - stolen from https://stackoverflow.com/a/14494439
        const chunkIdx = new Position(((absolutePos.x / chunkSize.width) >> 0), ((absolutePos.y / chunkSize.height) >> 0));
        // simple trick to find out relative cell position
        const relativePos = new Position((absolutePos.x % chunkSize.width), (absolutePos.y % chunkSize.height));

        return { chunkIdx, relativePos, chunkSize };
    }

    /**
     * Turns the passed relative cell position (relative to its parent chunk) into an absolute position, relative to the parent grid
     */
    static relativeCellPosToAbsolute(relPos: IRelativeCellPosition): IAbsoluteCellPosition
    {
        const { relativePos, chunkIdx, chunkSize } = relPos;

        const absolutePos = new Position((chunkIdx.x * chunkSize.width + relativePos.x), (chunkIdx.y * chunkSize.height + relativePos.y));

        return { absolutePos, chunkSize };
    }
}
