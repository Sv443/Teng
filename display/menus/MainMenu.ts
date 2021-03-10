/*******************************/
/* Teng - Displays a main menu */
/*******************************/

import { text, loadFont,  Fonts } from "figlet";

import { Menu } from "../Menu";


/** A single option of a menu - set to empty string or `null` for a spacer */
export type MenuOption = (string|null);

/**
 * Main menu of the game
 */
export class MainMenu extends Menu
{
    private title: string;
    private figTitle: string = "";
    private options: MenuOption[];
    private titleFont: Fonts;

    private preloaded = false;


    /**
     * Creates an instance of the MainMenu class
     * @param title Name of the game or title of the main menu
     * @param options The selectable options - add empty string or `null` for a spacer
     * @param titleFont The font of the 3D title
     */
    constructor(title: string, options: MenuOption[], titleFont: Fonts = "Standard")
    {
        super("MainMenu", title);

        this.title = title;
        this.options = options;
        this.titleFont = titleFont;
    }

    /**
     * Preloads all dependencies of the menu, to improve performance
     */
    preload(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            if(this.preloaded)
                return res();

            try
            {
                await MainMenu.preloadFIGFont(this.titleFont);

                this.figTitle = await MainMenu.createFIGText(this.title, this.titleFont);

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
     * Promise resolves with the selected option's index
     */
    display(): Promise<number>
    {
        return new Promise<number>(async (res, rej) => {
            if(!this.preloaded)
                await this.preload();

            // TODO: display menu & hook keypress events
            
            return res(0);
        });
    }

    //#MARKER static

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
    static createFIGText(txt: string, font: Fonts): Promise<string>
    {
        return new Promise<string>(async (res, rej) => {
            text(txt, font, (err, result) => {
                if(err || typeof result == "undefined")
                    return rej(err);
                
                return res(result);
            });
        });
    }
}
