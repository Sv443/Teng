/******************************/
/* Teng - Base class of menus */
/******************************/

import { Nullable } from "tsdef";
import { text, loadFont,  Fonts, Options, KerningMethods } from "figlet";

import TengObject from "../../../core/TengObject";
import { Size } from "../../../core/BaseTypes";


//#MARKER types

/** A single option of a menu - set to empty string or `null` for a spacer */
export type MenuOptionOrSpacer = Nullable<string>;

/** A single option of a menu - no spacers allowed */
export type MenuOption = string;

//#MARKER class

export default interface Menu
{
    /** Called whenever the outStream is resized */
    on(event: "resize", listener: (oldSize: Size, newSize: Size) => void): this;
}

/**
 * Base class for all Teng menus
 */
export default abstract class Menu extends TengObject
{
    /** The title of this menu */
    protected title: string;

    /** Selectable options of this menu */
    protected options: MenuOptionOrSpacer[] = [];

    /** The stream to write to */
    protected outStream: NodeJS.WriteStream;

    /** The size of the output stream */
    protected outStreamSize: Size;


    /**
     * Creates an instance of the Menu class
     * @param objectName The name of the object (usually the class or menu name)
     * @param title Title of this menu
     * @param outStream The stream to write to - defaults to `process.stdout`
     */
    constructor(objectName: string, title: string, outStream: NodeJS.WriteStream = process.stdout)
    {
        super(objectName, TengObject.truncateDescriptor(title));

        this.title = title;

        this.outStream = outStream;


        this.outStreamSize = Menu.getStreamSize(this.outStream);

        this.registerResizeEvent();

        this.on("resize", (o, n) => this.onResize(o, n));
    }

    toString(): string
    {
        return `Menu <${this.objectName}> with title '${TengObject.truncateDescriptor(this.title)}' - UID: ${this.uid.toString()}`;
    }

    //#MARKER private

    private registerResizeEvent(): void
    {
        this.outStream.on("resize", () => {
            const oldSize = Size.fromSize(this.outStreamSize);
            const newSize = Menu.getStreamSize(this.outStream);

            this.outStreamSize = newSize;

            this.emit("resize", oldSize, newSize);
        });
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
    addOption(option: MenuOptionOrSpacer)
    {
        if(this.options.includes(option))
            throw new TypeError(`Can't add option "${option}" to the menu because it already exists!`);

        this.options.push(option);
    }

    /**
     * Returns the options that have been set on this menu
     */
    getOptions(): MenuOptionOrSpacer[]
    {
        return this.options;
    }

    /**
     * Returns the option at the provided index
     */
    getOption(index: number): MenuOptionOrSpacer
    {
        return this.options[index];
    }

    //#MARKER abstract

    /**
     * Should be called whenever the outStream was resized
     * @param oldSize The old size of the stream
     * @param newSize The new size of the stream
     */
    protected abstract onResize(oldSize: Size, newSize: Size): void;

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
            loadFont(font, (err: Nullable<Error>) => {
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
            };

            text(txt, opts, (err, result) => {
                if(err || typeof result == "undefined")
                    return rej(err);
                
                return res(result);
            });
        });
    }

    /**
     * Checks if a passed menu option is empty
     */
    static isEmptyOption(option: MenuOptionOrSpacer): boolean
    {
        return (option === null || option === "");
    }

    /**
     * Returns the size of a stream.  
     * Returns the size of `process.stdout` if `stream` is not set.
     */
    static getStreamSize(stream: NodeJS.WriteStream = process.stdout): Size
    {
        return new Size(stream.columns, stream.rows);
    }
}
