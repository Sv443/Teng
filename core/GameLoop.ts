/********************************/
/* Teng - Handles the game loop */
/********************************/

import NanoTimer from "nanotimer";
import { DeepPartial } from "tsdef";

import { tengSettings } from "../settings";

import TengObject from "./TengObject";


//#MARKER types

/**
 * Settings for the game loop
 */
export interface IGameLoopSettings
{
    /** Tick desyncs that don't pass this threshold in milliseconds will not emit the "desync" event */
    desyncEventThreshold: number;
}

const defaultIGameLoopSettings: IGameLoopSettings = {
    desyncEventThreshold: 50
};

//#MARKER class

export default interface GameLoop
{
    /** Event gets emitted on each tick of the game */
    on(event: "tick", listener: (tickNum: number, deltaTime: number) => void): this;
    /** Event gets emitted when a tick is desynced (when the loop ticks earlier or later than expected) */
    on(event: "desync", listener: (targetTickTime: number, actualTickTime: number) => void): this;
}

/**
 * This class handles the game loop, aka the ticks / FPS and maybe other stuff, idk yet
 */
export default class GameLoop extends TengObject
{
    private targetTps: number;
    private nanoTimer: NanoTimer;

    private settings: DeepPartial<IGameLoopSettings>;

    /** Number of ticks that have passed since this game loop was created */
    private tickNum = 0;
    /** The interval at which tick events are sent */
    private tickInterval: number;
    /** Like `Time.deltaTime` in Unity, this property equals the milliseconds between the last and the current tick. Is set to `NaN` on the 0th tick. */
    private deltaTime = NaN;

    private lastTickTS = NaN;
    private tickTimes: number[] = [];
    private lastTickTimeDiff = NaN;


    /**
     * Creates an instance of the GameLoop class
     * @param targetTps Sets a target for how many ticks there should be per second
     */
    constructor(targetTps: number = tengSettings.loop.defaultTps, glSettings?: DeepPartial<IGameLoopSettings>)
    {
        super("GameLoop", targetTps.toString());

        this.settings = { ...defaultIGameLoopSettings, ...glSettings };

        this.targetTps = targetTps;

        // maybe this needs to be changed but it should work for now:
        const interval = Math.round(1000 / this.targetTps);
        this.tickInterval = interval;

        this.nanoTimer = new NanoTimer();


        // `intTick()` is called before `this` is created, so use setImmediate to improve the chances of `this` existing
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
        return `${this.objectName} @ ${this.targetTps}tps - UID: ${this.uid.toString()}`;
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
        // NanoTimer calls this function before `this` is created. setImmediate should fix this issue, but just to be sure, check if `this` exists. If not, skip the first tick:
        if(this)
        {
            const now = Date.now();

            if(!isNaN(this.lastTickTS))
            {
                this.deltaTime = (now - this.lastTickTS);

                // calculate tick time difference and check for desyncs
                if(isNaN(this.lastTickTimeDiff))
                    this.lastTickTimeDiff = this.deltaTime;
                else
                {
                    const targetTickInterval = this.getTickInterval();

                    if(typeof this.settings?.desyncEventThreshold === "number")
                    {
                        // desync event threshold was set, so check for desync with it in mind
                        const threshold = Math.abs(this.settings.desyncEventThreshold);

                        // if current tick time difference exceeds the target tick interval time in either direction (positive or negative), emit the desync event
                        if((this.deltaTime - threshold) > targetTickInterval || (this.deltaTime + threshold) < targetTickInterval)
                            this.emit("desync", targetTickInterval, this.deltaTime);
                    }
                    else
                    {
                        // threshold wasn't set, so just check for exact equality
                        if(this.deltaTime != targetTickInterval)
                            this.emit("desync", targetTickInterval, this.deltaTime);
                    }
                }

                this.tickTimes.push(this.deltaTime);
            }


            this.lastTickTS = now;

            this.emit("tick", this.tickNum, this.deltaTime);

            this.tickNum++;
        }
    }
}
