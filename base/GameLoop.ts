/********************************/
/* Teng - Handles the game loop */
/********************************/

import NanoTimer from "nanotimer";
import { EventEmitter } from "events";
import { tengSettings } from "../settings";

import { TengObject } from "./TengObject";


/**
 * Settings for the game loop
 */
export interface IGameLoopSettings
{
    /** Tick desyncs that don't pass this threshold in milliseconds will not emit the "desync" event */
    desyncEventThreshold: number;
}

export interface GameLoop
{
    /** Event gets emitted on each tick of the game */
    on(event: "tick", listener: (tickNum: number) => void): this;
    /** Event gets emitted when a tick is desynced (when the loop ticks earlier or later than expected) */
    on(event: "desync", listener: (targetTickTime: number, actualTickTime: number) => void): this;
}

/**
 * This class handles the game loop, aka the ticks / FPS and maybe other stuff, idk yet
 */
export class GameLoop extends TengObject
{
    private targetTps: number;
    private nanoTimer: NanoTimer;

    private settings: Partial<IGameLoopSettings> = {};

    /** Number of ticks that have passed since this game loop was created */
    private tickNum = 0;
    /** The interval at which tick events are sent */
    private tickInterval: number;

    private lastTickTS = 0;
    private tickTimes: number[] = [];
    private lastTickTimeDiff = NaN;

    private deltaTime = NaN;

    /**
     * Creates an instance of the GameLoop class
     * @param targetTps Sets a target for how many ticks there should be per second
     */
    constructor(targetTps: number = tengSettings.loop.defaultTps, glSettings?: Partial<IGameLoopSettings>)
    {
        super("GameLoop", targetTps.toString());

        if(glSettings)
            this.settings = glSettings;

        this.targetTps = targetTps;

        // maybe this needs to be changed but it should work for now:
        const interval = Math.round(1000 / this.targetTps);
        this.tickInterval = interval;

        this.nanoTimer = new NanoTimer();


        setImmediate(() => {
            // arrow function is needed so the reference to `this` in `intTick()` persists
            this.nanoTimer.setInterval(() => this.intTick(), [], `${interval}m`);
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

    /**
     * Returns the average time between ticks
     */
    getAvgTickTime(): number
    {
        return this.tickTimes.reduce((acc, val) => acc + val) / this.tickTimes.length;
    }

    /**
     * Returns the tick interval in milliseconds, calculated from the target TPS
     */
    getTickInterval(): number
    {
        return this.tickInterval;
    }

    /**
     * Returns the target TPS
     */
    getTargetTPS(): number
    {
        return this.targetTps;
    }

    /**
     * Returns the delta time (time between the last and the current frame)
     */
    getDeltaTime(): number
    {
        return this.lastTickTimeDiff;
    }

    //#MARKER private

    /**
     * Internal tick handler
     */
    public intTick(): void
    {
        const now = Date.now();

        if(this.lastTickTS > 0)
        {
            const curTickDiff = (now - this.lastTickTS);

            // calculate tick time difference and check for desyncs
            if(isNaN(this.lastTickTimeDiff))
                this.lastTickTimeDiff = curTickDiff;
            else
            {
                const targetTickInterval = this.getTickInterval();

                process.stdout.write(`${curTickDiff}/${targetTickInterval}  --  `);//#DEBUG

                if(typeof this.settings?.desyncEventThreshold === "number")
                {
                    // desync event threshold was set, so check for desync with it in mind
                    const threshold = Math.abs(this.settings.desyncEventThreshold);

                    // if current tick time difference exceeds the target tick interval time in either direction (positive or negative), emit the desync event
                    if((curTickDiff - threshold) > targetTickInterval || (curTickDiff + threshold) < targetTickInterval)
                        this.emit("desync", targetTickInterval, curTickDiff);
                }
                else
                {
                    // threshold wasn't set, so just check for exact equality
                    if(curTickDiff != targetTickInterval)
                        this.emit("desync", targetTickInterval, curTickDiff);
                }
            }

            this.tickTimes.push(curTickDiff);

            this.lastTickTS = now;
        }
        else
            this.lastTickTS = now;

        // NanoTimer calls this function before `this` is created. setImmediate should fix this issue, but just to be sure, check if `this` exists:
        if(this)
        {
            this.emit("tick", this.tickNum);

            this.tickNum++;
        }
    }
}
