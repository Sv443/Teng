/**********************************************************************************/
/* Teng - Contains multiple audio instances and offers ways to cycle through them */
/**********************************************************************************/

import { TengObject } from "../base/TengObject";
import { Track } from "./Audio";


/**
 * The mode of cycling through the audios in the playlist
 */
export enum CycleMode
{
    /** Audio has to be played manually */
    Manual,
    /** Audio is played in consecutive order */
    Consecutive,
    /** Audio is randomly played, without repeating the same song twice */
    Shuffle,
}

/**
 * Contains multiple audio instances and offers ways to cycle through them
 */
export class Playlist extends TengObject
{
    private cycleMode: CycleMode = CycleMode.Manual;

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
        return `Playlist with ${this.tracks.length} tracks - cycle mode: ${CycleMode[this.cycleMode]} - UID: ${this.uid.toString()}`;
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
    addTrack(audio: Track): void
    {
        this.tracks.push(audio);
    }

    /**
     * Returns the track at the specified index or with the specified name.  
     * @returns Returns `undefined` if no matching track was found
     */
    getTrack(indexOrName: number | string): Track | undefined
    {
        if(typeof indexOrName === "number")
            return this.tracks?.[indexOrName] || undefined;

        return this.tracks.find(t => t.name == indexOrName);
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


        let foundAudio = this.tracks.find(t => t.name == indexOrName);

        if(!foundAudio)
            return false;

        this.tracks.splice(this.tracks.indexOf(foundAudio), 1);
        return true;
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
