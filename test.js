'use strict';

var PROCESSOR = require('./index.js');


PROCESSOR.define(
    'buang',
    function (data, process) {
        console.log('buang', data, ' process: ', process);
        return 'data';
    });

PROCESSOR.define(
    'augmented1',
    function (data, process) {
        console.log('data', data, ' process: ', process);
        return 'augmented1';
    });


PROCESSOR.define(
    'augmented2',
    PROCESSOR('augmented1').
            extend({
                name: 'buang'
            }).
            extend(
            function (data, process) {
                console.log('data', data, ' test process: ', process.name);
                return 'augmented2';
            }));


console.log('**start!');
PROCESSOR('buang').
    pipe('augmented1').
    pipe('augmented2').
    pipe(function () {
        console.log('piped1', arguments);
        return 'piped1';
    }).
    pipe(function () {
        console.log('piped2', arguments);
        return 'piped2';
    }).
    valueOf()({name: "diko"}, 1, 2);