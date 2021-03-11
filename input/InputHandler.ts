/*********************************/
/* Teng - Handles keyboard input */
/*********************************/

import keypress from "keypress";

import { TengObject } from "../base/TengObject";


declare type InputEvent = "key";

/**
 * Contains data about a key press
 */
export interface KeypressObject
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

/**
 * This class handles keyboard input
 */
export class InputHandler extends TengObject
{
    inStream: NodeJS.ReadStream;

    onKey: (char: string, key: KeypressObject) => void = () => {};

    /**
     * Creates an instance of the Input class
     * @param inStream The ReadStream to read keypresses from - defaults to `process.stdin`
     */
    constructor(inStream: NodeJS.ReadStream = process.stdin)
    {
        super("Input");


        this.inStream = inStream;

        this.inStream.setRawMode(true);
        keypress(this.inStream);

        // call `onKeypress()` 
        this.inStream.on("keypress", (ch, key) => {
            this.onKeypress(ch, (key as KeypressObject));
        });
    }

    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `Input - UID: ${this.uid.toString()}`;
    }

    /**
     * Registers an event
     */
    on(event: InputEvent, func: (char: string, key: KeypressObject) => void): void
    {
        switch(event)
        {
            case "key":
                this.onKey = func;
            break;
        }
    }

    /**
     * Called when a key is pressed
     */
    private onKeypress(char: string, key: KeypressObject | undefined)
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

            this.onKey(char, key);
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
