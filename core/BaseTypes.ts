/*************************************************/
/* Teng - Base classes, interfaces and functions */
/*************************************************/

/* eslint-disable no-unused-vars */



//#SECTION Custom Types

/**
 * Makes sure the type `T` is a class that can be instantiated (is not abstract)
 */
export type Newable<T> = { new (...args: any[]): T; };

/**
 * Makes sure the type `T` is a class that can be instantiated (is not abstract)  
 * (This is just an alias for `Newable<T>`)
 */
export type NonAbstract<T> = Newable<T>;

/**
 * Describes an object that is JSON-compatible, aka doesn't contain self- / circular references or non-primitive JS properties  
 * [Source](https://github.com/microsoft/TypeScript/issues/1897#issuecomment-338650717)
 */
export type JSONCompatible =  boolean | number | string | null | JSONArray | JSONMap;
interface JSONMap { [key: string]: JSONCompatible; }
interface JSONArray extends Array<JSONCompatible> { }


//#SECTION Base Class
/**
 * Extended (derived) classes need to have certain methods to convert their data
 */
export abstract class Convertable
{
    /**
     * Turns this object into a string representation
     */
    abstract toString(): string;

    /**
     * Turns this object into a JSON representation
     */
    abstract toJSON(): any;
}

//#SECTION Size

/**
 * Describes a rectangular size in 2D space
 */
export interface ISizeObject
{
    [key: string]: number;

    width: number;
    height: number;
}

/**
 * Describes a rectangular size in 2D space.  
 * Note: width and height cannot be modified after instantiation.
 */
export class Size extends Convertable
{
    readonly width: number;
    readonly height: number;

    /**
     * Creates a new instance of the class Size
     */
    constructor(width: number, height: number)
    {
        super();

        this.width = width;
        this.height = height;
    }

    /**
     * Returns a string representation of this Size instance in the format `WxH`
     */
    toString(): string
    {
        return `${this.width}x${this.height}`;
    }

    /**
     * Returns a JSON representation of this Size instance
     */
    toJSON(): ISizeObject
    {
        const { width, height } = this;

        return { width, height };
    }

    /**
     * Creates an instance of the Size class by taking values from an instance of the Area class
     */
    static fromArea(area: Area): Size
    {
        const { tl, br } = area.corners;
        const w = br.x - tl.x + 1;
        const h = br.y - tl.y + 1;

        return new this(w, h);
    }

    /**
     * Clones an instance of the Size class by value
     */
    static fromSize(size: Size): Size
    {
        return new this(size.width, size.height);
    }

    /**
     * Creates a new instance of the Size class by splitting it horizontally and/or vertically a set number of times
     */
    split(horSplits?: number, verSplits?: number): Size
    {
        let { width, height } = this;

        horSplits && (width /= (horSplits + 1));
        verSplits && (height /= (verSplits + 1));

        return new Size(width, height);
    }

    /**
     * Checks if this size is a multiple of the passed Size instance `comparand`
     */
    isMultipleOf(comparand: Size): boolean
    {
        return (this.width % comparand.width === 0 && this.height % comparand.height === 0);
    }

    /**
     * Runs a function for each position in this size instance.  
     * The first position starts at 0. Offset it yourself if needed.
     */
    forEachPosition(callback: (pos: Position) => void): void
    {
        for(let y = 0; y < this.height; y++)
        {
            for(let x = 0; x < this.width; x++)
            {
                callback(new Position(x, y));
            }
        }
    }
}

//#SECTION Position

/**
 * Describes a position or coordinate in 2D space
 */
export interface IPositionObject
{
    [key: string]: number;

    x: number;
    y: number;
}

/**
 * Describes a position or coordinate in 2D space
 * Note: position cannot be modified after instantiation.
 */
export class Position extends Convertable
{
    readonly x: number;
    readonly y: number;


