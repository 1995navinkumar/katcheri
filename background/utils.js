function uuid() {
    return Math.random().toString(36).substr(2, 9);
}

const pipe = (...fns) => x => fns.reduce((y, f) => f(y), x);

function composeEventHandler(eventHandler = {}) {
    var events = {};


    function off(eventName) {
        events[eventName] = undefined;
    }

    function trigger(eventName) {
        var callbacks = events[eventName] || [];
        var args = Array.prototype.slice.call(arguments, 1);
        callbacks.forEach(callback => setTimeout(() => {
            callback.call(this, ...args);
        }, 0));
    }

    function on(eventName, callback) {
        var event = events[eventName];
        if (!event) {
            event = [];
            events[eventName] = event;
        }
        event.push(callback);
    }

    function getEvents() {
        return events;
    }

    var composedEventHandler = {
        on,
        off,
        trigger,
        getEvents
    }

    assignEvents.call(composedEventHandler, eventHandler);

    return composedEventHandler;
}

function assignEvents(eventHandler) {
    var keys = Object.keys(eventHandler);
    if (keys.length > 0) {
        keys.forEach(eventName => {
            this.getEvents()[eventName] = [];
            var callback = eventHandler[eventName];
            this.on(eventName, callback);
        }, this);
    }
}

