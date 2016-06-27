'use strict';

var PROMISE = require('bluebird'),
    EXPORTS = get,
    PROCESSORS = {};

function empty() {
    
}

function get(name) {
    var list = PROCESSORS,
        Class = Process;
    if (name && typeof name === 'string') {
        return list.hasOwnProperty(name) ? list[name] : void(0);
    }
    else if (name instanceof Function) {
        return new Class(name);
    }
    else if (name instanceof Class) {
        return name;
    }
    return void(0);
}

function define(name, processor) {
    var Class = Process;
    if (!name || typeof name !== 'string') {
        throw new Error("[name] parameter must be string");
    }
    if (processor instanceof Function) {
        processor = new Class(processor);
    }
    if (processor instanceof Class) {
        PROCESSORS[name] = processor;
    }
    else {
        throw new Error("[name] parameter must be string");
    }
    return EXPORTS;
    
}

function is(process) {
    return process instanceof Process;
}

function extendInstance(instance) {
    var SuperClass = instance.constructor;
    var Prototype;
    
    function Process() {
        SuperClass.apply(this, arguments);
    }
    
    empty.prototype = instance;
    Process.prototype = Prototype = new empty();
    Prototype.constructor = Process;
    empty.prototype = Prototype;
    return new empty();
}


function Process(runner) {
    if (runner instanceof Function) {
        this.$runner = PROMISE.method(runner);
    }
    else {
        throw new Error('constructor requires Function [runner] parameter.');
    }
}

Process.prototype = {
    
    constructor: Process,
    
    pipe: function (processor) {
        
        var next = extendInstance(this),
            current = this.$runner;
            
        if (processor && typeof processor === 'string') {
            processor = get(processor);
        }
        
        if (processor instanceof Function) {
            processor = PROMISE.method(processor);
            
        }
        else if (processor instanceof Process) {
            processor = processor.$runner;
        }
        else {
            throw new Error(
                    "piped [processor] arguments must be Function or Process");
        }
        
        next.$runner = function () {
            var me = this,
                args = Array.prototype.slice.call(arguments, 0);
                
            return current.apply(this, arguments).
                    then(function (data) {
                        args[0] = data;
                        return processor.apply(me, args);
                    });
        };
        
        return next;
    }
};

EXPORTS.define = define;
EXPORTS.is = is;

module.exports = EXPORTS;
