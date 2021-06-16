/*********************************************************/
/* Teng - A single element of a graphical user interface */
/*********************************************************/

import TengObject from "../../core/TengObject";
import { Color, ColorType, Index2, Size } from "../../core/Base";


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
 * Sets the color at a given 2-dimensional char index
 */
export interface ISetColor
{
    [key: string]: any;

    charIndex: Index2;
    colorType: ColorType;
    color: Color;
}

/**
 * Describes how to render something
 */
export interface IRenderInfo
{
    [key: string]: Size | string[][];

    size: Size;
    chars: string[][];
    // transparentChars: Index2[];
}

export type RequestRedrawType = "contentChanged" | "zIndexChanged";

//#MARKER class

export default interface GUIWidget
{
    /** Emitted whenever this GUIWidget requests to be redrawn. Gets passed an event type. Whether this request is fulfilled or denied is not this class' concern. */
    on(event: "requestRedraw", listener: (type: RequestRedrawType) => void): this;
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

    protected renderInfo: IRenderInfo;


    /**
     * Creates an instance of the UIElement class
     * @param zIndex Controls how UI elements that overlap each other are rendered (this element is rendered on top of elements with a lower z-index)
     */
    constructor(zIndex: number, size: Size, objectName?: string)
    {
        super(objectName || "GUI_Element", `z#${zIndex}/${size.toString()}`);


        this.zIndex = zIndex;
        this.size = size;

        this.renderInfo = {
            size,
            chars: []
        };
    }

    toString(): string
    {
        return `${this.objectName} of size [${this.size}] with z-index ${this.zIndex}`;
    }

    //#MARKER getters n setters

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

        this.emit("requestRedraw", "zIndexChanged");
    }

    /**
     * Returns the render info object of this GUI widget
     */
    getRenderInfo(): IRenderInfo
    {
        return this.renderInfo;
    }

    /**
     * Sets the render info object of this GUI widget
     */
    setRenderInfo(renderInfo: IRenderInfo): void
    {
        this.renderInfo = renderInfo;
    }
}
