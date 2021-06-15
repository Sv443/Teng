/****************************************/
/* Teng - UI element that contains text */
/****************************************/

import { Size } from "../../core/Base";
import GUIWidget, { HorizontalAlign, VerticalAlign } from "../GUIWidget";


//#MARKER types

/**
 * These types of justify have some kind of outer padding to them
 */
export type PaddedJustifyTypes = "space-between" | "space-around" | "space-evenly";

/**
 * Justify defines how space should be distributed between and around the container's items  
 *   
 * | Name | Layout |
 * | :-- | :-- |
 * | `left` | Pack items from the left |
 * | `center` | Pack items around the center |
 * | `right` | Pack items from the right |
 * | `space-between` | Distribute items evenly. First is flush with the start, last is flush with the end |
 * | `space-around` | Distribute items evenly. Items have a half-size space on either end |
 * | `space-evenly` | Distribute items evenly. Items have equal space around them |
 */
export type JustifyHorizontal = HorizontalAlign | PaddedJustifyTypes;

/**
 * Justify defines how space should be distributed between and around the container's items  
 *   
 * | Name | Layout |
 * | :-- | :-- |
 * | `up` | Pack items from the top |
 * | `center` | Pack items around the center |
 * | `down` | Pack items from the bottom |
 * | `space-between` | Distribute items evenly. First is flush with the start, last is flush with the end |
 * | `space-around` | Distribute items evenly. Items have a half-size space on either end |
 * | `space-evenly` | Distribute items evenly. Items have equal space around them |
 */
export type JustifyVertical = VerticalAlign | PaddedJustifyTypes;

export type JustifyDirection = "horizontal" | "vertical";

//#MARKER class

/**
 * GUI element that contains other GUI elements, that handles their layout and alignment
 */
export default class Container extends GUIWidget
{
    private justifyHor: JustifyHorizontal = "left";
    private justifyVer: JustifyVertical = "up";

    private justifyDir: JustifyDirection = "horizontal";


    //#SECTION constructor

    /**
     * Creates an instance of the Container class
     */
    constructor(zIndex: number, size: Size)
    {
        super(zIndex, size, "Container");
    }

    //#SECTION justify

    /**
     * Sets the horizontal justify of this container
     */
    setJustify(direction: "horizontal", justify: JustifyHorizontal): void;

    /**
     * Sets the vertical justify of this container
     */
    setJustify(direction: "vertical", justify: JustifyVertical): void;

    /**
     * Sets the justify of this container
     * @param direction
     * @param justify
     */
    setJustify(direction: JustifyDirection, justify: (JustifyHorizontal | JustifyVertical)): void
    {
        this.justifyDir = direction;

        switch(direction)
        {
            case "vertical":
                this.justifyVer = (justify as JustifyVertical);
            break;
            case "horizontal":
                this.justifyHor = (justify as JustifyHorizontal);
            break;
        }
    }

    /**
     * Returns the justify of this container
     */
    getJustify(): (JustifyHorizontal | JustifyVertical)
    {
        switch(this.justifyDir)
        {
            case "vertical":
                return this.justifyVer;
            case "horizontal":
                return this.justifyHor;
        }
    }

    /**
     * Returns the direction of this container's justify
     */
    getJustifyDirection(): JustifyDirection
    {
        return this.justifyDir;
    }

    //#SECTION other
}
