/**
 * ### [sound-play](https://github.com/nomadhoc/sound-play)  
 * Dead simple sound player for Node -- because it should be simple.
 * @author nomadhoc
 */
declare module "sound-play"
{
    /**
     * Plays a sound
     * @param filePath The path to the sound file
     * @param volume The volume - has to be a floating point number between 0.0 and 1.0
     */
    export function play(filePath: string, volume?: number): Promise<void>;
}
