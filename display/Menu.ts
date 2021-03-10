/******************************/
/* Teng - Base class of menus */
/******************************/

import { tengSettings } from "../settings";
import { TengObject } from "../base/TengObject";


/**
 * Base class for all Teng menus
 */
export abstract class Menu extends TengObject
{
    limitedDescriptor: string;


    /**
     * Creates an instance of the Menu class
     * @param objectName The name of the object (usually the class or menu name)
     * @param descriptor Something to more precisely describe this object
     */
    constructor(objectName: string, descriptor: string)
    {
        const limitedDescriptor = TengObject.limitedLengthDescriptor(descriptor, tengSettings.menus.descriptorMaxLength);

        super(objectName, limitedDescriptor);

        this.limitedDescriptor = limitedDescriptor;
    }

    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `Menu <${this.objectName}> with title '${this.limitedDescriptor}' - UID: ${this.uid.toString()}`;
    }
}
