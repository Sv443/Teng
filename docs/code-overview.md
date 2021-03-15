[<< Home](./home.md#readme)

# Teng - Code Overview [WIP]

## Table of Contents:
- [Base Classes](#base-classes)
    - [TengObject](#tengobject)
    - [Position](#position)
    - [Area](#area)
    - [Size](#size)
- [Components](#components)
    - [Grid](#grid)
    - [Chunk](#chunk)
    - [Cell](#cell)

<br><br>

# Base Classes
## TengObject
This is the base class for most of Teng's instantiatable classes.  
It is an abstract class, meaning it has to be extended (inherited) and can't be directly instantiated.  
  
This class exposes these properties:
> ### `uid`
> This property is a [`symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol), meaning it is 100% unique, even if the class instances are created with equal parameters.  
> This enables you to always have a unique identifier for each object.  
> The description of the symbol has the following syntax:  
> ```
> Symbol(TE/OBJ_NAME/DESCRIPTOR)
> ```
> - TE is the Teng Engine prefix
> - OBJ_NAME is the name of the class
> - DESCRIPTOR is a string that describes the class instance
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