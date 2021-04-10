/************************************************/
/* Teng - Displays a scrollable list of options */
/************************************************/

import { DeepPartial } from "tsdef";
import { IKeypressObject, InputHandler } from "../../../input/InputHandler";
import { Menu, MenuOption } from "./Menu";
import { SelectionMenu, ISelectionMenuResult } from "./SelectionMenu";


//#MARKER types

declare interface IPaginationSettings
{
    [key: string]: boolean | number | undefined;

    /** Whether pagination is enabled or not */
    enabled: boolean;
    /** The number of options to show per page. Set to `undefined` or `NaN` to have Teng determine it automatically based on terminal size. */
    optionsPerPage?: number;
}

export interface IListMenuSettings
{
    [key: string]: boolean | NodeJS.ReadStream | NodeJS.WriteStream | IPaginationSettings;

    /** Whether the WASD keys can be used to scroll this menu, additionally to the arrow keys. */
    wasdEnabled: boolean;
    /** The stream to grab keystroke input from. Defaults to `process.stdin` */
    inStream: NodeJS.ReadStream;
    /** The stream to draw the menu to. Defaults to `process.stdout` */
    outStream: NodeJS.WriteStream;
    /** Pagination settings */
    pagination: IPaginationSettings;
}

const defaultIListMenuSettings: IListMenuSettings = {
    wasdEnabled: true,
    inStream: process.stdin,
    outStream: process.stdout,
    pagination: {
        enabled: true
    }
};

//#MARKER class

export default interface ListMenu
{
    /** Called when the user has selected an option */
    on(event: "submit", listener: (result: ISelectionMenuResult) => void): this;
    /** Called when the user cancels the menu */
    on(event: "canceled", listener: () => void): this;
}

/**
 * Displays a scrollable list of options
 */
export default class ListMenu extends Menu
{
    protected settings: DeepPartial<IListMenuSettings>;

    protected cursorPos: number = 0;
    protected pageIndex: number = 0;
    protected options: MenuOption[] = [];
    protected pages: MenuOption[][] = [];

    protected inputPaused = true;
    protected inputHandler: InputHandler;


    /**
     * Creates an instance of the ListMenu class
     * @param title The title of this ListMenu
     * @param options Initial values of this ListMenu - else use `.addOption()` or `.setOptions()`
     * @param inStream The stream to grab keystroke input from. Defaults to `process.stdin`
     * @param outStream The stream to draw the menu to. Defaults to `process.stdout`
     */
    constructor(title: string, options?: MenuOption[], settings?: DeepPartial<IListMenuSettings>)
    {
        super("ListMenu", title);


        if(options)
            this.options = options;

        this.settings = { ...defaultIListMenuSettings, ...settings };

        this.inputHandler = new InputHandler();
    }

    addOption(opt: MenuOption): void
    {
        this.options.push(opt);
    }

    addOptions(opts: MenuOption[]): void
    {
        opts.forEach(o => this.addOption(o));
    }

    setOptions(opts: MenuOption[]): void
    {
        this.options = opts;
    }

    getOption(index: number): MenuOption
    {
        return this.options[index];
    }

    getOptions(): MenuOption[]
    {
        return this.options;
    }

    /**
     * Shows this menu and hooks keypress events
     */
    show(): void
    {
        this.inputPaused = false;

        this.registerInputHandler();

        this.draw();
    }

    /**
     * Hides this menu.  
     * Will emit "canceled" and "submit" with the currently highlighted option
     */
    hide(): void
    {
        this.inputPaused = true;

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

    //#MARKER protected

    /**
     * After `show()` was called, this will get called each time the set stdout changes its size
     */
    protected onResize(): void
    {
        //TODO:
    }

    /**
     * TODO: Draw shit
     */
    protected draw(): void
    {

    }

    /**
     * Register keypress events n stuff
     */
    protected registerInputHandler(): void
    {
        const opts = this.getOptions();


        const moveCursor = (vert?: number, hor?: number) => {
            // TODO:
        };


        const onKeyPress = (char: string, key?: IKeypressObject) => {
            if(this.inputPaused)
                return;

            switch(key?.name)
            {
                case "w":
                    if(!this.settings.wasdEnabled)
                        break;

                    // falls through

                case "up":
                    moveCursor(-1);
                break;
                case "s":
                    if(!this.settings.wasdEnabled)
                        break;

                    // falls through

                case "down":
                    moveCursor(1);
                break;

                case "a":
                    if(!this.settings.wasdEnabled)
                        break;

                    // falls through

                case "left":
                    moveCursor(undefined, -1);
                break;
                case "d":
                    if(!this.settings.wasdEnabled)
                        break;

                    // falls through

                case "right":
                    moveCursor(undefined, 1);
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
                    {
                        if(!this.settings.cancelable)
                            break;

                        this.inputHandler.removeListener("key", onKeyPress);

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
                    }
                break;
            }
        };

        this.inputHandler.on("key", onKeyPress);
        (this.settings.outStream as NodeJS.WriteStream).on("resize", () => this.onResize());
    }

    /**
     * Clear console
     */
    protected clearConsole(): void
    {
        return SelectionMenu.clearConsole();
    }
}
