/*******************************************************/
/* Teng - SelectionMenu that doesn't clear the console */
/*******************************************************/

import { Errors, colors } from "svcorelib";
import { DeepPartial } from "tsdef";

import { TengObject } from "../../../base/TengObject";
import { Menu, MenuOption } from "./Menu";
import { InputHandler, IKeypressObject } from "../../../input/InputHandler";

const col = colors.fg;


//#MARKER types
/**
 * An object of settings to be used in the constructor of the `SelectionMenu` class
 */
export interface ISelectionMenuSettings
{
    [index: string]: boolean | NodeJS.WriteStream;

    /** Whether or not the user can cancel the prompt with the Esc key */
    cancelable: boolean;
    /** If the user scrolls past the end or beginning, should the SelectionMenu overflow to the other side? */
    overflow: boolean;
    /** Whether the WASD keys can be used to scroll this menu, additionally to the arrow keys. */
    wasdEnabled: boolean;
    /** Stream to write output to */
    outStream: NodeJS.WriteStream;
}

const defaultISelectionMenuSettings: ISelectionMenuSettings = {
    cancelable: true,
    overflow: true,
    wasdEnabled: true,
    outStream: process.stdout
};

export interface ISelectionMenuResult
{
    [index: string]: boolean | object;

    /** If this is `true`, the user has canceled the SelectionMenu by pressing the Escape key */
    canceled: boolean;

    /** An object containing the index and text of the selected option, or in case the menu was canceled, the last highlighted option */
    option: {
        /** The zero-based index of the option the user has selected */
        index: number;
        /** Text of the option the user has selected - set to `null` or an empty string when a spacer has somehow been selected (even though it should be impossible) */
        text: MenuOption;
    }
}

export interface ISelectionMenuLocale
{
    [index: string]: string;

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
    /** Called when the user cancels the menu */
    on(event: "canceled", listener: () => void): this;
}

//#MARKER class

/**
 * A scrollable menu from which the user can select a single option.
 */
export class SelectionMenu extends Menu
{
    protected settings: DeepPartial<ISelectionMenuSettings> = {};
    protected cursorPos: number = 0;
    protected locale: ISelectionMenuLocale;

    protected figTitle: string[] = [];

    protected outStream: NodeJS.WriteStream;

    protected inputHandler: InputHandler;


