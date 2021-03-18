/****************************************/
/* Teng - Stores and loads data locally */
/****************************************/

import { readFile, writeFile } from "fs-extra";
import { resolve } from "path";
import { TengObject } from "../base/TengObject";


/**
 * Manages locally stored data
 */
export class LocalStorage<T> extends TengObject
{
    readonly storageDirLocation: string;
    readonly fileName: string;
    readonly fileExtension: string;

    readonly filePath: string;

    private data?: T;
    private stringData: string = "";

    /**
     * Creates an instance of the LocalStorage class
     */
    constructor(storageDirLocation: string, fileName: string, fileExtension: string)
    {
        super("LocalStorage", fileName);

        this.storageDirLocation = storageDirLocation;
        this.fileName = fileName;
        this.fileExtension = fileExtension;

        this.filePath = resolve(this.storageDirLocation, `${this.fileName}.${this.fileExtension}`);
    }

    toString(): string
    {
        return `${this.objectName} @ '${this.filePath}'`;
    }

    /**
     * Saves storage data to disk
     */
    save(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            try
            {
                await writeFile(this.filePath, this.stringData);

                return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Loads storage data from disk
     */
    load(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            try
            {
                const strData = (await readFile(this.filePath)).toString();

                this.stringData = strData;
                this.data = JSON.parse(strData);
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Sets the data and string data
     */
    setData(data: T): void
    {
        this.data = data;
        this.stringData = JSON.stringify(data, null, 4);
    }

    /**
     * Returns the data
     */
    getData(): T | undefined
    {
        return this.data;
    }

    /**
     * Returns the data as a string
     */
    getStringData(): string
    {
        return this.stringData;
    }
}
