/***********************************************************/
/* Teng - The Core module handles Teng's integral features */
/***********************************************************/

import { tengSettings } from "../settings";


//#MARKER types

export interface IInitOptions
{
    outStream?: NodeJS.WritableStream;
}

const defaultIInitOptions: IInitOptions = {
    outStream: process.stdout,
}

const coreProps = {
    introPlayed: false,
    initialized: false,
};

//#MARKER class

/**
 * Core module that handles integral engine stuff
 */
export default abstract class Core
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
                if(!coreProps.introPlayed)
                    await Core.displayIntro(options.outStream);

                coreProps.initialized = true;

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
                    coreProps.introPlayed = true;

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
