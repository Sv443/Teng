/********************************/
/* Teng - Handles the game loop */
/********************************/

import NanoTimer from "nanotimer";
import { tengSettings } from "../settings";

import { TengObject } from "./TengObject";


/**
 * The type of game loop event
 */
declare type GameLoopEvent = "tick";

/**
 * This class handles the game loop, aka the ticks / FPS and maybe other stuff, idk yet
 */
export class GameLoop extends TengObject
{
    private targetTps: number;
    private nanoTimer: NanoTimer;

    /** Number of ticks that have passed since this game loop was created */
    private tickNum: number = 0;

    /** Function to be called on each tick - change this with the `on("tick", func)` method */
    private onTick: null | ((tickNum: number) => void) = null;

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
            if(typeof that.onTick === "function")
                that.onTick(that.tickNum);

            that.tickNum++;
        }
    }

    //#MARKER events
    /**
     * Registers an event
     */
    on(event: GameLoopEvent, callback: null | ((tickNum: number) => void)): void
    {
        switch(event)
        {
            case "tick":
                this.onTick = callback;
            break;
        }
    }

    /**
     * Removes an event that was previously set with `on()`
     */
    removeEvent(event: GameLoopEvent): void
    {
        this.on(event, null);
    }
}
