/*************************************************/
/* Teng - Base classes, interfaces and functions */
/*************************************************/


import { diff } from "deep-diff";
import { colors } from "svcorelib";

import { generalSettings } from "../../settings";


//#MARKER base components
/**
 * Extended (derived) classes need to have a toString() method, making the instances of those classes stringifiable
 */
export abstract class Stringifiable
{
    /**
     * Turns this object into a string representation
     */
    abstract toString(): string;
}

/**
 * Describes a rectangular size in 2D space.  
 * Note: width and height cannot be modified after instantiation.
 */
export class Size extends Stringifiable
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

    toString(): string
    {
        return `${this.width}x${this.height}`;
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
     * Creates a new instance of the Size class by splitting it horizontally and/or vertically a set number of times.  
     * 
     */
    split(horSplits?: number, verSplits?: number): Size
    {
        let { width, height } = this;

        horSplits && (width /= (horSplits + 1));
        verSplits && (height /= (verSplits + 1));

        return new Size(width, height);
    }

    /**
     * Checks if this size is a multiple of the passed size
     */
    isMultipleOf(comparand: Size): boolean
    {
        if(this.width % comparand.width === 0 && this.height % comparand.height === 0)
            return true;

        return false;
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

/**
 * Describes a position or coordinate in 2D space
 */
export class Position extends Stringifiable
{
    readonly x: number;
    readonly y: number;

    /**
     * Creates a new instance of the Position class
     */
    constructor(x: number, y: number)
    {
        super();

        this.x = x;
        this.y = y;
    }

    toString(): string
    {
        return `[${this.x},${this.y}]`;
    }
}

/**
 * Describes an index in one-dimensional space
 */
export class Index extends Stringifiable
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

    toString(): string
    {
        return `[${this.idx}]`;
    }
}

/**
 * Describes an index in two-dimensional space
 */
export class Index2 extends Stringifiable
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

    toString(): string
    {
        return `[${this.x},${this.y}]`;
    }
}

/**
 * Describes an index in three-dimensional space
 */
export class Index3 extends Stringifiable
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

    toString(): string
    {
        return `[${this.x},${this.y},${this.z}]`;
    }
}

/**
 * Contains the corners of an area
 */
declare interface IAreaCorners
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
export class Area extends Stringifiable
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

    toString(): string
    {
        const { tl, br } = this.corners;
        return `⠋[${tl.x},${tl.y}] ⠴[${br.x},${br.y}]`;
    }

    /**
     * Returns a new instance of the Area class based on the passed chunk index and chunk size
     */
    static fromChunkIndex(chunkIdx: Position, chunkSize: Size): Area
    {
        /** TL corner is always just a multiple of the chunk idx and its size */
        const tl = new Position((chunkIdx.x * chunkSize.width), (chunkIdx.y * chunkSize.height));
        /** BR corner is easy to derive from just the chunk size added to the TL corner */
        const br = new Position((tl.x + chunkSize.width - 1), (tl.y + chunkSize.height - 1));

        return new this(tl, br);
    }
}

//#SECTION colors

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
};

/**
 * Describes the type of color
 */
export enum ColorType
{
    /** Text / foreground color */
    Foreground,
    /** Background color */
    Background
}

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
        case ColorType.Foreground:
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
        case ColorType.Background:
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


//#MARKER logging

/**
 * Describes the log level
 */
export enum LogLevel
{
    /** Success */
    Success,
    /** Information */
    Info,
    /** Warning */
    Warning,
    /** Something errored, but the process can keep running */
    Error,
    /** Something vital errored, so the process has to exit */
    Fatal
}

/**
 * Logs a debug message to the console
 * @param section
 * @param message
 * @param color
 */
export function dbg(section: string, message: string, level: LogLevel = LogLevel.Info)
{
    if(generalSettings.debug.verboseLogging)
    {
        let consoleCol = "";
        let logType = "";

        switch(level)
        {
            case LogLevel.Success:
                consoleCol = colors.fg.green;
                logType = "Debug";
            break;
            case LogLevel.Info:
                consoleCol = colors.fg.cyan;
                logType = "Debug";
            break;
            case LogLevel.Warning:
                consoleCol = colors.fg.yellow;
                logType = "Warning";
            break;
            case LogLevel.Error:
                consoleCol = colors.fg.red;
                logType = "Error";
            break;
            case LogLevel.Fatal:
                consoleCol = colors.fg.magenta;
                logType = "FATAL";
            break;
        }

        console.log(`${consoleCol}[${logType}/${colors.fg.blue}${section}${consoleCol}]: ${colors.rst}${message}${colors.rst}`);
    }
}

/**
 * Checks if two objects are equal (recursively searches through them / deep-diffs them)
 * @param origin The origin object
 * @param comparand The object to compare to the origin object
 */
export function objectsEqual(origin: object, comparand: object): boolean
{
    return diff(origin, comparand) == undefined;
}
