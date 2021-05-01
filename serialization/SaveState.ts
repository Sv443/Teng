/******************************************************************************************************/
/* Teng - Keeps track of a save state and is responsible for saving and loading from save state files */
/******************************************************************************************************/

import { readFile, writeFile } from "fs-extra";
import { statSync, accessSync } from "fs-extra";
import { join, resolve } from "path";
import sanitize from "sanitize-filename";
import { unused, filesystem } from "svcorelib";

import { tengSettings } from "../settings";

import { JSONCompatible } from "../base/Base";
import Encryption from "../crypto/Encryption";
import TengObject from "../base/TengObject";


//#MARKER other


const encryptionKey = "TODO: figure this out";


//#MARKER class

// TODO: add compression

/**
 * Keeps track of a save state and is responsible for saving and loading from save state files
 */
export default class SaveState<T extends JSONCompatible> extends TengObject
{
    /** The data that should be saved to disk or that was read from disk */
    private data: JSONCompatible;
    /** String representation of the data to be saved */
    private stringData: string;


    private saveDirectory: string;
    private stateName: string;
    private fileExtension: string;

    private saveEncrypted: boolean;


    /**
     * Creates an instance of the SaveState class - has to be created using a type generic (see docs)!
     * @param saveDirectory The directory to save the save state file to
     * @param stateName The name of the save state
     * @param saveEncrypted Whether to save the data encrypted or not
     * @param fileExtension The file extension to save the file as (don't prefix this with a dot). Defaults to `tes`
     * @param initialData An optional initial value of the data
     */
    constructor(saveDirectory: string, stateName: string, saveEncrypted: boolean = false, fileExtension: string = tengSettings.game.saveStates.defaultFileExtension, initialData?: T)
    {
        const sanitizedStateName = SaveState.sanitizeFileName(stateName);

        super("SaveState", `${sanitizedStateName}${saveEncrypted ? "/encrypted" : ""}`);


        if(initialData)
        {
            this.data = initialData;
            this.stringData = JSON.stringify(initialData);
        }
        else
        {
            this.data = {};
            this.stringData = "{}";
        }

        this.saveDirectory = resolve(saveDirectory);
        if(!SaveState.existsSync(this.saveDirectory))
            throw new TypeError(`Provided save directory '${this.saveDirectory}' doesn't exist`);
        if(!statSync(this.saveDirectory).isDirectory())
            throw new TypeError(`Provided save directory '${this.saveDirectory}' doesn't point to a directory`);

        this.stateName = sanitizedStateName;
        this.fileExtension = fileExtension;

        this.saveEncrypted = saveEncrypted;
    }

    /**
     * Returns a string representation of this save state
     */
    toString(): string
    {
        return `${this.objectName} '${this.stateName}' @ '${this.saveDirectory}'`;
    }

    //#MARKER getters

    /**
     * Returns the absolute file path of this save state
     */
    public getAbsFilePath(): string
    {
        return join(this.saveDirectory, `${this.stateName}.${this.fileExtension}`);
    }

    /**
     * Returns the data that has been set on this state as an object
     */
    public getData(): JSONCompatible
    {
        return this.data;
    }

    /**
     * Returns the data that has been set on this state as a JSON-compatible string representation
     * @param encrypted Set to `true` to encrypt the data prior to returning it. Defaults to `false`
     */
    public getDataString(encrypted = false): string
    {
        if(encrypted)
            return Encryption.encrypt(this.stringData, this.getEncryptionKey()).toString();

        return this.stringData;
    }

    /**
     * Returns the data that has been set on this state as a Buffer instance
     * @param encrypted Set to `true` to encrypt the data prior to returning it. Defaults to `false`
     */
    public getDataBuffer(encrypted = false): Buffer
    {
        if(encrypted)
            return Encryption.encrypt(this.getDataString(false), this.getEncryptionKey());

        return Buffer.from(JSON.stringify(this.getDataString()));
    }

    //#MARKER other

    /**
     * Sets the data for this save state.  
     *   
     * **WARNING:** Only use JSON-compatible objects! Self-referencing (circular) objects and objects containing non-primitive types will cause unexpected behavior.
     * @param data JSON-compatible object to save to the save state file
     */
    public setData(data: T): Promise<void>
    {
        return new Promise<void>((res, rej) => {
            try
            {
                const strData = JSON.stringify(data);

                const sData = {
                    tengMeta: {
                        engine: {
                            version: tengSettings.info.versionStr
                        },
                        formatVer: 1,
                        stateName: this.stateName,
                        encrypted: this.saveEncrypted
                    },
                    data: (this.saveEncrypted ? Encryption.encrypt(strData, this.getEncryptionKey()).toString() : data)
                };

                this.data = sData;
                this.stringData = JSON.stringify(sData, undefined, 4);

                return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Tries to save the previously set data to disk
     */
    public save(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            //

            writeFile(this.getAbsFilePath(), this.stringData, (err) => {
                if(err)
                    return rej(err);

                return res();
            });
        });
    }

    /**
     * Loads a save state from disk.  
     * Use `getData()` or `getStringData()` to read this data.  
     * **WARNING:** overrides previously set data so use carefully!
     */
    public load(): Promise<void>
    {
        return new Promise<void>(async (res, rej) => {
            readFile(this.getAbsFilePath(), (err, buf) => {
                try
                {
                    if(err)
                        return rej(err);

                    const strData = buf.toString();
                    const data = JSON.parse(strData);

                    this.data = data;
                    this.stringData = strData;

                    return res();
                }
                catch(err)
                {
                    return rej(err);
                }
            });
        });
    }

    //#MARKER private

    /**
     * Returns the encryption key
     */
    protected getEncryptionKey(): string
    {
        return encryptionKey;
    }

    //#MARKER static
    /**
     * Sanitizes a file name so it can be used in file paths and names
     */
    static sanitizeFileName(name: string): string
    {
        return sanitize(name).substr(0, tengSettings.game.saveStates.maxStateNameLength);
    }

    /**
     * Checks if a given path exists
     */
    static exists(path: string): Promise<boolean>
    {
        return filesystem.exists(path);
    }

    /**
     * Same as `SaveState.exists()` but synchronous.  
     * You should only use this method if you *really* can't use `exists()`
     */
    static existsSync(path: string): boolean
    {
        path = resolve(path);

        try
        {
            accessSync(path);

            return true;
        }
        catch(err)
        {
            unused(err);

            return false;
        }
    }
}
