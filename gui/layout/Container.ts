/****************************************/
/* Teng - UI element that contains text */
/****************************************/

import { UIElement, TextAlign } from "../UIElement";


/**
 * Describes the content of a container
 */
export interface IContainerContent
{
    [index: string]: string | TextAlign;

    text: string;
    alignment: TextAlign;
}

/**
 * UI element that contains text
 */
export class Container extends UIElement
{
    private content: IContainerContent;


    /**
     * Creates an instance of the Container class
     * @param content The content of this container
     */
    constructor(zIndex: number, content: IContainerContent)
    {
        super(zIndex);


        this.content = content;
    }
}
