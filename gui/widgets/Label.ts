/****************************************/
/* Teng - UI element that contains text */
/****************************************/

import { Size } from "../../core/Base";
import GUIWidget, { HorizontalAlign } from "../GUIWidget";


/**
 * Describes the content of a text container
 */
export interface ILabelContent
{
    [index: string]: string | HorizontalAlign;

    text: string;
    alignment: HorizontalAlign;
}

/**
 * UI element that contains text
 */
export default class Label extends GUIWidget
{
    private textContent: ILabelContent;


    /**
     * Creates an instance of the TextContainer class
     * @param content The content of this container
     */
    constructor(zIndex: number, size: Size, textContent: ILabelContent)
    {
        super(zIndex, size);


        this.textContent = textContent;
    }
}
