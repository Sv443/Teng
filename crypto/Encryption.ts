/**********************************************/
/* Teng - Handles encrypting stuff ¯\_(ツ)_/¯ */
/**********************************************/

import { createCipheriv, createDecipheriv, createHash, randomBytes, CipherCCMTypes, CipherGCMTypes } from "crypto";
import { tengSettings } from "../settings";


const algorithm: CipherCCMTypes | CipherGCMTypes = "aes-256-gcm";

/**
 * Handles the encrypting of stuff ¯\\\_(ツ)\_/¯
 */
export default abstract class Encryption
{
    /**
     * Encrypts a string with AES, using a provided encryption key.  
     * To convert the returned Buffer to a string or JSON object, use `.toString()` or `.toJSON()`
     * @returns Returns a buffer containing the encrypted data
     */
    static encrypt(data: string, key: string): Buffer
    {
        return Encryption.encryptRaw(Buffer.from(data), key);
    }

    /**
     * Encrypts a raw data (a Buffer instance) with AES, using a provided encryption key.  
     * To convert the returned Buffer to a string or JSON object, use `.toString()` or `.toJSON()`
     * @returns Returns a buffer containing the encrypted data
     */
    static encryptRaw(data: Buffer, key: string): Buffer
    {
        const keyHash = createHash("md5").update(key).digest("hex");
        const iv = randomBytes(tengSettings.crypto.initVectorLength);

        const cipher = createCipheriv(algorithm, Buffer.from(keyHash), iv);
        const encrypted = cipher.update(data);

        return Buffer.concat([iv, encrypted, cipher.final()]);
    }

    /**
     * Tries to decrypt some data that has been encrypted using AES, using the provided encryption key.  
     * Supports raw data (as a Buffer instance) and string data.
     * @returns Returns the decrypted data as a string
     */
    static decrypt(encryptedData: Buffer | string, key: string): string
    {
        return Encryption.decryptRaw(encryptedData, key).toString();
    }

    /**
     * Tries to decrypt some data that has been encrypted using AES, using the provided encryption key.  
     * Supports raw data (as a Buffer instance) and string data.
     * @returns Returns the raw decrypted data (as a Buffer instance)
     */
    static decryptRaw(encryptedData: Buffer | string, key: string): Buffer
    {
        const keyHash = createHash("md5").update(key).digest("hex");

        const iv = encryptedData.slice(0, tengSettings.crypto.initVectorLength);
        const encData = encryptedData.slice(tengSettings.crypto.initVectorLength);

        const decipher = createDecipheriv(algorithm, Buffer.from(keyHash), iv);
        const decrypted = decipher.update((encData instanceof Buffer) ? encData : Buffer.from(encData));

        // using Decipher.final() somehow crashes??
        // Even tho the documentation says I should be able to????? - https://nodejs.org/api/crypto.html#crypto_decipher_final_outputencoding
        // What is this shit???????????????
        //
        // decipher.final();

        decipher.end();

        return decrypted;
    }
}
