/*************************************************************/
/* Teng - Cells are the smallest parts that make up the game */
/*************************************************************/

import { Position, Color, ColorType, Size, Index2 } from "../base/Base";
import TengObject from "../base/TengObject";


/**
 * Describes a position of a specific cell inside a specific chunk of a grid
 */
export interface IRelativeCellPosition
{
    [index: string]: Index2 | Position | Size;

    /** The chunk's index inside its parent **grid** */
    chunkIdx: Index2;
    /** The position of a cell inside its parent **chunk** */
    relativePos: Position;
    /** The size of the chunks */
    chunkSize: Size;
}
 
/**
 * Describes the position of a specific cell inside its parent grid, disregarding its parent chunk
 */
export interface IAbsoluteCellPosition
{
    [index: string]: Position | Size;

    /** The absolute position of a specific cell in its parent **grid**, disregarding its parent chunk */
    absolutePos: Position;
    /** The size of the chunks */
    chunkSize: Size;
}
 

/**
 * Describes all colors a cell can have
 */
export interface ICellColors
{
    [index: string]: Color | boolean;

    /** Foreground / text color */
    fg: Color;
    /** Whether the foreground color is dim */
    fgDim: boolean;
    /** Background color */
    bg: Color;
    /** Whether the background color is dim */
    bgDim: boolean;
    /** Whether the cursor is active on this cell */
    cursorActive: boolean;
}

/**
 * Describes a single cell.  
 * Cells have to be contained in a Grid or Chunk.
 */
export abstract class Cell extends TengObject
{
    protected position: Position;

    protected char: string;

    /** The colors of this cell */
    protected colors: ICellColors = {
        fg: Color.White,
        fgDim: false,
        bg: Color.Black,
        bgDim: false,
        cursorActive: false
    };

    protected cursorActive: boolean = false;


    // TODO: make position of cell optional (settable at a later time)
    /**
     * Constructs a new instance of the Cell class
     * @param position The position of the cell inside its parent container
     * @param char This cell's representation as a single character
     */
    constructor(position: Position, char: string)
    {
        super("Cell", `${position.x},${position.y}`);

        if(char.length !== 1)
            throw new TypeError(`Passed char "${char}" has to be exactly 1 character in length`);

        this.position = position;
        this.char = char;
    }

    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `${this.objectName} '${this.getChar()}' @ ${this.position.toString()} - UID: ${this.uid.toString()}`;
    }

    //#MARKER abstract
    /**
     * Called on each tick to update this cell
     */
    abstract update(): Promise<void>;

    /**
     * Called to find out if this cell can be bulldozed.  
     *   
     * This method has to return a Promise (needs to resolve with a boolean value) or a boolean.  
     * This makes it support both asynchronous and synchronous execution.  
     * `true` = the cell can be bulldozed.  
     * `false` = the cell can't be bulldozed.
     */
    abstract bulldoze(): Promise<boolean> | boolean;
    
    //#MARKER methods / setters
    /**
     * Sets the state of the cursor
     * @param active
     */
    setCursorActive(active: boolean): void
    {
        this.cursorActive = active;
        this.colors.cursorActive = active;
    }

    /**
     * Sets this cell's color
     * @param type The type of the color (foreground, background, ...)
     * @param color The actual color to set
     * @param dim Whether this color should be set to a darker shade
     */
    setColor(type: ColorType, color: Color, dim: boolean = false): void
    {
        switch(type)
        {
            case ColorType.Foreground:
                this.colors.fg = color;
                this.colors.fgDim = dim;
            break;
            case ColorType.Background:
                this.colors.bg = color;
                this.colors.bgDim = dim;
            break;
        }
    }

    /**
     * Sets this cell's char
     */
    setChar(char: string): void
    {
        if(char.length !== 1)
            throw new TypeError(`Char is not exactly 1 in length`);

        this.char = char;
    }

    //#MARKER getters
    /**
     * Returns the position of this cell in its parent grid
     */
    getPosition(): Position
    {
        return this.position;
    }

    /**
     * Returns the current state of the cursor
     */
    getCursorActive(): boolean
    {
        return this.cursorActive;
    }

    /**
     * Returns this cell's representation as a character
     */
    getChar(): string
    {
        return this.char;
    }

    /**
     * Returns all color info that has been set on this cell
     */
    getColors(): ICellColors
    {
        return this.colors;
    }

    //#MARKER static

    /**
     * Checks if the passed value is a Cell
     */
    static isCell(value: any): value is Cell
    {
        value = (value as Cell);

        if(typeof value.getPosition !== "function" || !(value.getPosition() instanceof Position))
            return false;

        if(typeof value.getChar !== "function" || typeof value.getChar() !== "string" || value.getChar().length !== 1)
            return false;

        return true;
    }
}
