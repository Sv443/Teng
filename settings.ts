/**************************/
/* Teng - Engine Settings */
/**************************/

import { Color, Size } from "./base/Base";
import * as packageJson from "./package.json";


/** Teng engine settings */
const tengSettings = Object.freeze({
    info: {
        /** The full name of the engine */
        name: "Teng",
        /** Engine name abbreviation to use in object descriptors and more */
        abbreviation: "TE",
        /** Version, as a number array */
        version: packageJson.version.split(/\./g).map(v=>parseInt(v)),
        /** Version, as a string */
        versionStr: packageJson.version,
        /** Teng's main author */
        author: packageJson.author,
    },
    loop: {
        /** Default ticks per second */
        defaultTps: 5,
    },
    menus: {
        /** The maximum length of menu descriptors */
        descriptorMaxLength: 16,
    },
    objects: {
        /** The default maximum length of teng object descriptors */
        descriptorDefaultMaxLength: 16,
    },
    game: {
        /** The color of the cursor - has to be a value in the Color enum from `Base.ts` */
        cursorColor: Color.Magenta,
        chunks: {

        },
        noise: {
            /** Default resolution value for layered noise generation */
            defaultResolution: 30,
            /** Default length of noise map seeds */
            defaultSeedLength: 10,
        },
        saveStates: {
            /** Maximum length of a save state name - in characters */
            maxStateNameLength: 32,
            /** File extension to save save states as (don't prefix this with a dot) */
            defaultFileExtension: "tes",
        }
    }
});

export { tengSettings }
