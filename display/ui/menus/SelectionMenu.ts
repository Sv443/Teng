/*******************************************************/
/* Teng - SelectionMenu that doesn't clear the console */
/*******************************************************/

import { allOfType, unused, Errors, colors } from "svcorelib";

import { tengSettings } from "../../../settings";
import { TengObject } from "../../../base/TengObject";
import { Menu, MenuOption } from "./Menu";
import { InputHandler } from "../../../input/InputHandler";

const col = colors.fg;


//#MARKER types
/**
 * An object of settings to be used in the constructor of the `SelectionMenu` class
 */
export interface ISelectionMenuSettings
{
    /** Whether or not the user can cancel the prompt with the Esc key */
    cancelable: boolean;
    /** If the user scrolls past the end or beginning, should the SelectionMenu overflow to the other side? */
    overflow: boolean;
    /** Stream to write output to */
    outStream: NodeJS.WriteStream;
}

export interface ISelectionMenuResult
{
    /** If this is `true`, the user has canceled the SelectionMenu by pressing the Escape key */
    canceled: boolean;

    /** An object containing the index and text of the selected option */
    option: {
        /** The zero-based index of the option the user has selected */
        index: number;
        /** The description / text of the option the user has selected */
        description: string;
    }
}

export interface ISelectionMenuLocale
{
    /** Shorthand name of the escape key - defaults to "Esc" */
    escKey: string;
    /** Cancel text - defaults to "Cancel" */
    cancel: string;
    /** Scroll text - defaults to "Scroll" */
    scroll: string;
    /** Shorthand name of the return key - defaults to "Return" */
    returnKey: string;
    /** Select text - defaults to "Select" */
    select: string;
}

export interface SelectionMenu
{
    /** Called when the user has selected an option */
    on(event: "submit", listener: (result: ISelectionMenuResult) => void): this;
}

//#MARKER class

/**
 * A scrollable menu from which the user can select a single option
 */
export class SelectionMenu extends Menu
{
    private settings: Partial<ISelectionMenuSettings> = {};
    private optIndex = 0;
    private locale: ISelectionMenuLocale;

    protected figTitle: string[] = [];

    private outStream: NodeJS.WriteStream;

    private inputHandler: InputHandler;


    /**
     * Creates an instance of the SelectionMenu class
     */
    constructor(objName: string, title: string, options?: MenuOption[], settings?: Partial<ISelectionMenuSettings>)
    {
        super(objName, TengObject.truncateDescriptor(title));


        if(!process.stdin || !process.stdin.isTTY || typeof process.stdin.setRawMode != "function")
            throw new Errors.NoStdinError(`The current terminal doesn't have a stdin stream or is not a compatible TTY terminal.`);

        if(settings)
            this.settings = settings;

        this.outStream = this.settings?.outStream || process.stdout;


        this.title = title;
        this.setOptions(options || []);
        
        this.locale = {
            escKey: "Esc",
            cancel: "Exit",
            scroll: "Scroll",
            returnKey: "Return",
            select: "Select"
        };

        this.inputHandler = new InputHandler();
    }

    toString(): string
    {
        const extraInfo: string[] = [];

        if(this.settings.cancelable)
            extraInfo.push("cancelable");
        if(this.settings.overflow)
            extraInfo.push("overflowing");

        return `SelectionMenu <${this.objectName}> with title "${this.title}" ${extraInfo.length > 0 ? `(Settings: ${extraInfo.join(", ")}) ` : ""}- UID: ${this.uid.toString()}`;
    }

    //#MARKER other

    /**
     * Sets this menu's FIG title (banner title)
     */
    setFIGTitle(title: string[]): void
    {
        this.figTitle = title;
    }

    /**
     * Returns the FIG title of this menu
     */
    getFIGTitle(): string[]
    {
        return this.figTitle;
    }

    /**
     * Sets this menu's options
     */
    setOptions(options: MenuOption[]): void
    {
        this.options = options;
    }

    /**
     * Adds an option to this menu
     */
    addOption(option: MenuOption): void
    {
        this.options.push(option);
    }

