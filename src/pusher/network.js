import { EventHub } from "./eventhub.js";
import { ClientEvent, DiceEvent, NetworkEvent, symbolToString } from "./events.js";

export class Network {

    pusherLibrary = "https://js.pusher.com/7.0/pusher.min.js";
    client = null;
    channel = null;
    settings = {
        authEndpoint : "",
        appKey : "",
        appCluster : "eu"
    };

    constructor(settings) {
        for (let opt in this.settings) {
            this.settings[opt] = settings[opt] ?? this.settings[opt];
        }
        this.injectPusher();
    }

    injectPusher() {
        let script = document.createElement("script");
        script.src = this.pusherLibrary;
        document.head.append(script);
    }

    initialize(name) {
        if (!window.Pusher) {
            return;
        }

        this.client = new Pusher(this.settings.appKey, {
            cluster : this.settings.appCluster,
            authEndpoint : this.settings.authEndpoint,
            auth : {
                params : {
                    name : name
                }
            }
        });
        this.client.connection.bind("error", this.handleConnectionError.bind(this));
        this.client.connection.bind("state_change", this.handleConnectionStateChange.bind(this));
    }

    connect(roomId, name) {
        this.disconnect();
        this.initialize(name);
        roomId = ("presence-" + roomId).toLowerCase().replace(/[^a-z0-9-_]/g, "");
        this.channel = this.client.subscribe(roomId);
        this.channel.bind("pusher:subscription_succeeded", (data) => {
            EventHub.trigger(DiceEvent.ROOM_ENTERED, data);
        });
        this.channel.bind("pusher:subscription_error", (error) => {
            EventHub.trigger(NetworkEvent.NETWORK_FAILED);
            this.log("subscription error on " + roomId, error);
        });

        this.channel.bind("pusher:member_added", (data) => {
            EventHub.trigger(DiceEvent.ROOM_USER_JOIN, data);
        });

        this.channel.bind("pusher:member_removed", (data) => {
            EventHub.trigger(DiceEvent.ROOM_USER_LEAVE, data);
        });

        for (let event in ClientEvent) {
            let eventName = "client-" + symbolToString(ClientEvent[event]);
            this.channel.bind(eventName, ((event) => {
                return (data, metadata) => {
                    data.sender = metadata.user_id;
                    EventHub.trigger(event, data);
                }
            })(event));
            this.log("subscribed to " + eventName);
        }
        return roomId;
    }

    disconnect() {
        if (this.channel) {
            this.channel.unsubscribe();
            this.channel.disconnect();
            this.channel = null;
        }
        if (this.client) {
            this.client.disconnect();
        }
    }

    send(event, data, sender) {
        if (!this.channel || !this.channel.subscribed) {
            return;
        }
        let eventName = symbolToString(event);
        if (eventName.indexOf("client-") !== 0) {
            eventName = "client-" + eventName;
        }
        this.channel.trigger(eventName, data);
        if (sender) {
            data.sender = sender;
            EventHub.trigger(event, data);
        }
    }

    handleConnectionStateChange(states) {
        this.log("connection state change", states);
        switch(states.current) {
            case "connecting":
                EventHub.trigger(NetworkEvent.NETWORK_CONNECTING);
                break;
            case "connected":
                EventHub.trigger(NetworkEvent.NETWORK_CONNECTED);
                break;
            case "disconnected":
                EventHub.trigger(NetworkEvent.NETWORK_DISCONNECTED);
                this.channel = null;
                break;
            case "failed":
                EventHub.trigger(NetworkEvent.NETWORK_FAILED);
                this.channel = null;
                break;
            case "unavailable":
                EventHub.trigger(NetworkEvent.NETWORK_UNAVAILABLE);
                this.channel = null;
                break;
        }
    }

    handleConnectionError(error) {
        this.log("error", error);
        if (error.error.data.code === 4004) {
            // pusher connection limit reached
            this.log("connection limit reached");
        }
        EventHub.trigger(NetworkEvent.NETWORK_FAILED);
    }

    log(msg, o) {
        console.log("pusher >> " + msg);
        if (o) {
            console.log(o);
        }
    }
}