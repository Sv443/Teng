/*************************************************************************************/
/* Teng - Wrapper for the Promise class that keeps track of the state of the Promise */
/*************************************************************************************/

import TengObject from "./TengObject";


//#MARKER types

/**
 * Describes the state of a Promise
 */
export type PromiseState = "pending" | "fulfilled" | "rejected";

//#MARKER class

/**
 * This class is a wrapper for the Promise class.  
 * It keeps track of the state of the promise, allowing
 */
export default class StatePromise<T> extends TengObject
{
    private intPromise: Promise<T>;
    private state: PromiseState = "pending";


    /**
     * Creates an instance of the StatePromise class, which keeps track of the state of a Promise
     */
    constructor(promise: Promise<T>)
    {
        super("StatePromise");

        this.intPromise = promise;
    }

    toString(): string
    {
        const state = this.getState();
        return `StatePromise [${state}] - UID: ${this.uid.toString()}`;
    }

    /**
     * Actually runs the Promise
     * @returns Returns a new Promise (not the one from the constructor) that does however inherit the parameters from the constructor-Promise
     */
    exec(): Promise<T>
    {
        return new Promise<T>((res, rej) => {
            this.intPromise.then((...args) => {
                this.state = "fulfilled";
                return res(...args);
            }).catch((...args) => {
                this.state = "rejected";
                return rej(...args);
            });
        });
    }

    /**
     * Returns the state of this Promise
     */
    getState(): PromiseState
    {
        return this.state;
    }
}
