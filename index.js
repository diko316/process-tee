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
    else if (name instanceof Class) {
        return name;
    }
    else if (Object.prototype.toString.call(name) === '[object Object]') {
        return (new (extend(Class, null, true))()).extend(name);
    }
    else if (name instanceof Function) {
        return new (extend(Class, name, true))();
    }
    return void(0);
}

function define(name, processor) {
    var Class = Process;
    
    if (!name || typeof name !== 'string') {
        throw new Error("[name] parameter must be string");
    }
    
    if (!(processor instanceof Class) &&
        Object.prototype.toString.call(processor) === '[object Object]') {
        processor = extendDeclare(Class, processor);
    }
    else if (processor instanceof Function) {
        processor = new (extend(Class, processor, true))();
    }
    
    if (processor instanceof Class) {
        PROCESSORS[name] = processor;
    }
    else {
        throw new Error(
            "[processor] parameter must be processor or object or Process");
    }
    return EXPORTS;
    
}

function is(process) {
    return process instanceof Process;
}

function extend(instance, runner, raw) {
    var E = empty;
    var Prototype, SuperClass;
    
    function Process() {
        var instance = this,
            E = empty,
            Class = Process;
            
        if (instance instanceof Class) {
            return SuperClass.apply(this, arguments);
        }
        else {
            E.prototype = Class.prototype;
            instance = new E();
            return Class.apply(instance, arguments);
        }
    }
    
    if (instance instanceof Function) {
        SuperClass = instance;
        E.prototype = SuperClass.prototype;
    }
    else {
        SuperClass = instance.constructor;
        E.prototype = instance;
    }

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

function extendDeclare(SuperClass, processor) {
    var properties = null,
        O = Object.prototype,
        toString = O.toString,
        Base = Process;
    var Class, Prototype, hasOwn, name;
        
    if (!(processor instanceof Base) &&
        toString.call(processor) === '[object Object]') {
        properties = processor;
        processor = processor.process;
    }
    
    Class = extend(SuperClass, processor, true);
    
    if (properties) {
        if (toString.call(properties) === '[object Object]') {
            Prototype = Class.prototype;
            hasOwn = O.hasOwnProperty;
            for (name in properties) {
                if (hasOwn.call(properties, name) && name !== 'process') {
                    Prototype[name] = properties[name];
                }
            }
        }
    }
    return Class;
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
        
        return new (extendDeclare(this, properties))();
        
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
        
        return new (extend(this, function () {
                var me = this,
                    args = Array.prototype.slice.call(arguments, 0);
                    
                return current.apply(me, arguments).
                        then(function (data) {
                            args[0] = data;
                            return processor.apply(me, args);
                        });
            }, false))();

    }
};

EXPORTS.define = define;
EXPORTS.is = is;

module.exports = EXPORTS;
