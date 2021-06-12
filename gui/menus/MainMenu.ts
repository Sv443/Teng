/*******************************/
/* Teng - Displays a main menu */
/*******************************/

import { Fonts } from "figlet";
import { unused } from "svcorelib";
import { Size } from "../../core/Base";

import { MenuOptionOrSpacer } from "./Menu";
import SelectionMenu, { ISelectionMenuResult } from "./SelectionMenu";


//#MARKER types

export default interface MainMenu
{
    /** Called whenever the outStream is resized */
    on(event: "resize", listener: (oldSize: Size, newSize: Size) => void): this;
    /** Called when the user has selected an option */
    on(event: "submit", listener: (result: ISelectionMenuResult) => void): this;
    /** Called when the user cancels the menu */
    on(event: "canceled", listener: () => void): this;
}

//#MARKER class

// TODO: GIF instead of still image
/**
 * Main menu of the game.  
 *   
 * ![example image](https://raw.githubusercontent.com/Sv443/Teng/main/docs/img/examples/MainMenu.png)
 */
export default class MainMenu extends SelectionMenu
{
    private titleFont: Fonts;

    private preloaded = false;


    /**
     * Creates an instance of the MainMenu class
     * @param title Name of the game or title of the main menu
     * @param options The selectable options - add empty string or `null` for a spacer
     * @param titleFont The font of the title banner
     */
    constructor(title: string, options?: MenuOptionOrSpacer[], titleFont: Fonts = "Standard")
    {
        super("MainMenu", title, options);

        if(options)
            this.options = options;

        this.titleFont = titleFont;


        this.settings = {
            cancelable: false,
            overflow: true,
            wasdEnabled: true
        }

        this.setLocale({
            cancel: "Exit"
        });
    }

    onResize(oldSize: Size, newSize: Size): void
    {
        unused(oldSize, newSize);
    }

    //#MARKER other

    /**
     * Preloads all dependencies of the menu, to decrease render latency
     */
    preload(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            if(this.preloaded)
                return res();

            try
            {
                await MainMenu.preloadFIGFont(this.titleFont);

                this.setFIGTitle((await MainMenu.createFIGText(this.title, this.titleFont, "default")).split(/\n/g));

                this.preloaded = true;
                return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Returns the preloaded state of this menu
     */
    isPreloaded(): boolean
    {
        return this.preloaded;
    }
}
