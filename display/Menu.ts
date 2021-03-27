/******************************/
/* Teng - Base class of menus */
/******************************/

import { TengObject } from "../base/TengObject";


/**
 * Base class for all Teng menus
 */
export abstract class Menu extends TengObject
{
    /** The title of this menu */
    protected title: string;


    /**
     * Creates an instance of the Menu class
     * @param objectName The name of the object (usually the class or menu name)
     * @param title Title of this menu
     */
    constructor(objectName: string, title: string)
    {
        super(objectName, TengObject.truncateDescriptor(title));

        this.title = title;
    }

    toString(): string
    {
        return `Menu <${this.objectName}> with title '${TengObject.truncateDescriptor(this.title)}' - UID: ${this.uid.toString()}`;
    }

    //#MARKER other

    /**
     * Returns the title of this menu
     */
    getTitle(): string
    {
        return this.title;
    }

    //#MARKER static

    /**
     * Checks if a value is a menu
     */
    isMenu(value: any): value is Menu
    {
        value = (value as Menu);

        if(typeof value.getTitle() !== "string")
            return false;

        return true;
    }
}
