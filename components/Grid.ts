/******************************/
/* Teng - Grids contain cells */
/******************************/

import { unused } from "svcorelib";
import { DeepPartial } from "tsdef";

import TengObject from "../core/TengObject";
import { Size, Position, Area, dbg, Index2, Newable } from "../core/Base";
import Cell, { IRelativeCellPosition, IAbsoluteCellPosition } from "./Cell";
import InputHandler, { IKeypressObject } from "../input/InputHandler";
import Chunk from "./Chunk";


//#MARKER types

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

const defaultIGridOptions: DeepPartial<IGridOptions> = {
    inputEnabled: false,
    inputStream: process.stdin
};

//#MARKER class

/**
 * A Grid is the 2D area that contains the game.  
 * It contains all chunks and cells.
 */
export default class Grid extends TengObject
{
    private gridSize: Size;
    private chunkSize: Size;
    private area: Area;
    private options: DeepPartial<IGridOptions>;

    private inputHandler: InputHandler | undefined;

    private chunks: Chunk[][];


    /**
     * Creates an instance of the Grid class
     * @param gridSize The size of the grid
     * @param chunkSize The size of the chunks
     * @param chunks Optional initialization value of this grid's chunks
     * @param options Grid options
     * @throws TypeError if the grid size is not a multiple of the chunk size
     */
    constructor(gridSize: Size, chunkSize: Size, chunks?: Chunk[][], options?: DeepPartial<IGridOptions>)
    {
        super("Grid", `${gridSize.toString()}`);

        // check if chunk size is valid
        if(!gridSize.isMultipleOf(chunkSize))
            throw new TypeError(`Grid size is not a multiple of the chunk size`);

        this.gridSize = gridSize;
        this.chunkSize = chunkSize;

        this.options = { ...defaultIGridOptions, ...options };

        this.area = Grid.calculateArea(this.gridSize);

        // set initial cursor pos, at the center of the grid
        // const cursorPos = new Position(Math.floor(gridSize.width / 2), Math.floor(gridSize.height / 2));

        if(options?.inputEnabled === true)
        {
            this.inputHandler = new InputHandler((options.inputStream as NodeJS.ReadStream) || process.stdin);

            this.inputHandler.on("key", (char: string, key: IKeypressObject | undefined) => {
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
        const size = this.getGridSize(), area = this.getArea();
        return `${this.objectName} [${size.toString()}] with area: ${area.toString()} - UID: ${this.uid.toString()}`;
    }

    //#MARKER methods
    /**
     * Call this method on every tick to update the grid - use the GameLoop class for timing.  
     * This call is propagated throughout all chunks and cells.
     */
    update(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            const updatePromises: Promise<void>[] = [];

            this.chunks.forEach((row, y) => {
                row.forEach((chunk, x) => {
                    // if chunk is inactive, continue with the next chunk:
                    if(!chunk.isActive())
                        return;

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
     * TODO: rewrite
     */
    keyPress(char: string, key: IKeypressObject | undefined): void
    {
        // if(!this.getOptions().inputEnabled)
        //     return;
        
        // let { x, y } = this.cursorPos;

        // switch(key.name)
        // {
        //     case "left":
        //         if(x > 0)
        //             x--;
        //     break;
        //     case "right":
        //         if(x < (this.getGridSize().width - 1))
        //             x++;
        //     break;
        //     case "up":
        //         if(y > 0)
        //             y--;
        //     break;
        //     case "down":
        //         if(y < (this.getGridSize().height - 1))
        //             y++;
        //     break;

        //     default: return;
        // }

        // this.moveCursor(new Position(x, y));
    }

    /**
     * Tries to bulldoze a cell.  
     * The returned Promise resolves with a boolean value that tells you if the cell could be bulldozed.
     * @param pos The position of the cell to try to bulldoze
     */
    bulldozeCell(pos: Position): Promise<boolean>
    {
        return new Promise<boolean>(async (res) => {
            try
            {
                const relativePos = Grid.absoluteCellPosToRelative({
                    absolutePos: pos,
                    chunkSize: this.getChunkSize()
                });

                let canBulldozeCell = this.getCell(relativePos.chunkIdx, relativePos.relativePos).bulldoze();

                if(canBulldozeCell instanceof Promise)
                    canBulldozeCell = await canBulldozeCell;

                //TODO: actually bulldoze

                return res(true);
            }
            catch(err)
            {
                unused(err); // TODO: do something with the error

                // some error occurred so better not bulldoze this cell
                return res(false);
            }
        });
    }

    /**
     * Moves the cursor from the old position to a new position
     */
    moveCursor(pos: Position): void
    {
        // TODO: rewrite
    }

    /**
     * Developer method: Fills the grid with empty cells
     * @param CellClass A non-abstract class that inherits from Cell
     */
    devFill(CellClass: Newable<Cell>): void
    {
        const gridSize = this.getGridSize();
        const chunkSize = this.getChunkSize();

        // find out max possible chunk index, which guides the chunk creation
        const chunkMaxIndex = new Position((gridSize.width / chunkSize.width - 1), (gridSize.height / chunkSize.height - 1));

        let cellsAmount = 0;
        let chunksAmount = 0;


        // create chunks
        for(let chy = 0; chy <= chunkMaxIndex.y; chy++)
        {
            for(let chx = 0; chx <= chunkMaxIndex.x; chx++)
            {
                const chunkIndex = new Index2(chx, chy);
                const chunkArea = Area.fromChunkIndex(chunkIndex, chunkSize);


                // create cells inside chunk
                const cells: Cell[][] = [];

                for(let cellY = 0; cellY < chunkSize.height; cellY++)
                {
                    cells.push([]);

                    for(let cellX = 0; cellX < chunkSize.width; cellX++)
                    {
                        const cell = new CellClass(new Position(cellX, cellY));

                        cells[cellY].push(cell);
                        cellsAmount++;
                    }
                }

                const chunk = new Chunk(chunkIndex, chunkArea, cells);

                this.setChunk(chunkIndex, chunk);
                chunksAmount++;
            }
        }

        dbg("Grid", `Filled grid of size ${gridSize.toString()} with ${cellsAmount} total cells // ${chunksAmount} chunks with ${cellsAmount / chunksAmount} cells each`);
    }

    //#MARKER setters
    /**
     * Sets the cells of a chunk
     * @param chunkIndex The index of the chunk
     * @param cells 2D array of cells
     */
    setCells(chunkIndex: Index2, cells: Cell[][]): void
    {
        // TODO: error if no chunks present yet: TypeError: Cannot read property 'setCells' of undefined
        this.chunks[chunkIndex.y][chunkIndex.x].setCells(cells);
    }

    /**
     * Sets a chunk at the specified chunk index
     * @param chunkIndex The index of the chunk
     * @param chunk The chunk to set
     */
    setChunk(chunkIndex: Index2, chunk: Chunk): void
    {
        if(!this.chunks[chunkIndex.y] && chunkIndex.y === this.chunks.length)
            this.chunks.push([]);

        this.chunks[chunkIndex.y][chunkIndex.x] = chunk;
    }

    /**
     * Sets the cell at the provided position
     * @param chunkIndex The index of the chunk
     * @param cellPosition Position of the cell inside the chunk
     * @param cell The cell to set at the provided position
     */
    setCell(chunkIndex: Index2, cellPosition: Position, cell: Cell)
    {
        const size = this.getGridSize();

        if(
            cellPosition.x < 0 || cellPosition.y < 0
            || cellPosition.x > size.width || cellPosition.y > size.height
        )
            throw new TypeError(`Passed cell position is out of range - got [${cellPosition.x},${cellPosition.y}] - expected between [0,0] and [${size.width - 1},${size.height - 1}]`);

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
    getGridSize(): Size
    {
        return this.gridSize;
    }

    /**
     * Returns the size of the chunks in this grid
     */
    getChunkSize(): Size
    {
        return this.chunkSize;
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
    getOptions(): DeepPartial<IGridOptions>
    {
        return this.options;
    }

    /**
     * Returns the 2D array of cells of a chunk at the specified index
     */
    getCells(chunkIdx: Index2): Cell[][]
    {
        return this.chunks[chunkIdx.y][chunkIdx.x].getCells();
    }

    /**
     * Returns the chunk at the specified index
     */
    getChunk(chunkIdx: Index2): Chunk
    {
        return this.chunks[chunkIdx.y][chunkIdx.x];
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
    getCell(chunkIdx: Index2, cellPosition: Position): Cell
    {
        const size = this.getGridSize();

        if(
            cellPosition.x < 0 || cellPosition.y < 0
            || cellPosition.x > size.width || cellPosition.y > size.height
        )
            throw new TypeError(`Passed cell position is out of range - got [${cellPosition.x},${cellPosition.y}] - expected between [0,0] and [${size.width - 1},${size.height - 1}]`);

        return this.chunks[chunkIdx.y][chunkIdx.x].getCell(cellPosition);
    }

    /**
     * Returns the current position of the cursor  
     * // TODO: fix (currently just returns [0, 0])
     */
    getCursorPos(): Position
    {
        // return this.cursorPos;
        return new Position(0, 0);
    }

    /**
     * Returns the biggest chunk index from the currently set chunks
     */
    getMaxChunkIdx(): Position
    {
        return new Position((this.chunks[0].length - 1), (this.chunks.length - 1));
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
