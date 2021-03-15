[<< Home](./home.md#readme)

# Teng - Class Overview

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

[<< Home](./home.md#readme)
