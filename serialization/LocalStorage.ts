/**************************************/
/* Teng - Manages locally stored data */
/**************************************/

import { readFile, writeFile } from "fs-extra";
import { resolve } from "path";

import TengObject from "../core/TengObject";


/**
 * Manages locally stored data
 */
export class LocalStorage<T> extends TengObject
{
    /** Path to the directory where data should be stored */
    readonly storageDir: string;
    /** Name of the file */
    readonly fileName: string;
    /** File extension */
    readonly fileExtension: string;

    /** Absolute file path to the data file */
    readonly filePath: string;

    private data?: T;
    private stringData: string = "";


    /**
     * Creates an instance of the LocalStorage class
     * @param storageDirLocation Path to the directory where data should be stored
     * @param fileName Name of the file without an extension
     * @param fileExtension File extension without `.`
     */
    constructor(storageDirLocation: string, fileName: string, fileExtension: string)
    {
        super("LocalStorage", fileName);

        this.storageDir = storageDirLocation;
        this.fileName = fileName;
        this.fileExtension = fileExtension;

        this.filePath = resolve(this.storageDir, `${this.fileName}.${this.fileExtension}`);
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
