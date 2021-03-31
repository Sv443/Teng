/**************************************************************/
/* Teng - This handles Discord integration like Rich Presence */
/**************************************************************/

import { TengObject } from "../base/TengObject";
import { Client, Presence } from "discord-rpc";



//#MARKER class

export interface DiscordRPC
{
    on(event: "connected", listener: () => void): this;
    on(event: "ready", listener: () => void): this;
}

/**
 * This class handles Discord's Rich Presence
 */
export class DiscordRPC extends TengObject
{
    private client: Client;

    readonly clientID: string;
    readonly clientSecret: string;

    private loggedIn = false;


    /**
     * Creates an instance of the DiscordRPC class
     */
    constructor(clientID: string, clientSecret: string)
    {
        super("DiscordRPC");


        this.clientID = clientID;
        this.clientSecret = clientSecret;

        this.client = new Client({
            transport: "ipc"
        });

        this.client.on("connected", () => this.emit("connected"));
        this.client.on("ready", () => this.emit("ready"));
    }

    toString(): string
    {
        return `Discord RPC Integration with client ID "${this.clientID}"`;
    }

    //#MARKER other

    /**
     * Log the client in to the Discord API
     */
    login(): Promise<void>
    {
        return new Promise(async (res, rej) => {
            try
            {
                await this.client.login({
                    clientId: this.clientID,
                });

                this.loggedIn = true;

                return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }

    /**
     * Set the client's presence
     */
    setPresence(presence: Presence): Promise<void>
    {
        return new Promise(async (res, rej) => {
            try
            {
                if(!this.loggedIn)
                    await this.login();

                console.log("updating"); //#DEBUG

                await this.client.setActivity(presence);

                this.client.on("connected", () => this.emit("connected"));
                this.client.on("ready", () => this.emit("ready"));

                return res();
            }
            catch(err)
            {
                return rej(err);
            }
        });
    }
}
