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
        /** Settings regarding chunks */
        chunks: {

        }
    }
});

export { tengSettings }
