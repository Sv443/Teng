/*********************************/
/* Teng - Handles keyboard input */
/*********************************/

import keypress from "keypress";
import { EventEmitter } from "events";

import TengObject from "../base/TengObject";


declare type InputEvent = "key";

/**
 * Contains data about a key press
 */
export interface IKeypressObject
{
    [index: string]: string | boolean | undefined;

    /** Name of the pressed key */
    name: string;
    /** If the CTRL key was pressed */
    ctrl: boolean;
    /** If the Meta key was pressed */
    meta: boolean;
    /** If the Shift key was pressed */
    shift: boolean;
    /** The ASCII sequence (I think) */
    sequence: string;
    /** some ASCII code (idk either, I just use the `name`, don't judge me) */
    code?: string;
}

export interface InputHandler
{
    /** Event gets emitted when a key is pressed */
    on(event: "key", listener: (char: string, key: IKeypressObject | undefined) => void): this;
}

/**
 * This class handles keyboard input
 */
export class InputHandler extends TengObject
{
    private inStream: NodeJS.ReadStream;

    /**
     * Creates an instance of the Input class
     * @param inStream The ReadStream to read keypresses from - defaults to `process.stdin`
     */
    constructor(inStream: NodeJS.ReadStream = process.stdin)
    {
        super("InputHandler");


        this.inStream = inStream;

        this.inStream.setRawMode(true);
        keypress(this.inStream);

        // call `onKeypress()` 
        this.inStream.on("keypress", (ch, key) => {
            this.onKeypress(ch, (key as IKeypressObject));
        });
    }

    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `${this.objectName} - UID: ${this.uid.toString()}`;
    }

    /**
     * Called when a key is pressed
     */
    private onKeypress(char: string, key: IKeypressObject | undefined)
    {
        if(key !== undefined)
        {
            const modifierList = [];

            key.ctrl  && modifierList.push(`CTRL`);
            key.meta  && modifierList.push(`META`);
            key.shift && modifierList.push(`SHIFT`);

            // const modifierText = modifierList.length > 0 ? ` (mod: ${modifierList.join(", ")})` : "";

            if(key.ctrl && ["c", "d"].includes(key.name))
                process.exit();

            this.emit("key", char, key);
        }
        else
        {
            // modify key object, then recurse
            this.onKeypress(char, {
                name: char.toLowerCase(),
                shift: (char.toUpperCase() === char),
                ctrl: false,
                meta: false,
                sequence: char
            });
        }
    }
}
