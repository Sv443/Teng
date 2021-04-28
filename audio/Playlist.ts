/**********************************************************************************/
/* Teng - Contains multiple audio instances and offers ways to cycle through them */
/**********************************************************************************/

import { IAudioMetadata } from "music-metadata";
import StatePromise, { PromiseState } from "../base/StatePromise";
import TengObject from "../base/TengObject";
import { Track } from "./Audio";


/**
 * The mode of cycling through the tracks in the playlist
 */
export enum CycleMode
{
    /** Cycling disabled, tracks have to be played manually */
    Off,
    /** Tracks are played in consecutive order */
    Consecutive,
    /** Tracks are randomly played, without them repeating */
    Shuffle,
}

/**
 * Contains multiple audio instances and offers ways to cycle through them
 */
export class Playlist extends TengObject
{
    private cycleMode: CycleMode = CycleMode.Off;

    private tracks: Track[] = [];

    /**
     * Creates an instance of the Playlist class
     */
    constructor(cycleMode: CycleMode, tracks?: Track[])
    {
        super("Playlist");

        this.cycleMode = cycleMode;

        if(tracks != undefined)
            this.tracks = tracks;
    }

    toString(): string
    {
        return `${this.objectName} with ${this.tracks.length} tracks - cycle mode: ${CycleMode[this.cycleMode]} - UID: ${this.uid.toString()}`;
    }

    /**
     * Sets the cycle mode - is applied when the next track plays or the play/pause/stopped state changed
     */
    setCycleMode(cycleMode: CycleMode): void
    {
        this.cycleMode = cycleMode;
    }

    /**
     * Adds a track to this playlist
     */
    addTrack(track: Track): void
    {
        this.tracks.push(track);
    }

    /**
     * Sets the tracks of this playlist
     */
    setTracks(tracks: Track[]): void
    {
        this.tracks = tracks;
    }

    /**
     * Returns the track at the specified index or with the specified name.  
     * @returns Returns `undefined` if no matching track was found
     */
    getTrack(indexOrName: number | string): Track | undefined
    {
        if(typeof indexOrName === "number")
            return this.tracks?.[indexOrName];

        return this.tracks.find(t => t.name == indexOrName);
    }

    /**
     * Returns all tracks - empty array if unset
     */
    getTracks(): Track[]
    {
        return this.tracks;
    }

    /**
     * Removes a track at the specified index or name  
     * @returns Returns a boolean of whether the track could be removed
     */
    removeTrack(indexOrName: number | string): boolean
    {
        if(typeof indexOrName === "number")
        {
            if(indexOrName < 0)
                return false;

            if(indexOrName > this.tracks.length - 1)
                return false;

            this.tracks.splice(indexOrName, 1);
            return true;
        }


        const foundTrack = this.tracks.find(t => t.name == indexOrName);

        if(!foundTrack)
            return false;

        this.tracks.splice(this.tracks.indexOf(foundTrack), 1);
        return true;
    }

    /**
     * Loads the metadata of all tracks in this playlist
     */
    loadMetadata(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            try
            {
                const loadProms: Promise<IAudioMetadata>[] = [];

                this.tracks.forEach(track => {
                    loadProms.push(track.instance.loadMeta());
                });


                const meta = await Promise.all(loadProms);

                return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    //#MARKER static

    /**
     * Checks if a value is an instance of the Playlist class
     */
    static isPlaylist(val: any): val is Playlist
    {
        return (val instanceof Playlist);
    }
}
