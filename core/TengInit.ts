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
     * Initializes Teng
     */
    public static init(initOptions: IInitOptions): Promise<void>
    {
        const options = { ...defaultIInitOptions, ...initOptions };

        return new Promise(async (res, rej) => {
            try
            {
                if(!initFlags.introPlayed)
                    await TengInit.displayIntro(options.outStream);

                initFlags.initialized = true;

                return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Displays the Teng intro, then resolves the returned Promise
     */
    protected static displayIntro(outStream: NodeJS.WritableStream = process.stdout): Promise<void>
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
}
