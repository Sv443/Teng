/****************************************/
/* Teng - UI element that contains text */
/****************************************/

import { Size } from "../../core/Base";
import GUIWidget, { HorizontalAlign } from "../GUIWidget";
import { JustifyDirection, JustifyHorizontal, JustifyVertical } from "./Container";


/**
 * Describes the content of a text container
 */
export interface ILabelContent
{
    [index: string]: string | HorizontalAlign;

    text: string;
    textAlign: HorizontalAlign;
}

/**
 * UI element that contains text
 */
export default class Label extends GUIWidget
{
    private textContent?: ILabelContent;

    private justifyHor: JustifyHorizontal = "left";
    private justifyVer: JustifyVertical = "up";
    private justifyDir: JustifyDirection = "horizontal";


    /**
     * Creates an instance of the TextContainer class
     * @param content The content of this container
     */
    constructor(zIndex: number, size: Size, textContent?: ILabelContent)
    {
        super(zIndex, size, "Label");


        if(textContent)
            this.textContent = textContent;
    }

    //#SECTION label content

    getLabelContent(): ILabelContent | undefined
    {
        return this.textContent;
    }

    setLabelContent(textContent: ILabelContent): void
    {
        this.textContent = textContent;
    }

    //#SECTION justify

    /**
     * Sets the horizontal justify of this label
     */
    setJustify(direction: "horizontal", justify: JustifyHorizontal): void;

    /**
     * Sets the vertical justify of this label
     */
    setJustify(direction: "vertical", justify: JustifyVertical): void;

    /**
     * Sets the justify of this label
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
     * Returns the justify of this label
     */
    getJustify(): (JustifyHorizontal | JustifyVertical)
    {
        switch(this.getJustifyDirection())
        {
            case "vertical":
                return this.justifyVer;
            case "horizontal":
                return this.justifyHor;
        }
    }

    /**
     * Returns the direction of this label's justify
     */
    getJustifyDirection(): JustifyDirection
    {
        return this.justifyDir;
    }
}
