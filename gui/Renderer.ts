/********************************************/
/* Teng - Handles rendering of GUI elements */
/********************************************/

import { Size } from "../core/Base";
import TengObject from "../core/TengObject";
import GUIWidget from "./GUIWidget";


//#MARKER class

/**
 * Handles rendering of GUI elements
 */
export default class Renderer extends TengObject
{
    private outStream: NodeJS.WriteStream;
    private windowSize: Size;

    private content?: GUIWidget[];


    /**
     * Creates an instance of the Renderer class.  
     * This class handles rendering of GUI elements.
     * @param outStream The stream to render the contents to. Defaults to `process.stdout`
     * @param content The contents of this Renderer. Accepts a singular widget or an array of them
     */
    constructor(outStream?: NodeJS.WriteStream, content?: GUIWidget | GUIWidget[])
    {
        outStream = outStream || process.stdout;

        super("Renderer", `Size=${outStream.columns}x${outStream.rows}`);

        this.outStream = outStream || process.stdout;
        this.windowSize = Renderer.getWindowSize(outStream);

        if(content)
            this.content = Array.isArray(content) ? content : [ content ];
    }

    toString(): string
    {
        return `Renderer [${this.windowSize.toString()}] - UID: ${this.uid.toString()}`;
    }

    //#SECTION public

    /**
     * Returns the size of the set outStream
     */
    getWindowSize(): Size
    {
        return new Size(this.outStream.columns, this.outStream.rows);
    }

    /**
     * Sets this Renderer's output stream. Defaults to `process.stdout`
     */
    setOutStream(outStream: NodeJS.WriteStream = process.stdout): void
    {
        this.outStream = outStream;
    }

    /**
     * Returns the currently set content
     */
    getContent(): GUIWidget[] | undefined
    {
        return this.content;
    }

    /**
     * Overrides the currently set content
     */
    setContent(content: GUIWidget | GUIWidget[]): void
    {
        this.content = Array.isArray(content) ? content: [ content ];
    }

    /**
     * Replaces some content
     * @param index The index (0-based) of the content to replace with other content
     * @param content The content to insert at the set index
     * @returns Returns a boolean that's `true` if the content could be replaced and `false` if not
     */
    replaceContent(index: number, content: GUIWidget): boolean
    {
        if(this.content)
        {
            if(this.content[index])
            {
                this.content[index] = content;
                return true;
            }
        }
        return false;
    }

    /**
     * Removes some content at the specified index (will decrement the indexes of all content that has a higher index than the one to be deleted by 1)
     * @param index The index (0-based) of content to remove
     * @param amount The amount of content to remove (defaults to 1)
     */
    removeContent(index: number, amount: number = 1): void
    {
        this.content?.splice(index, amount);
    }

    //#SECTION static

    /**
     * Returns the size of a window, by passing a WriteStream. Defaults to `process.stdout`
     * @param outStream Stream to read the size from
     */
    public static getWindowSize(outStream: NodeJS.WriteStream = process.stdout): Size
    {
        return new Size(outStream.columns, outStream.rows);
    }
}
