/*******************************/
/* Teng - Displays a main menu */
/*******************************/

import { Fonts } from "figlet";

import { Menu, MenuOption } from "./Menu";
import { ISelectionMenuResult, SelectionMenu } from "./SelectionMenu";


//#MARKER types

export interface MainMenu
{
    /** Called when the user has selected an option */
    on(event: "submit", listener: (result: ISelectionMenuResult) => void): this;
}

//#MARKER class

/**
 * Main menu of the game
 */
export class MainMenu extends SelectionMenu
{
    private titleFont: Fonts;

    private preloaded = false;


    /**
     * Creates an instance of the MainMenu class
     * @param title Name of the game or title of the main menu
     * @param options The selectable options - add empty string or `null` for a spacer
     * @param titleFont The font of the title banner
     */
    constructor(title: string, options?: MenuOption[], titleFont: Fonts = "Standard")
    {
        super("MainMenu", title, options);

        if(options)
            this.options = options;

        this.titleFont = titleFont;
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

                this.setFIGTitle((await MainMenu.createFIGText(this.title, this.titleFont)).split(/\n/g));

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
     * Displays the main menu.  
     * Promise resolves with the selected option's index. Alternatively you can hook the `submit` event.
     */
    show(): Promise<ISelectionMenuResult>
    {
        return new Promise<ISelectionMenuResult>(async (res) => {
            if(!this.preloaded)
                await this.preload();

            this.show();

            this.on("submit", result => {
                this.emit("submit", result);

                res(result);
                return;
            });
        });
    }
}
