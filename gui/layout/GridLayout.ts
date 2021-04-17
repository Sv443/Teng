/****************************************/
/* Teng - UI element that aligns its sub-elements in a grid pattern */
/****************************************/

import { Size } from "../../base/Base";
import GUIElement from "../GUIElement";


/**
 * UI element that aligns its sub-elements in a grid pattern
 */
export default class GridLayout extends GUIElement
{
    /**
     * Creates an instance of the GridLayout class
     */
    constructor(zIndex: number, size: Size)
    {
        super(zIndex, size, undefined, "GridLayout");
    }
}
