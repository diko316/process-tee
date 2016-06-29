'use strict';

var PROMISE = require('bluebird'),
    EXPORTS = get,
    PROCESSORS = {};


function defaultRunner() {
    return PROMISE.reject(
                'Base processor should be extended with new process method');
}

function empty() {
    
}

function get(name) {
    var list = PROCESSORS,
        Class = Process;
    if (name && typeof name === 'string') {
        return Object.prototype.hasOwnProperty.call(list, name) ?
                        list[name] : void(0);
    }
    else if (name instanceof Function) {
        return new (extend(Class, name, true))();
    }
    else if (name instanceof Class) {
        return name;
    }
    return void(0);
}

function define(name, processor) {
    var Class = Process,
        properties = null;
    
    if (!name || typeof name !== 'string') {
        throw new Error("[name] parameter must be string");
    }
    
    if (!(processor instanceof Class) &&
        Object.prototype.toString.call(processor) === '[object Object]') {
        properties = processor;
        processor = properties.process;
        delete properties.process;
    }
    
    if (processor instanceof Function) {
        processor = new (extend(Class, processor, true))();
    }
    if (processor instanceof Class) {
        PROCESSORS[name] = properties ?
                                processor.extend(properties) : processor;
    }
    else {
        throw new Error("[name] parameter must be string");
    }
    return EXPORTS;
    
}

function is(process) {
    return process instanceof Process;
}

function extendInstance(instance, runner, raw) {
    return new (extend(instance.constructor, runner, raw))();
}

function extend(SuperClass, runner, raw) {
    var E = empty;
    var Prototype;
    
    function Process() {
        SuperClass.apply(this, arguments);
    }
    
    E.prototype = SuperClass.prototype;
    Process.prototype = Prototype = new E();
    Prototype.constructor = Process;
    if (runner instanceof Function) {
        if (raw === true) {
            runner = PROMISE.method(runner);
            Prototype.valueOf = function () {
                var me = this;
                return function () {
                    var args = Array.prototype.slice.call(arguments, 0);
                    args.splice(1, 0, me);
                    return runner.apply(this, args);
                };
            };
        }
        else {
            Prototype.valueOf = function () {
                return runner;
            };
        }
        
    }
    return Process;
}

function Process() {
    
}

Process.prototype = {
    
    constructor: Process,
    
    name: 'base',
    
    valueOf: function () {
        return defaultRunner;
    },
    
    extend: function (properties) {
        var O = Object.prototype;
        var name, hasOwn, instance, Prototype;
        if (properties instanceof Function) {
            instance = extendInstance(this, properties, true);
        }
        else {
            instance = extendInstance(this);
            
            if (O.toString.call(properties) === '[object Object]') {
                Prototype = instance.constructor.prototype;
                hasOwn = O.hasOwnProperty;
                for (name in properties) {
                    if (hasOwn.call(properties, name)) {
                        Prototype[name] = properties[name];
                    }
                }
            }
        }
        return instance;
    },
    
    pipe: function (processor) {
        
        var current = this.valueOf();
            
        if (processor && typeof processor === 'string') {
            processor = get(processor);
        }
        
        if (processor instanceof Function) {
            processor = get(processor);
            
        }
        
        if (processor instanceof Process) {
            processor = processor.valueOf();
        }
        else {
            throw new Error(
                    "piped [processor] arguments must be Function or Process");
        }
        
        return extendInstance(this, function () {
                var me = this,
                    args = Array.prototype.slice.call(arguments, 0);
                    
                return current.apply(me, arguments).
                        then(function (data) {
                            args[0] = data;
                            return processor.apply(me, args);
                        });
            }, false);

    }
};

EXPORTS.define = define;
EXPORTS.is = is;

module.exports = EXPORTS;
