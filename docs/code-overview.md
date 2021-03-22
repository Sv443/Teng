[<< Home](./home.md#readme)

# Teng - Code Overview [WIP]

## Table of Contents:
- [Modules](#modules)
    - **[Base Module](#base-module)**
        - [TengObject](#tengobject)
        - [Base Namespace](#base-namespace)
            - [Position](#position)
            - [Area](#area)
            - [Size](#size)
        - [GameLoop](#gameloop)
        - [Crypto](#crypto)
        - [StatePromise](#statepromise)
    - **[Audio Module](#audio-module)**
        - [Audio](#audio)
        - [Playlist](#playlist)
    - **[Components Module](#components-module)**
        - [Cell](#cell)
        - [Chunk](#chunk)
        - [Grid](#grid)
    - **[Display Module](#display-module)**
        - [Camera](#camera)
        - [Menu](#menu)
            - [MainMenu](#mainmenu)
    - **[Input Module](#input-module)**
        - [InputHandler](#inputhandler)
    - **[Noise Module](#noise-module)**
        - [LayeredNoise](#layerednoise)
        - [NoiseLayer](#noiselayer)
        - [MapGen](#mapgen)
    - **[Serialization Module](#serialization-module)**
        - [LocalStorage](#localstorage)
        - [SaveState](#savestate)
- [Components](#components)
    - [Grid](#grid)
    - [Chunk](#chunk)
    - [Cell](#cell)

<br><br>

# Modules

## Base Module
The base module, located at `/base/` contains base classes, gimmicks and other features that can't be categorized.

## TengObject
This is the base class for most of Teng's instantiatable classes.  
It is an abstract class, meaning it has to be extended (inherited) and can't be directly instantiated.  
  
This class exposes these properties:
> ### `uid`
> This property is a [`symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol), meaning it is 100% unique, even if the class instances are created with equal parameters.  
> This enables you to always have a unique identifier for each object.  
> The description of the symbol has the following syntax:  
> ```
> Symbol(TE~INDEX/OBJ_NAME/DESCRIPTOR)
> ```
> - `TE` is the Teng Engine prefix
> - `INDEX` is a unique zero-based index that increments for each created teng object
> - `OBJ_NAME` is the name of the class
> - `DESCRIPTOR` is a string that describes the class instance
>   
> This UID is created by calling `super(OBJ_NAME, DESCRIPTOR)` in the constructor of the extended (derived) class.

<br>

> ### `objectName`
> This is a string that is equal to the `OBJ_NAME` part of the UID property.  
> It assumes the value of the first parameter of the `super(OBJ_NAME, DESCRIPTOR)` call in the constructor of the extended (derived) class.

<br>

> ### `creationTime`
> This is an instance of the `Date` class, set to the exact time when the teng object instance was created.  
> Currently, it has millisecond accuracy but this might change later on.

<br>

> ### `uniqueIdx`
> This is a number that starts at 0 and increments every time a new teng object is instantiated.  
> I only added it because I wanted a use case for JavaScript's generator functions, don't judge me.

<br><br>



## Position
This class describes a position in a 2D space (with unsigned integer precision).  
Unsigned integer means it can't be negative and also can't have floating point numbers.  
It has an `x` and a `y` property, which are its 2D coordinate values.  
Teng's 2D areas define `x` as the horizontal axis and `y` as the vertical axis, where the very top-left is always `x=0` and `y=0`  
  
This class does *not* extend [TengObject.](#tengobject)

<br><br>



## Area
This class describes an area in a 2D plane (also, like the position, with unsigned integer precision, so they can't be negative and can't be floating point).  
Contrary to [Size](#size) it needs two positions; the top-left (TL) corner and the bottom-right (BR) corner.  
  
This class does *not* extend [TengObject.](#tengobject)

<br><br>



## Size
This class describes a size of a 2D area, without actually specifying its precise coordinates, which is what makes it different from the [Area.](#area)  
It has two properties; width and height. Both have unsigned integer precision (can't be negative and can't be floating point).  
  
This class does *not* extend [TengObject.](#tengobject)

<br><br>



## StatePromise
This class is a wrapper for JS' [Promise API.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)  
  
Usually, you can't view the state of a Promise, unless you do some janky string matching.  
This class aims to fix this by adding a method `getState()` which returns the current state of the promise.  
  
<details><summary><b>Example code - click to view</b></summary>

```ts
import { StatePromise, PromiseState } from "./engine/base/StatePromise";
import { randRange } from "svcorelib";


function waitASecond()
{
    return new Promise<number>((res, rej) => {
        // async task that needs time to complete
        setTimeout(() => {
            // randomly resolve or reject, for demonstration:
            const resolve = (randRange(0, 1) === 1);

            if(resolve)
            {
                // return a random number as parameter, for demonstration:
                const randNum = randRange(0, 100);
                return res(randNum);
            }
            else
                return rej(new Error("Hello, I am an error")); // return an error message
        }, 1000);
    });
}

async function promiseTest()
{
    // create a new StatePromise that should supervise the Promise returned by waitASecond():
    const statePromise = new StatePromise<number>(waitASecond());
    // get the StatePromise's state:
    let state = statePromise.getState();

    console.log(`BEGIN - state: ${PromiseState[state]} (${state})`);

    try
    {
        // exec actually runs the promise (waitASecond() in this case):
        const num = await statePromise.exec();
        // get the StatePromise's state:
        state = statePromise.getState();

        console.log(`DONE - state: ${PromiseState[state]} (${state}) - Random number: ${num}`);
    }
    catch(err)
    {
        // get the StatePromise's state:
        state = statePromise.getState();

        console.log(`REJECTED - state: ${PromiseState[state]} (${state}) - ${err}`);
    }
}

promiseTest();
```

</details>

<br><br><br><br><br><br>




# Components

## Grid

<br><br>



## Chunk

<br><br>



## Cell

<br><br>

<br><br>

[<< Home](./home.md#readme)
