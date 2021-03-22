/*****************************************/
/* Teng - Renders stuff to a WriteStream */
/*****************************************/

import { Cursor } from "ansi";
import { TengObject } from "../base/TengObject";
import { Camera } from "./Camera";


//#MARKER class

/**
 * Handles rendering stuff to a WriteStream
 */
export class Renderer extends TengObject
{
    private cursor: Cursor;
    private outStream: NodeJS.WriteStream;

    private camera?: Camera;


    /**
     * Creates a new instance of the Renderer class
     * @param outStream Stream to write stuff to - defaults to `process.stdout`
     * @param cam Camera to attach to
     */
    constructor(outStream: NodeJS.WriteStream = process.stdout, cam?: Camera)
    {
        super("Renderer");

        this.outStream = outStream;
        this.cursor = new Cursor(this.outStream);

        if(cam)
            this.camera = cam;
    }

    toString()
    {
        return `Renderer - UID: ${this.uid.toString()}`;
    }

    //#MARKER other

    /**
     * Attaches an instance of the Camera class to this renderer
     */
    attachCamera(cam: Camera): void
    {
        this.camera = cam;
    }

    /**
     * Checks if a camera has been attached
     */
    isCameraAttached(): boolean
    {
        return (this.camera instanceof Camera);
    }

    /**
     * Makes the terminal beep (if it's supported)
     */
    beep(): void
    {
        this.cursor.beep();
    }

    //#MARKER static

    /**
     * Checks if a value is a renderer
     */
    static isRenderer(value: any): value is Renderer
    {
        value = (value as Renderer);

        if(!(value.cursor instanceof Cursor))
            return false;

        if(typeof value.outStream.write !== "function")
            return false;

        return true;
    }
}