    /**
     * Creates an instance of the SelectionMenu class
     */
    constructor(objName: string, title: string, options?: MenuOption[], settings?: DeepPartial<ISelectionMenuSettings>)
    {
        super(objName, TengObject.truncateDescriptor(title));


        if(!process.stdin || !process.stdin.isTTY || typeof process.stdin.setRawMode != "function")
            throw new Errors.NoStdinError(`The current terminal doesn't have a stdin stream or is not a compatible TTY terminal.`);

        this.settings = { ...defaultISelectionMenuSettings, ...settings };

        this.outStream = (this.settings.outStream as NodeJS.WriteStream);

        if(this.settings.wasdEnabled == undefined)
            this.settings.wasdEnabled = true;


        this.title = title;
        this.setOptions(options || []);
        
        this.locale = {
            escKey: "Esc",
            cancel: "Cancel",
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
     * Sets the locale of this menu
     * @param locale Partial locale object. Only the provided properties are overridden.
     */
    setLocale(locale: Partial<ISelectionMenuLocale>): void
    {
        Object.keys(locale).forEach(key => {
            if(key != undefined && locale[key] != undefined)
                this.locale[key] = locale[key] || this.locale[key];
        });
    }

    /**
     * Returns the locale of this menu
     */
    getLocale(): ISelectionMenuLocale
    {
        return this.locale;
    }

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
     * Removes elements from this menu's options and, if necessary, inserts new elements in their place.
     * @param start The zero-based location in the options from which to start removing options.
     * @param deleteCount The number of options to remove.
     * @param items New options to insert into the existing options in place of the deleted ones.
     */
    spliceOptions(start: number, deleteCount?: number, ...opts: MenuOption[]): void
    {
        if(!Array.isArray(opts) || (opts != undefined && opts.length > 0))
            this.options.splice(start, deleteCount);
        else if(deleteCount)
            this.options.splice(start, deleteCount, ...opts);
    }

    /**
     * Removes all options of this menu
     */
    removeOptions(): void
    {
        this.options = [];
    }

    /**
     * Shows this menu
     */
    show(): void
    {
        this.registerInputHandler();

        this.draw();
    }

    /**
     * Removes all listeners and cancels the menu. Emits both "canceled" and "submit".  
     * Make sure to call listeners (`.on("event")` methods) again if you need them.
     */
    hide(): void
    {
        this.removeAllListeners();

        this.clearConsole();

        this.emit("canceled");

        const result: ISelectionMenuResult = {
            canceled: true,
            option: {
                index: this.cursorPos,
                text: this.options[this.cursorPos]
            }
        }

        this.emit("submit", result);
    }

    //#MARKER private / protected / static

    /**
     * Registers the input handler
     */
    protected registerInputHandler()
    {
        /** How many steps the cursor still needs to move */
        let cursorMoveSteps = NaN;
        /** Used to temporarily store the cursor pos before it is applied */
        let tempCursorPos = this.cursorPos;

        let maxOptionIndex = this.options.length - 1;


        const opts = this.getOptions();


        // check that first and last option aren't spacers
        if(SelectionMenu.isEmptyOption(opts[0]) || SelectionMenu.isEmptyOption(opts[maxOptionIndex]))
            throw new Error(`SelectionMenu options can't start or end in spacers`);


        /**
         * Moves the cursor `by` a passed number of positions (can be a negative or positive number) and skips empty options.  
         */
        const moveCursor = (by: number) =>
        {
            if(isNaN(cursorMoveSteps))
                cursorMoveSteps = by;

            if(by === 0)
                return;

            if(by % 1 !== 0)
                throw new TypeError(`Can't move SelectionMenu cursor by floating point number ${by} - only use an integer here`);

            const moveDirection = cursorMoveSteps < 0 ? -1 : 1;

            if(cursorMoveSteps !== 0)
            {
                if(!SelectionMenu.isEmptyOption(opts[(tempCursorPos + moveDirection)]))
                    cursorMoveSteps -= moveDirection;

                tempCursorPos += moveDirection;

                if(tempCursorPos < 0)
                {
                    // cursor is trying to overflow
                    if(this.settings.overflow)
                        tempCursorPos = maxOptionIndex;
                    else
                        tempCursorPos -= moveDirection;
                }

                if(tempCursorPos > maxOptionIndex)
                {
                    // cursor is trying to overflow
                    if(this.settings.overflow)
                        tempCursorPos = 0;
                    else
                        tempCursorPos -= moveDirection;
                }

                moveCursor(by);
            }
            else
            {
                // cursor is on the desired position

                // apply temp cursor pos to real cursor pos
                this.cursorPos = tempCursorPos;

                // reset variables
                cursorMoveSteps = NaN;
                maxOptionIndex = this.options.length - 1;

                // redraw menu so that new cursor position is shown
                this.draw();
            }
        }

        const onKeyPress = (char: string, key?: IKeypressObject) => {
            switch(key?.name)
            {
                case "w":
                    if(!this.settings.wasdEnabled)
                        break;
                case "up":
                    moveCursor(-1);
                break;
                case "s":
                    if(!this.settings.wasdEnabled)
                        break;
                case "down":
                    moveCursor(1);
                break;
                case "return":
                {
                    this.clearConsole();

                    const result: ISelectionMenuResult = {
                        canceled: false,
                        option: {
                            index: this.cursorPos,
                            text: opts[this.cursorPos]
                        }
                    };

                    this.inputHandler.removeListener("key", onKeyPress);

                    this.emit("submit", result);
                }
                break;
                case "escape":
                    if(!this.settings.cancelable)
                        break;

                    this.inputHandler.removeListener("key", onKeyPress);

                    // TODO:
                    this.clearConsole();

                    const result: ISelectionMenuResult = {
                        canceled: true,
                        option: {
                            index: this.cursorPos,
                            text: opts[this.cursorPos]
                        }
                    };

                    this.emit("canceled");
                    this.emit("submit", result);
                break;
            }
        };

        this.inputHandler.on("key", onKeyPress);
    }

    /**
     * Called to draw the menu to the outStream
     */
    protected draw(): void
    {
        this.clearConsole();

        const logTxt = [];


        logTxt.push("");


        const figText = this.getFIGTitle();

        if(figText.length === 0)
            logTxt.push(` ${col.blue}${this.title}${col.rst}\n`);
        else
        {
            figText.forEach(line => logTxt.push(` ${line}`));
            logTxt.push("");
        }


        
        let longestOptionLength = NaN;
        
        // find out longest option so the horizontal border length and variable option padding can be calculated
        this.options.map(val => {
            if(val && (val.length > longestOptionLength || isNaN(longestOptionLength)))
            longestOptionLength = val?.length;
        });
        

        const cursorCharL = "►";
        const cursorCharR = "◄";
        const verticalBorderChar = "║";


        // calculate horizontal border
        let horizontalBorder = "════════";

        for(let i = 0; i < longestOptionLength; i++)
            horizontalBorder += "═";

        logTxt.push(`  ■${horizontalBorder}■`);


        // insert empty line
        const insEmptyLine = () => {
            let line = `  ${verticalBorderChar}    `;

            for(let i = 0; i < longestOptionLength; i++)
                line += " ";

            line += `    ${verticalBorderChar}`;

            logTxt.push(line);
        };

        insEmptyLine();


        this.options.forEach((opt, i) => {
            if(opt === null)
                opt = "";

            const optionText = (i === this.cursorPos) ? `${col.yellow}${cursorCharL} ${opt}` : `  ${opt}  `;

            const variableOptionPaddingLength = longestOptionLength - opt.length;

            let variableOptionPadding = "";

            for(let i = 0; i < variableOptionPaddingLength; i++)
                variableOptionPadding += " ";

            logTxt.push(`  ${verticalBorderChar}  ${optionText}${variableOptionPadding}${i === this.cursorPos ? ` ${cursorCharR}` : ""}${col.rst}  ${verticalBorderChar}`);
        });

        insEmptyLine();

        logTxt.push(`  ■${horizontalBorder}■`);


        // print control help text
        logTxt.push(`\n\n  ${this.settings.cancelable ? `[${this.locale.escKey}] ${this.locale.cancel} - ` : ""}[▲ ▼] ${this.locale.scroll} - [${this.locale.returnKey}] ${this.locale.select} `);


        // concat array and write all at once to reduce flickering
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

    protected clearConsole(): void
    {
        SelectionMenu.clearConsole(this.outStream);
    }

    /**
     * Clears the console
     * @param outStream Output stream - defaults to `process.stdout`
     */
    static clearConsole(outStream: NodeJS.WriteStream = process.stdout): void
    {
        try
        {
            console.clear();
        }
        catch(err)
        {
            let padding = [];

            for(let i = 0; i < outStream.rows; i++)
                padding.push("\n");

            outStream.write(padding.join(""));
        }
    }
}
