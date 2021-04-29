/****************************************************/
/* Teng - Handles Teng's startup and initialization */
/****************************************************/

import { tengSettings } from "../settings";


//#MARKER types

export interface IInitOptions
{
    /** Stream to write the Teng intro to - defaults to `process.stdout` */
    outStream?: NodeJS.WritableStream;
    /** TODO: Debug mode makes Teng send out a lot of debug messages to the `outStream` */
    debugMode?: boolean;
}

const defaultIInitOptions: IInitOptions = {
    outStream: process.stdout,
    debugMode: false,
}

const initFlags = {
    introPlayed: false,
    initialized: false,
};

//#MARKER class

/**
 * Handles Teng's startup and initialization
 */
export default abstract class TengInit
{
    /**
     * Initializes Teng by doing the following:
     * 1. Show Teng intro sequence
     * 2. Initialize some of Teng's modules
     */
    public static init(initOptions: IInitOptions): Promise<void>
    {
        const options = { ...defaultIInitOptions, ...initOptions };

        return new Promise(async (res, rej) => {
            try
            {
                if(!initFlags.introPlayed && !initFlags.initialized)
                    await Promise.all([TengInit.playIntro(options.outStream), TengInit.initModules()]);
                else
                {
                    if(!initFlags.introPlayed)
                        await TengInit.playIntro(options.outStream);

                    if(!initFlags.initialized)
                        await TengInit.initModules();
                }

                return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Returns the state of Teng's initialization
     */
    public static isInitialized(): boolean
    {
        return initFlags.initialized;
    }

    /**
     * Tells you if Teng's intro sequence was already played or not
     */
    public static introPlayed(): boolean
    {
        return initFlags.introPlayed;
    }

    //#MARKER protected

    /**
     * Plays the Teng intro
     */
    protected static playIntro(outStream: NodeJS.WritableStream = process.stdout): Promise<void>
    {
        return new Promise(async (res, rej) => {
            try
            {
                outStream.write("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
                outStream.write(`${tengSettings.info.name} v${tengSettings.info.versionStr}`);
                outStream.write("\n\n\n\n\n\n");

                setTimeout(() => {
                    initFlags.introPlayed = true;

                    return res();
                }, 3000);
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Initializes some of Teng's modules that need one-time initialization
     */
    protected static initModules(): Promise<void>
    {
        return new Promise(async (res) => {
            // (todo)

            initFlags.initialized = true;
            return res();
        });
    }
}
