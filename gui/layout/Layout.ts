/********************************************************************/
/* Teng - GUI element that aligns its sub-elements in a certain way */
/*******************************************************************/

import { Size } from "../../base/Base";
import GUIElement from "../GUIElement";


/**  */
export enum LayoutType
{
    /** Stacks UI elements vertically */
    Vertical,
    /** Stacks UI elements horizontally */
    Horizontal,
    /** Lays out UI elements in a grid */
    Grid
}

/**
 * UI element that aligns its sub-elements in a grid pattern
 */
export default class Layout extends GUIElement
{
    /** The type of layout */
    protected type: LayoutType;


    /**
     * Creates an instance of the GridLayout class
     */
    constructor(zIndex: number, size: Size, type: LayoutType)
    {
        super(zIndex, size, undefined, "Layout");


        this.type = type;
    }
}
