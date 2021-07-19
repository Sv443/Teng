import { colors } from "svcorelib";
import { diff } from "deep-diff";

import { tengSettings } from "../settings";


//#SECTION Logging

/**
 * Describes the log level
 */
export type LogLevel = "success" | "info" | "warning" | "error" | "fatal";

/**
 * Logs a debug message to the console
 * @param section
 * @param message
 * @param color
 */
export function dbg(section: string, message: string, level: LogLevel = "info")
{
    if(tengSettings.info.debug)
    {
        let consoleCol = "";
        let logType = "";
        let exit = false;

        switch(level)
        {
            case "success":
                consoleCol = colors.fg.green;
                logType = "Info";
            break;
            case "info":
                consoleCol = colors.fg.cyan;
                logType = "Info";
            break;
            case "warning":
                consoleCol = colors.fg.yellow;
                logType = "Warning";
            break;
            case "error":
                consoleCol = colors.fg.red;
                logType = "Error";
            break;
            case "fatal":
                consoleCol = colors.fg.magenta;
                logType = "FATAL";
                exit = true;
            break;
        }

        console.log(`${consoleCol}[${logType}/${colors.fg.blue}${section}${consoleCol}]: ${colors.rst}${message}${colors.rst}`);

        exit && process.exit(1);
    }
}

//#SECTION Deep Diff

/**
 * Checks if two objects are equal (recursively searches through them / deep-diffs them)
 * @param origin The origin object
 * @param comparand The object to compare to the origin object
 */
 export function objectsEqual(origin: object, comparand: object): boolean
 {
     return diff(origin, comparand) == undefined;
 }
