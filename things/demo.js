var device = function () {

    var self = this;
    
    //  Listen on the event emitter
    //  The properties and events are defined in the thing model. The thing is notified about these by using the below event and property event listener.
    //  The event which the listeners are listening on are signalled by the device driver in case of local proxies or 
    //  by the REST HTTP end point in case of remote proxies.
    self.onProperty = function (name, callback) {
    };
    
    self.onEvent = function (name, callback) {
    };
    
    self.setProperty = function (name, property, value) {
    };
    
    self.action = function (name, action) {
    }

    return self;
};

/* 
    The thing definition includes name, model and implementation
    {
        "name": "door12",    
        "model": {
            "@events": {
                "bell": null,
                "key": {
                    "valid": "boolean"
                }
            },
            "@properties": {
                "is_open": "boolean"
            },
            "@actions": {
                "unlock": null
            }
        }
    The name must be unique. The unique id is enforced in the database with unique indexes or in the local list file by looking up if the name already exists
    The protocol inicates how the thing communicate with the WoT server, could be CoAP, mqtt, restapi, etc.
*/

var d = new device();

var td = {
    "name": "door33",
    "model": {
        "@events": {
            "bell": {
                fields: [
                    "timestamp"
                ]
            },
        },
        "@properties": {
            "is_open": {
                "type": "boolean"
            },
            "on": {
                "type": "boolean",
                "writeable": true
            },
            "temperature": {
                "type": "numeric"
            }
        },
        "@actions": {
            "unlock": null,
            "lock": null
        }
    },
    "remote": {
        "uri": "http://localhost:8890"
    }
};

var things = [
    {
        "thing": function (callback) {
            console.log('Thing self init.');
            callback(null, td);
        },
        "implementation": {
            start: function (thing) {
                console.log('Thing is started.')
            },
            stop: function (thing) { },
            //  must be the property set handler implemented here otherwise
            //  the client is unable to set the property
            patch: function (thing, property, value) {
                d.setProperty("door12", property, value);
            },
            unlock: function (thing) {
                d.action("door12", 'unlock');
            },
            lock: function (thing) {
                d.action("door12", 'lock');
            }
        }
    },
];

if (typeof(module) != "undefined" && typeof(exports) != "undefined")
  exports = module.exports = things;