    /**
     * Creates a new instance of the Position class.  
     * Negative positions aren't allowed - if either `x` or `y` are negative, they will be set to the default of `0`  
     * The passed values `x` and `y` will be rounded in case they are floating point values.  
     *   
     * **Note:** position cannot be modified after instantiation.
     */
    constructor(x: number, y: number)
    {
        super();


        if(x < 0) x = 0;
        if(y < 0) y = 0;

        // make sure floats are converted to int
        this.x = (x % 1 != 0) ? Math.round(x) : x;
        this.y = (y % 1 != 0) ? Math.round(y) : y;
    }

    /**
     * Returns a string representation of this Position instance in the format `[X,Y]`
     */
    toString(): string
    {
        return `[${this.x},${this.y}]`;
    }

    /**
     * Returns a JSON representation of this Position instance
     */
    toJSON(): IPositionObject
    {
        const { x, y } = this;

        return { x, y };
    }
}

//#SECTION Index

/**
 * Describes an index in one-dimensional space
 */
export interface IIndexObject
{
    [key: string]: number;

    idx: number;
}

/**
 * Describes an index in one-dimensional space
 */
export class Index extends Convertable
{
    readonly idx: number;


    /**
     * Creates an instance of the Index class
     */
    constructor(idx: number)
    {
        super();

        this.idx = idx;
    }

    /**
     * Returns a string representation of this Index instance in the format `[X]`
     */
    toString(): string
    {
        return `[${this.idx}]`;
    }

    /**
     * Returns a JSON representation of this Index instance
     */
    toJSON(): IIndexObject
    {
        const { idx } = this;

        return { idx };
    }
}

//#SECTION Index2

/**
 * Describes an index in two-dimensional space
 */
export interface IIndex2Object
{
    [key: string]: number;

    x: number;
    y: number;
}

/**
 * Describes an index in two-dimensional space
 */
export class Index2 extends Convertable
{
    readonly x: number;
    readonly y: number;


    /**
     * Creates an instance of the Index2 class
     */
    constructor(x: number, y: number)
    {
        super();

        this.x = x;
        this.y = y;
    }

    /**
     * Returns a string representation of this Index2 instance in the format `[X,Y]`
     */
    toString(): string
    {
        return `[${this.x},${this.y}]`;
    }

    /**
     * Returns a JSON representation of this Index2 instance
     */
    toJSON(): IIndex2Object
    {
        const { x, y } = this;

        return { x, y };
    }
}

//#SECTION Index3

/**
 * Describes an index in three-dimensional space
 */
export interface IIndex3Object
{
    [key: string]: number;

    x: number;
    y: number;
    z: number;
}

/**
 * Describes an index in three-dimensional space
 */
export class Index3 extends Convertable
{
    readonly x: number;
    readonly y: number;
    readonly z: number;


    /**
     * Creates an instance of the Index2 class
     */
    constructor(x: number, y: number, z: number)
    {
        super();


        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Returns a string representation of this Index3 instance in the format `[X,Y,Z]`
     */
    toString(): string
    {
        return `[${this.x},${this.y},${this.z}]`;
    }

    /**
     * Returns a JSON representation of this Index3 instance
     */
    toJSON(): IIndex3Object
    {
        const { x, y, z } = this;

        return { x, y, z };
    }
}

//#SECTION IndexN

/**
 * Describes an index in n-dimensional space
 */
export interface IIndexNObject
{
    [key: string]: number[];

    indexes: number[];
}

/**
 * Describes an index in n-dimensional space
 */
export class IndexN extends Convertable
{
    private indexes: number[];

    /**
     * Creates an instance of the Index2 class
     */
    constructor(...numbers: number[])
    {
        super();

        this.indexes = numbers;
    }

    /**
     * Returns a string representation of this IndexN instance in the format `[A,B,C,D,...]`
     */
    toString(): string
    {
        return `[${this.indexes.join(",")}]`;
    }

    /**
     * Returns a JSON representation of this IndexN instance
     */
    toJSON(): IIndexNObject
    {
        const { indexes } = this;

        return { indexes };
    }

    /**
     * Returns a number of this index at the specified `position`
     */
    get(position: number): number | undefined
    {
        return this.indexes[position] || undefined;
    }

    /**
     * Returns all numbers that make up this index
     */
    all(): number[]
    {
        return this.indexes;
    }
}

//#SECTION Area

/**
 * Contains the corners of an area
 */
export interface IAreaCorners
{
    [index: string]: Position;

