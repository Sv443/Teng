declare module "keypress"
{
    /**
     * Makes the set ReadStream begin emitting "keypress" events
     * @param inStream
     */
    function Keypress(inStream: NodeJS.ReadStream): void;

    export = Keypress;
}
