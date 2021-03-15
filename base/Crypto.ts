/******************************************/
/* Teng - Handles crypto stuff ¯\_(ツ)_/¯ */
/******************************************/

import { createCipheriv, createDecipheriv } from "crypto";


/**
 * Handles crypto stuff ¯\\_(ツ)_/¯
 */
export abstract class Crypto
{
    /**
     * TODO: Encrypts some data with AES, using a provided encryption key
     */
    static encrypt(data: string, key: string): string
    {
        return data;
    }

    /**
     * TODO: Decrypts some data that has been encrypted using AES, using a provided encryption key
     */
    static decrypt(encryptedData: string, key: string): string
    {
        return encryptedData;
    }
}
