declare module "async-json"
{
    type AsyncJsonCallback = (err: (string | undefined), jsonValue: string) => void;

    namespace asyncJSON {
        /**
         * Asynchronous version of `JSON.stringify()` - turns a JavaScript object into a JSON string
         * @param input JavaScript object to stringify
         * @param callback Function that is called when the object was stringified
         */
        function stringify(input: object, callback: AsyncJsonCallback): void;
    }

    export = asyncJSON;
}
