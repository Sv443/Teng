/****************************************/
/* Teng - UI element that contains text */
/****************************************/

import { Size } from "../../base/Base";
import GUIElement, { TextAlign } from "../GUIElement";


/**
 * Describes the content of a text container
 */
export interface ITextContainerContent
{
    [index: string]: string | TextAlign;

    text: string;
    alignment: TextAlign;
}

/**
 * UI element that contains text
 */
export default class TextContainer extends GUIElement
{
    private textContent: ITextContainerContent;


    /**
     * Creates an instance of the TextContainer class
     * @param content The content of this container
     */
    constructor(zIndex: number, size: Size, textContent: ITextContainerContent)
    {
        super(zIndex, size, undefined, "Container");


        this.textContent = textContent;
    }
}
