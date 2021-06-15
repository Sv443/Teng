/**************************************************/
/* Teng - A way to play audio on the command line */
/**************************************************/

import { resolve } from "path";
import { statSync } from "fs-extra";
import * as sound from "sound-play";

import TengObject from "../core/TengObject";
import { IAudioMetadata, parseFile } from "music-metadata";
// import { StatePromise } from "svcorelib";


/**
 * Internal name of the audio
 */
export type AudioName = string;

/**
 * Contains the Audio class instance and its name
 */
export interface Track
{
    name: AudioName;
    instance: Audio;
}

/**
 * Describes the state of an audio
 */
export type AudioState = "playing" | "paused" | "stopped";


/**
 * Contains an audio file and offers an interface to play it
 */
export class Audio extends TengObject
{
    private filePath: string;

    private currentTime = 0.0;
    private volume = 1.0;

    private state: AudioState = "stopped";

    private meta?: IAudioMetadata;


    /**
     * Constructs an instance of the Audio class
     * @param filePath Path to the audio file
     */
    constructor(filePath: string)
    {
        super("Audio");

        filePath = resolve(filePath);

        try
        {
            if(!statSync(filePath).isFile())
                throw new TypeError(`File path "${filePath}" is invalid or doesn't point to a file`);
        }
        catch(err)
        {
            throw new TypeError(`File path "${filePath}" doesn't exist: ${err}`);
        }

        this.filePath = filePath;
    }

    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `${this.objectName} @ ${this.filePath} - UID: ${this.uid.toString()}`;
    }

    /**
     * Loads this audio's metadata
     */
    loadMeta(): Promise<IAudioMetadata>
    {
        return new Promise<IAudioMetadata>(async (res, rej) => {
            try
            {
                this.meta = await parseFile(this.filePath);

                return res(this.meta);
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Plays the audio
     */
    play(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            try
            {
                const state = this.getState();

                if(state === "paused" || state === "stopped")
                {
                    this.state = "playing";
                    await sound.play(this.filePath, this.volume);

                    return res();
                }
                else
                    return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    // /**
    //  * Pauses the audio
    //  */
    // pause(): void
    // {
    //     const state = this.getState();

    //     if(state === AudioState.Playing)
    //     {
    //         // TODO:
    //     }
    // }

    // /**
    //  * Stops the audio
    //  */
    // stop(): void
    // {
    //     const state = this.getState();

    //     if(state === AudioState.Playing || state === AudioState.Paused)
    //     {
    //         // TODO:
    //     }
    // }

    /**
     * Returns the audio's state (playing / paused / stopped)
     */
    getState(): AudioState
    {
        return this.state;
    }

    /**
     * Sets the time of the audio
     * @param time
     */
    setTime(time: number): void
    {
        if(time < 0)
            throw new TypeError(`Provided time ${time} is out of range (expected 0.0 or more)`);

        this.currentTime = time;
    }

    /**
     * Returns the time of the audio
     */
    getTime(): number
    {
        return this.currentTime;
    }

    /**
     * Sets the volume of the audio
     * @param vol
     */
    setVolume(vol: number): void
    {
        if(vol < 0.0 || vol > 1.0)
            throw new TypeError(`Volume ${vol} is out of range (expected value between 0.0 and 1.0)`);

        this.volume = vol;
    }

    /**
     * Returns the volume of the audio
     */
    getVolume(): number
    {
        return this.volume;
    }

    /**
     * Returns this audio's metadata.  
     * Run `loadMeta()` first to load it.  
     *   
     * Returns `undefined` if `loadMeta()` wasn't run yet
     */
    getMeta(): IAudioMetadata | undefined
    {
        return this.meta;
    }

    //#MARKER static

    /**
     * Checks if the passed value is an Audio
     */
    static isAudio(value: any): value is Audio
    {
        value = (value as Audio);

        if(typeof value.play !== "function")
            return false;

        if(typeof value.pause !== "function")
            return false;

        if(typeof value.stop !== "function")
            return false;

        return true;
    }
}
