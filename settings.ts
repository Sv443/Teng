/**************************/
/* Teng - Engine Settings */
/**************************/

import { Color } from "./base/Base";
import * as packageJson from "./package.json";


/** Teng engine settings */
const tengSettings = Object.freeze({
    info: {
        /** The name of the engine */
        name: "Teng",
        /** Engine name abbreviation to use in class descriptors and more */
        abbreviation: "TE",
        /** Version, as a number array */
        version: packageJson.version.split(/\./g).map(v=>parseInt(v)),
        /** Version, as a string */
        versionStr: packageJson.version,
    },
    loop: {
        /** Default ticks per second */
        defaultTps: 5
    },
    menus: {
        /** The maximum length of menu descriptors */
        descriptorMaxLength: 16
    },
    game: {
        /** The color of the cursor */
        cursorColor: Color.Magenta
    }
});

export { tengSettings }
