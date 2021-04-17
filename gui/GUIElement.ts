/*********************************************************/
/* Teng - A single element of a graphical user interface */
/*********************************************************/

import { TengObject } from "../base/TengObject";
import { Size } from "../base/Base";


//#MARKER types

/**
 * Text alignment ¯\\\_(ツ)\_/¯
 */
export enum TextAlign
{
    Left,
    Center,
    Right
}

/**
 * Describes the content of a GUI element
 */
export type IGUIElementContent = GUIElement[];

//#MARKER class

export default interface GUIElement
{
    /** Emitted whenever this UI element requests to be redrawn. Whether this request is fulfilled or denied is unknown. */
    on(event: "requestRedraw", listener: () => void): this;
}

/**
 * A single element of a graphical user interface
 */
export default abstract class GUIElement extends TengObject
{
    /** Controls how UI elements that overlap each other are rendered (this element is rendered on top of elements with a lower z-index) */
    protected zIndex: number;
    /** The size (in characters) of this UI element */
    protected size: Size;

    /** The actual content of this UI element */
    protected content?: IGUIElementContent;


    /**
     * Creates an instance of the UIElement class
     * @param zIndex Controls how UI elements that overlap each other are rendered (this element is rendered on top of elements with a lower z-index)
     */
    constructor(zIndex: number, size: Size, content?: IGUIElementContent, objectName?: string)
    {
        super(objectName || "UI_Element", `z#${zIndex}/${size.toString()}`);

        this.zIndex = zIndex;
        this.size = size;

        if(this.content)
            this.content = content;
    }

    toString(): string
    {
        return `${this.objectName} of size [${this.size}] with z-index ${this.zIndex}`;
    }

    //#MARKER getters n setters

    getContent(): IGUIElementContent | undefined
    {
        return this.content;
    }

    setContent(content: IGUIElementContent): void
    {
        this.content = content;

        this.emit("requestRedraw");
    }

    getSize(): Size
    {
        return this.size;
    }

    /**
     * Returns the z-index of this UI element
     */
    getZIndex(): number
    {
        return this.zIndex;
    }

    /**
     * Sets the z-index of this UI element
     */
    setZIndex(zIndex: number): void
    {
        this.zIndex = zIndex;

        this.emit("requestRedraw");
    }
}
