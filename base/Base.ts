/*************************************************/
/* Teng - Base classes, interfaces and functions */
/*************************************************/


import { diff } from "deep-diff";
import { colors } from "svcorelib";

import { generalSettings } from "../../settings";


//#MARKER base components
// /**
//  * Describes a size in 2D space
//  */
// export interface ISize
// {
//     [index: string]: number;

//     width: number;
//     height: number;
// }

export abstract class Stringifiable
{
    /**
     * Turns this object into a string representation
     */
    abstract toString(): string;
}

/**
 * Describes a rectangular size in 2D space
 */
export class Size extends Stringifiable// implements ISize
{
    // [index: string]: number;

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
     * Turns an instance of the Area class into an instance of the Size class
     */
    static fromArea(area: Area): Size
    {
        const { tl, br } = area.corners;
        const w = br.x - tl.x + 1;
        const h = br.y - tl.y + 1;

        return new Size(w, h);
    }
}

// /**
//  * Describes a position / coordinate in 2D space
//  */
// export interface IPosition
// {
//     [index: string]: number;

//     x: number;
//     y: number;
// }

/**
 * Describes a position or coordinate in 2D space
 */
export class Position extends Stringifiable// implements IPosition
{
    // [index: string]: number;

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

// /**
//  * Describes an area in 2D space
//  */
// export interface IArea
// {
//     [index: string]: IAreaCorners;

//     corners: IAreaCorners;
// }

/**
 * Describes a rectangular 2D area in a 2D space
 */
export class Area extends Stringifiable
{
    // [index: string]: IAreaCorners;

    readonly corners: IAreaCorners;

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
    }

    toString(): string
    {
        const { tl, br } = this.corners;
        return `⠋[${tl.x},${tl.y}] ⠴[${br.x},${br.y}]`;
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
    /** Text color */
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

/** Describes the log level */
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
 * Checks if two objects are equal
 * @param origin The origin object
 * @param comparand The object to compare to the origin object
 */
export function objectsEqual(origin: object, comparand: object): boolean
{
    return diff(origin, comparand) == undefined;
}
