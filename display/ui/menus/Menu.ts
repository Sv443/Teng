/******************************/
/* Teng - Base class of menus */
/******************************/

import { TengObject } from "../../../base/TengObject";
import { text, loadFont,  Fonts, Options, KerningMethods } from "figlet";


/** A single option of a menu - set to empty string or `null` for a spacer */
export type MenuOption = string | null;

/**
 * Base class for all Teng menus
 */
export abstract class Menu extends TengObject
{
    /** The title of this menu */
    protected title: string;

    /** Selectable options of this menu */
    protected options: MenuOption[] = [];


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

    /**
     * Adds an option to this menu
     */
    addOption(option: MenuOption)
    {
        if(this.options.includes(option))
            throw new TypeError(`Can't add option "${option}" to the menu because it already exists!`);

        this.options.push(option);
    }

    /**
     * Returns the options that have been set on this menu
     */
    getOptions(): MenuOption[]
    {
        return this.options;
    }

    //#MARKER static

    /**
     * Checks if a value is a menu
     */
    static isMenu(value: any): value is Menu
    {
        value = (value as Menu);

        if(typeof value.getTitle() !== "string")
            return false;

        return true;
    }

    /**
     * Preloads a font so the menu can be created faster
     * @param font Name of the FIGlet font
     */
    static preloadFIGFont(font: Fonts = "Standard")
    {
        return new Promise<void>((res, rej) => {
            loadFont(font, (err: Error | null) => {
                if(err != null)
                    return rej(err);

                return res();
            });
        });
    }
 
    /**
     * Creates FIGText out of the passed text and font
     */
    static createFIGText(txt: string, font: Fonts, kerning: KerningMethods = "default"): Promise<string>
    {
        return new Promise<string>(async (res, rej) => {
            const opts: Options = {
                font,
                horizontalLayout: kerning
            }

            text(txt, opts, (err, result) => {
                if(err || typeof result == "undefined")
                    return rej(err);
                
                return res(result);
            });
        });
    }
}
