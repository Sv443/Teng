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
     * Encrypts some data with AES, using a provided encryption key.  
     * To convert the returned Buffer to a string or JSON object, use `.toString()` or `.toJSON()`
     * @returns Returns a buffer containing the encrypted data
     */
    static encrypt(data: string, key: string): Buffer
    {
        const keyHash = createHash("md5").update(key).digest("hex");
        const iv = randomBytes(tengSettings.crypto.initVectorLength);

        const cipher = createCipheriv(algorithm, Buffer.from(keyHash), iv);
        const encrypted = cipher.update(data.toString());

        return Buffer.concat([iv, encrypted, cipher.final()]);
    }

    /**
     * Tries to decrypt some data that has been encrypted using AES, using the provided encryption key.  
     * If your encrypted data is in string format, use `Buffer.from(encryptedDataAsString)`
     */
    static decrypt(encryptedData: Buffer, key: string): string
    {
        // TODO: this shit don't work

        const keyHash = createHash("md5").update(key).digest("hex");

        const iv = encryptedData.slice(0, tengSettings.crypto.initVectorLength);
        const encData = encryptedData.slice(tengSettings.crypto.initVectorLength);

        const decipher = createDecipheriv(algorithm, Buffer.from(keyHash), iv);
        const decrypted = decipher.update(encData);

        decipher.final();

        return decrypted.toString();
    }
}
