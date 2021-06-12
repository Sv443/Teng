/*********************************************************/
/* Teng - A single element of a graphical user interface */
/*********************************************************/

import TengObject from "../core/TengObject";
import { Size } from "../core/Base";


//#MARKER types

/**
 * | Horizontal |
 * | --: |
 * | alignment |
 * | ¯\\\_(ツ)\_/¯ |
 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
 */
export type HorizontalAlign = "left" | "center" | "right";

/**
 * Vertical alignment ¯\\\_(ツ)\_/¯
 */
export type VerticalAlign = "up" | "center" | "down";

/**
 * Describes the content of a GUI element
 */
export type IGUIWidgetContent = GUIWidget[];

//#MARKER class

export default interface GUIWidget
{
    /** Emitted whenever this GUIWidget requests to be redrawn. Whether this request is fulfilled or denied is not this class' concern. */
    on(event: "requestRedraw", listener: () => void): this;
}

/**
 * A single element of a graphical user interface
 */
export default abstract class GUIWidget extends TengObject
{
    /** Controls how UI elements that overlap each other are rendered (this element is rendered on top of elements with a lower z-index) */
    protected zIndex: number;
    /** The size (in characters) of this UI element */
    protected size: Size;

    /** The actual content of this UI element */
    protected content?: IGUIWidgetContent;


    /**
     * Creates an instance of the UIElement class
     * @param zIndex Controls how UI elements that overlap each other are rendered (this element is rendered on top of elements with a lower z-index)
     */
    constructor(zIndex: number, size: Size, content?: IGUIWidgetContent, objectName?: string)
    {
        super(objectName || "GUI_Element", `z#${zIndex}/${size.toString()}`);


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

    getContent(): IGUIWidgetContent | undefined
    {
        return this.content;
    }

    setContent(content: IGUIWidgetContent): void
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