    /**
     * Shows this menu
     */
    show(): void
    {
        this.registerInputHandler();

        this.draw();
    }

    //#MARKER private / protected

    /**
     * Registers the input handler
     */
    private registerInputHandler()
    {
        this.inputHandler.on("key", (char, key) => {
            // TODO:
            switch(key?.name)
            {
                case "w":
                case "up":

                break;
                case "s":
                case "down":

                break;
                case "return":

                break;
                case "escape":

                break;
            }
        });
    }

    /**
     * Called to draw the menu to the outStream
     */
    protected draw(): void
    {
        this.clearConsole();

        const logTxt = [];

        const figText = this.getFIGTitle();

        if(figText.length === 0)
            logTxt.push(`${col.blue}${this.title}${col.rst}\n`);
        else
        {
            figText.forEach(line => logTxt.push(line));
            logTxt.push("");
        }

        this.options.forEach((opt, i) => {
            logTxt.push(`${i == this.optIndex ? `${col.yellow}> ${opt}` : `  ${opt}`}${col.rst}`);
        });

        logTxt.push(`\n\n${this.settings.cancelable ? `[${this.locale.escKey}] ${this.locale.cancel} - ` : ""}[▲ ▼] ${this.locale.scroll} - [${this.locale.returnKey}] ${this.locale.select} `);

        this.outStream.write(logTxt.join("\n"));
    }

    // addListeners()
    // {
    //     process.stdin.setRawMode(true);

    //     process.stdin.on("keypress", (char, key) => {
    //         unused(char);
            
    //         if(this.onCooldown || !key)
    //             return;
    
    //         this.onCooldown = true;

    //         setTimeout(() => {
    //             this.onCooldown = false;
    //         }, tengSettings.menus.inputCooldown);


    //         switch(key.name)
    //         {
    //             case "c": // exit process if CTRL+C is pressed
    //                 if(key.ctrl === true)
    //                     process.exit(0);
    //             break;
    //             case "space":
    //             case "return":
    //                 // submit currently selected option
    //                 this.removeListeners();

    //                 this.execCallbacks();
    //             break;
    //             case "s":
    //             case "down":
    //                 this.optIndex++;

    //                 if(this.settings.overflow && this.optIndex > (this.options.length - 1))
    //                     this.optIndex = 0;
    //                 else if(this.optIndex > (this.options.length - 1))
    //                     this.optIndex = (this.options.length - 1);

    //                 this.update();
    //             break;
    //             case "a":
    //             case "up":
    //                 if(this.settings.overflow && this.optIndex == 0)
    //                     this.optIndex = (this.options.length - 1);
    //                 else if(this.optIndex == 0)
    //                     this.optIndex = 0;
    //                 else
    //                     this.optIndex--;
                    
    //                 this.update();
    //             break;
    //             case "escape":
    //                 if(this.settings.cancelable)
    //                 {
    //                     this.removeListeners();

    //                     this.execCallbacks(true);
    //                 }
    //             break;
    //         }
    //     });
    //     process.stdin.resume();
    // }

    // execCallbacks(canceled)
    // {
    //     if(typeof canceled != "boolean")
    //         canceled = false;
        
    //     let retObj = {
    //         canceled: canceled,
    //         option: {
    //             index: this.optIndex,
    //             description: this.options[this.optIndex]
    //         }
    //     };

    //     this.clearConsole();

    //     this.callbackFn(retObj);
    //     this.promiseRes(retObj);
    // }

    // close(): void
    // {
    //     let rmRes = this.removeAllListeners();
    //     let upRes = this.update();

    //     this.clearConsole();

    //     return (rmRes && upRes);
    // }

    private clearConsole(): void
    {
        this.outStream.clearLine(0);
        this.outStream.cursorTo(0, 0);
        this.outStream.write("\n");

        try
        {
            if(!tengSettings.menus.preferShiftOutput && console && this.outStream && this.outStream.isTTY)
                console.clear();
            else
                for(let i = 0; i < this.outStream.rows; i++)
                    process.stdout.write("\n");
        }
        catch(err)
        {
            return;
        }
    }
}
