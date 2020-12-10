import { EventHub } from "./eventhub.js";
import { ClientEvent, DiceEvent, NetworkEvent, symbolToString } from "./events.js";
import { Network } from "./network.js";

export class DicePusher {

    room = "";
    self = {
        id : 0,
        info : {},
        firstUser : false
    };
    users = {};
    userlist = [];
    dices = [];
    rolls = [];
    status = DicePusherStatus.SETUP;
    network = null;

    constructor(settings) {
        this.setupListeners();
        this.network = new Network(settings.network || {});
        this.status = DicePusherStatus.READY;
        this.updated();
    }

    joinRoom(room, name) {
        this.room = this.network.connect(room, name);
    }

    leaveRoom() {
        this.network.disconnect();
    }

    roll(dice) {
        dice = dice || 0;
        if (this.dices[dice] === this.self.id) {
            // allowed to roll
            let eyes = Math.floor(Math.random() * 6) + 1;
            // get the next user
            let i = 0;
            for (; i < this.userlist.length; i++) {
                if (this.userlist[i].id === this.self.id) {
                    break;
                }
            }
            i++;
            if (i >= this.userlist.length) {
                i = 0;
            }

            this.network.send(ClientEvent.ROLL_DICE, {
                dice : dice,
                eyes : eyes,
                next : this.userlist[i].id
            }, this.self.id);
            return eyes;
        }
        return 0;
    }

    addDice() {
        this.dices.push(this.self.id);
        this.sendDiceInfo();
        this.updated();
        return this.self.id;
    }

    canRoll() {
        let availableDices = [];
        for (let i = 0; i < this.dices.length; i++) {
            if (this.dices[i] === this.self.id){
                availableDices.push(i);
            }
        }
        return availableDices;
    }

    sendDiceInfo() {
        this.network.send(ClientEvent.DICE_INFO, {
            dices : this.dices.slice()
        });
    }

    updateUserList() {
        this.userlist.length = 0;
        for (let id in this.users) {
            this.userlist.push(this.users[id]);
        }
        this.userlist.sort((a, b) => {
            if (a.id > b.id) {
                return 1;
            }
            if (a.id < b.id) {
                return -1;
            }
            return 0;
        });
        this.updated();
    }

    updated() {
        // Send a generic update event for ui frameworks
        document.body.dispatchEvent(new Event("dice-pusher-updated"));
    }

    setupListeners() {
        window.addEventListener("beforeunload", () => {
            this.leaveRoom();
            return null;
        });

        EventHub.listen(NetworkEvent.NETWORK_CONNECTED, () => {
            this.status = DicePusherStatus.CONNECTING;
            this.updated();
        });
        EventHub.listen(NetworkEvent.NETWORK_DISCONNECTED, () => {
            this.status = DicePusherStatus.READY;
            this.updated();
        });
        EventHub.listen(NetworkEvent.NETWORK_FAILED, () => {
            this.status = DicePusherStatus.ERROR;
            this.updated();
        });
        EventHub.listen(NetworkEvent.NETWORK_UNAVAILABLE, () => {
            this.status = DicePusherStatus.ERROR;
            this.updated();
        });


        EventHub.listen(DiceEvent.ROOM_ENTERED, (data) => {
            this.status = DicePusherStatus.CONNECTED;
            if (data.me) {
                this.self = data.me;
            }
            if (data.members) {
                this.users = {};
                for (let id in data.members) {
                    this.users[id] = data.members[id] || {};
                    this.users[id].id = id;
                }
            }
            this.updateUserList();

            if (this.userlist.length === 1) {
                // first user
                this.self.firstUser = true;
                this.dices = [this.self.id];
            }

            this.forwardEvent(DiceEvent.ROOM_ENTERED, this.users);
        });
        EventHub.listen(DiceEvent.ROOM_USER_JOIN, (data) => {
            this.users[data.id] = data.info;
            this.users[data.id].id = data.id;

            // The first user in the current user list will send the recent dice list
            if (this.self.id === this.userlist[0].id) {
                this.sendDiceInfo();
            }

            this.updateUserList();
            this.forwardEvent(DiceEvent.ROOM_USER_JOIN, this.users);
        });
        EventHub.listen(DiceEvent.ROOM_USER_LEAVE, (data) => {
            delete this.users[data.id];
            
            if (this.userlist.length === 1) {
                // last remaining user becomes first user
                this.firstUser = true;
            }
            this.updateUserList();
            this.forwardEvent(DiceEvent.ROOM_USER_LEAVE, this.users);
        });

        EventHub.listen(ClientEvent.DICE_INFO, (data) => {
            this.dices = data.dices.slice();
            this.updated();
            this.forwardEvent(ClientEvent.DICE_INFO, data);
        });

        EventHub.listen(ClientEvent.ROLL_DICE, (data) => {
            this.rolls.push(data);
            this.dices[data.dice] = data.next;
            this.updated();
            this.forwardEvent(ClientEvent.ROLL_DICE, data);
        });
    }

    forwardEvent(event, data) {
        // forward the event to document.body
        if (!document.body) {
            return;
        }
        document.body.dispatchEvent(new Event(symbolToString(event), data))
    }
}

export const DicePusherStatus = Object.freeze({
    // The initial status at start up
    SETUP : Symbol("setup"),
    // The status once everything is ready to join a room
    READY : Symbol("ready"),
    // The status while trying to enter a room
    CONNECTING : Symbol("connecting"),
    // The status once inside a room
    CONNECTED : Symbol("connected"),
    // The status entered if there is a problem
    ERROR : Symbol("error")
});