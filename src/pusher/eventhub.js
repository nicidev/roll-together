export class EventHub {

    static listeners = {};
    static logEvents = true;

    static listen(event, handler) {
        if (typeof handler !== "function") {
            return;
        }
        if (typeof this.listeners[event] === "undefined") {
            this.listeners[event] = [];
        }
        this.listeners[event].push(handler);
    }

    static trigger(event, data) {
        if (typeof data !== "object") {
            data = {
                value : data
            };
        }
        if (this.logEvents) {
            console.log("EventHub >> " + String(event));
            console.log(data);
        }
        for (let handler of (this.listeners[event] || [])) {
            try {
                handler(Object.assign({}, data));
            }catch(e) {
                // ignore failing handlers
            }
        }
    }
}