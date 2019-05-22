(function() {
    // utils

    const { elements: { ELEMENTS = {}, NODES = {} } = {} } = window.modules || {};
    const mediator = {
        listeners: {},
        subscribe(event, listener) {
            if (!this.listeners.hasOwnProperty(event)) {
                this.listeners[event] = [listener];
            } else {
                this.listeners[event].push(listener);
            }
        },
        publish(event, payload) {
            if (this.listeners.hasOwnProperty(event)) {
                this.listeners[event].forEach((listener) => {
                    if (listener instanceof Function) {
                        listener(payload);
                    }
                });
            }
        }
    };

    const state = {
        data: {},
        has(key) {
            return this.data.hasOwnProperty(key);
        },
        initSet(id) {
            this.data[id].set = (key, value) => {
                this.data[id][key] = value;
                mediator.publish(`${id}-${key}`, value);
            };
        },
        init(id) {
            this.data[id] = {};
            this.initSet(id);
        }
    };

    window.modules = {
        ...(window.modules || {}),
        utils: { state, mediator }
    };
}());