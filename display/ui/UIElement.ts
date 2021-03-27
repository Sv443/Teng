/**********************************************************/
/* Teng - Contains information to render a user interface */
/**********************************************************/


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
 * Contains information to render an element to the user interface
 */
export abstract class UIElement
{
    protected zIndex: number;


    /**
     * Creates an instance of the UIElement class
     */
    constructor(zIndex: number)
    {
        this.zIndex = zIndex;
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
    }
}
