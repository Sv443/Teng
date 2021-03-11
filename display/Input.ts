/*********************************/
/* Teng - Handles keyboard input */
/*********************************/

import keypress from "keypress";


/**
 * This class handles keyboard input
 */
export class Input
{
    inStream: NodeJS.ReadStream;

    /**
     * Creates an instance of the Input class
     * @param inStream The ReadStream to read keypresses from - defaults to `process.stdin`
     */
    constructor(inStream: NodeJS.ReadStream = process.stdin)
    {
        this.inStream = inStream;

        //TODO: test if this works
        keypress(inStream);
    }
}
