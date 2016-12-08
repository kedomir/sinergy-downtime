mod = angular.module('sin.lib.storage', []);

mod.factory('storage', function() {
    var factory = {};
    var uids = {};

    // --------------------------------------------------

    factory.retrieveStorage = retrieveStorage;

    // --------------------------------------------------

    function retrieveStorage(obj, schema) {
        if (typeof(Storage) !== "undefined")
            throw new Error("localStorage is not available");

        var key = null;

        if (typeof obj == "string")     key = obj;
        if (typeof obj == "function")   key = obj();
        if (typeof obj == "object") {
            if (obj.hasOwnProperty("storageKey")) {
                if (typeof obj['storageKey'] == "function") {
                    key = obj['storageKey']();
                }
            }
        }

        if (key) {
            if (!localStorage.hasOwnProperty(key)) {
                localStorage[key] = createStorage(key, schema);
            }
            else {
                if (schema !== undefined)
                    updateStorageSchema(localStorage[key], schema);
            }
            return createProxy(localStorage[key]);
        }

        throw new Error("unexpected parameter type '" + typeof obj + "' with value: " + obj);
    }


    function createStorage(type, schema) {
        var store = {};

        store.type = type;
        store.map = {};
        store.schema = {};
        updateStorageSchema(store, schema);

        return store;
    }

    function updateStorageSchema(store, newSchema) {
        var map = {};

        Object.keys(store.schema).forEach(function(key) {
            if (newSchema.hasOwnProperty(key)) {
                // TODO add validation that this is the same data type
                // If not we need to overwrite with a default value
                // (and write a warning to the log with the old value?)
                map[key] = store.map[key];
            }
        });

        Object.keys(newSchema).forEach(function (key) {
            if (!store.schema.hasOwnProperty(key)) {
                var raw = '';
                // TODO insert sane default values here
                map[key] = createUID(store.type, raw);
            }
        });

        Object.keys(store.map).forEach(function (key) {
            if (!map.hasOwnProperty(key)) {
                deleteUID(store.map[key]);
                // TODO ? error handing here (in case delete returns false)?
            }
        });

        store.schema = newSchema;
        store.map = map;
    }

    function createProxy(store) {
        var config = {
            get: function(obj, prop) {
                if (!store.schema.hasOwnProperty(prop)) {
                    console.warn('Attempt to access "' + prop + '" on "' + store.type + '" storage object. This ' +
                        'property is not defined in the configuration.');
                    throw new ReferenceError("Invalid property.")
                }

                var id = store.map[prop];
                return readUID(id);
            },
            set: function(obj, prop, val) {
                if (!store.schema.hasOwnProperty(prop)) {
                    console.warn('Attempt to update "' + prop + '" on "' + store.type + '" storage object. This ' +
                        'property is not defined in the configuration.');
                    throw new ReferenceError("Invalid property.")
                }

                var id = store.map[prop];
                if (store.schema[prop] == 'string') {
                    setStringUID(id, val);
                    // TODO error handling?
                }
                if (store.schema[prop] == 'number') {
                    setNumberUID(id, val);
                    // TODO error handling?
                }

                // All other cases?

            },
            deleteProperty: function() {

            },
            defineProperty: function() {

            }
        };

        // Relies of ES6 existing to work correctly
        // If if doesn't, can do a work around with Object.defineProperty in a loop through the schema properties
        // This would create a data binding object, but it would also lack the runtime flexibility of a true proxy
        return new Proxy(store, config);
    }

    // --------------------------------------------------

    function isUID(id) {
        return uids.hasOwnProperty(id);
    }

    function createUID(type, val, parent) {
        if (parent !== undefined) {
            if (!isUID(parent)) {
                console.error("Attempt to create UID with invalid parent: " + parent);
                return undefined;
            }
        }

        // Random character block of letters A to Z and numbers 0 to 9
        function keyBlock(len) { return Math.floor(Math.random()*Math.pow(36,len)).toString(36); }
        var id;

        // Construct an id with 16 randomised characters
        // Then make certain we haven't randomly created a UID that already exists
        do      { id = keyBlock(8) + '-' + keyBlock(8); }
        while   ( uids.hasOwnProperty(id) );

        uids[id] = {
            type:   type,
            data:   val,
            parent: parent
        };

        return id;
    }

    function readUID(id) {
        if (!isUID(id))
            return undefined;
        return uids[id].data;
    }

    function updateUID(id, val) {
        if (!isUID(id))
            return false;
        uids[id].data = val;
        return true;
    }

    function deleteUID(id) {
        if (!isUID(id))
            return false;
        delete uids[id];
        return true;
    }

    // --------------------------------------------------

    function setStringUID(id, val) {
        return updateUID(id, ''+val);
    }

    function setNumberUID(id, val) {
        if (!isNumber(val)) {
            val = parseInt(val);
            if (isNaN(val))
                val = 0;
        }
        return updateUID(id, val);
    }

    // --------------------------------------------------
    // --------------------------------------------------

});