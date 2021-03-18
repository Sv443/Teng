/********************************/
/* Teng - Handles the game loop */
/********************************/

import NanoTimer from "nanotimer";
import { EventEmitter } from "events";
import { tengSettings } from "../settings";

import { TengObject } from "./TengObject";


/**
 * This class handles the game loop, aka the ticks / FPS and maybe other stuff, idk yet
 */
export class GameLoop extends TengObject
{
    private targetTps: number;
    private nanoTimer: NanoTimer;

    /** Number of ticks that have passed since this game loop was created */
    private tickNum: number = 0;

    /**
     * Creates an instance of the GameLoop class
     * @param targetTps Sets a target for how many ticks there should be per second
     */
    constructor(targetTps: number = tengSettings.loop.defaultTps)
    {
        super("GameLoop", targetTps.toString());

        this.targetTps = targetTps;


        // maybe this needs to be changed but it should work for now:
        const interval = Math.round(1000 / this.targetTps);

        this.nanoTimer = new NanoTimer();

        setImmediate(() => {
            this.nanoTimer.setInterval(this.intTick, [this], `${interval}m`);
        });
    }
    
    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `GameLoop @ ${this.targetTps}tps - UID: ${this.uid.toString()}`;
    }

    //#MARKER getters
    /**
     * Returns the current amount of game ticks that have passed since the creation of this game loop
     */
    getTicks(): number
    {
        return this.tickNum;
    }

    //#MARKER private
    /**
     * Internal tick handler
     * @param that Reference to `this` is lost when NanoTimer calls this method, so it has to be explicitly passed as a parameter
     */
    private intTick(that: GameLoop): void
    {
        // NanoTimer calls this function before `this` is created. setImmediate should fix this issue, but just to be sure, check if `this` exists:
        if(that)
        {
            that.emit("tick", that.tickNum);

            that.tickNum++;
        }
    }
}