    /** Top left corner */
    tl: Position;
    /** Bottom right corner */
    br: Position;
}

/**
 * Describes a rectangular 2D area in a 2D space
 */
export interface IAreaObject
{
    [index: string]: IAreaCorners | Size;

    corners: IAreaCorners;
    size: Size;
}

/**
 * Describes a rectangular 2D area in a 2D space
 */
export class Area extends Convertable
{
    /** The corners that make up this area */
    readonly corners: IAreaCorners;
    /** The size of this area */
    readonly size: Size;


    /**
     * Creates a new instance of the Area class
     */
    constructor(cornerTL: Position, cornerBR: Position)
    {
        super();


        this.corners = {
            tl: cornerTL,
            br: cornerBR
        };

        this.size = Size.fromArea(this);
    }

    /**
     * Returns a string representation of this Area instance in the format `⠋[X_tl,Y_tl] ⠴[X_br,Y_br]` (where tl = top left and br = bottom right)
     */
    toString(): string
    {
        const { tl, br } = this.corners;
        return `⠋[${tl.x},${tl.y}] ⠴[${br.x},${br.y}]`;
    }

    /**
     * Returns a JSON representation of this Area instance
     */
    toJSON(): IAreaObject
    {
        const { corners, size } = this;

        return { corners, size };
    }

    /**
     * Returns a new instance of the Area class based on the passed chunk index and chunk size
     */
    static fromChunkIndex(chunkIdx: Index2, chunkSize: Size): Area
    {
        /** TL corner is always just a multiple of the chunk idx and its size */
        const tl = new Position((chunkIdx.x * chunkSize.width), (chunkIdx.y * chunkSize.height));
        /** BR corner is easy to derive from just the chunk size added to the TL corner */
        const br = new Position((tl.x + chunkSize.width - 1), (tl.y + chunkSize.height - 1));

        return new this(tl, br);
    }
}

//#SECTION Color

/**
 * Describes a foreground or background color that can be rendered to a terminal / command line
 */
export enum Color
{
    /** Resets both foreground *and* background color */
    Reset,

    Black,
    Red,
    Green,
    Yellow,
    Blue,
    Magenta,
    Cyan,
    White
}

/**
 * Describes the type of color.  
 *   
 * Foreground = text color  
 * Background = background color
 */
export type ColorType = "foreground" | "background";

/**
 * Resolves a color type and name to a string representation that can be used to color the terminal / command line
 * @param type The type of the color to resolve
 * @param col The color to resolve
 * @param dim Set to true to dim the color
 */
export function resolveColor(type: ColorType, col: Color, dim: boolean = false): string
{
    let retColor = "";

    let colorMapping: {[key: string]: string};

    switch(type)
    {
        case "foreground":
            colorMapping = {
                Reset:   "\x1b[0m",
                Black:   "\x1b[30m",
                Red:     "\x1b[31m",
                Green:   "\x1b[32m",
                Yellow:  "\x1b[33m",
                Blue:    "\x1b[34m",
                Magenta: "\x1b[35m",
                Cyan:    "\x1b[36m",
                White:   "\x1b[37m",
            };
        break;
        case "background":
            colorMapping = {
                Reset:   "\x1b[0m",
                Black:   "\x1b[40m",
                Red:     "\x1b[41m",
                Green:   "\x1b[42m",
                Yellow:  "\x1b[43m",
                Blue:    "\x1b[44m",
                Magenta: "\x1b[45m",
                Cyan:    "\x1b[46m",
                White:   "\x1b[47m",
            };
        break;
    }

    const chosenColor = colorMapping[Color[col]];

    retColor = (dim ? "\x1b[2m" : "\x1b[1m") + chosenColor;

    return retColor;
}

const colorsAmount = Object.keys(Color).length / 2;

/**
 * Checks if a provided value can be considered part of the Color enum
 */
export function isColor(val: any): val is Color
{
    val = (val as Color);

    if(typeof val == "number" && val >= 0 && val < colorsAmount)
        return true;

    return false;
}
