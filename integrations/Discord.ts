import EventEmitter from "events";
import DiscordRPC from "discord-rich-presence";
import { RP, PresenceInfo } from "discord-rich-presence";



export interface DiscordIntegration
{
    on(event: "error", listener: (err: string) => void): this;
    on(event: "connected", listener: () => void): this;
}

/**
 * 
 */
export class DiscordIntegration extends EventEmitter
{
    private client: RP;

    readonly clientID: string;


    constructor(clientID: string)
    {
        super();


        this.clientID = clientID;
        this.client = DiscordRPC(this.clientID);
    }

    setPresence(presence: Partial<PresenceInfo>): void
    {
        console.log("updating");
        this.client.updatePresence(presence);

        this.client.on("connected", () => this.emit("connected"));
        this.client.on("error", (err) => this.emit("error", err));
    }
}
