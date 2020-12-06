export const ClientEvent = Object.freeze({
    DICE_INFO : Symbol("dice-info"),
    ROLL_DICE : Symbol("roll-dice")
});

export const DiceEvent = Object.freeze({
    // Self entered a room
    ROOM_ENTERED : Symbol("room-entered"),
    // Another user entered the room
    ROOM_USER_JOIN : Symbol("room-usr-join"),
    // Another user left the room
    ROOM_USER_LEAVE : Symbol("room-user-leave"),
});

export const NetworkEvent = Object.freeze({
    NETWORK_CONNECTING : Symbol("network-connecting"),
    NETWORK_CONNECTED : Symbol("network-connected"),
    NETWORK_UNAVAILABLE : Symbol("network-unavailable"),
    NETWORK_FAILED : Symbol("network-failed"),
    NETWORK_DISCONNECTED : Symbol("network-disconnected")
});

export function symbolToString(symbol) {
    let tmp = String(symbol);
    if (tmp.indexOf("Symbol(") === 0) {
        tmp = tmp.substr(7, tmp.length - 8);
    }
    return tmp;
}