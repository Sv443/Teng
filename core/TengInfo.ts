/********************************************/
/* Teng - Used to get info about the engine */
/********************************************/

import { tengSettings } from "../settings";


/**
 * Abstract class that is only used to get info about Teng
 */
export default abstract class TengInfo
{
    /**
     * Returns the current name of Teng (maybe this changes later idk)
     */
    static getName(): string
    {
        return tengSettings.info.name;
    }

    /**
     * Returns the abbreviation of Teng's current name
     */
    static getAbbr(): string
    {
        return tengSettings.info.abbreviation;
    }

    /**
     * Returns Teng's version as a number array
     */
    static getVersion(): number[]
    {
        return tengSettings.info.version;
    }

    /**
     * Returns Teng's version as a string
     */
    static getVersionStr(): string
    {
        return tengSettings.info.versionStr;
    }

    /**
     * Returns info on Teng's current main author
     */
    static getAuthorInfo()
    {
        return tengSettings.info.author;
    }

    /**
     * Returns the URL to Teng's homepage
     */
    static getHomepageUrl(): string
    {
        return tengSettings.info.homepage;
    }
}
