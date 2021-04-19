/***********************************************************/
/* Teng - The Core module handles Teng's integral features */
/***********************************************************/

import { tengSettings } from "../settings";


/**
 * Core module that handles integral engine stuff
 */
export default abstract class Core
{
    /**
     * Initializes Teng
     */
    public static init(outStream: NodeJS.WritableStream = process.stdout): Promise<void>
    {
        return new Promise(async (res, rej) => {
            try
            {
                await Core.displayIntro(outStream);

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

                setTimeout(() => res(), 3000);
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }
}
