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

        this.nanoTimer.setInterval(this.intTick, "", `${interval}m`);
    }
    
    /**
     * Returns a string representation of this object
     */
    toString(): string
    {
        return `GameLoop @ ${this.targetTps}tps - UID: ${this.uid.toString()}`;
    }

    //#MARKER private
    /**
     * Internal tick handler
     */
    private intTick(): void
    {
        if(typeof this.onTick === "function")
            this.onTick(this.tickNum);

        this.tickNum++;
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
