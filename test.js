'use strict';

var PROCESSOR = require('./index.js');


PROCESSOR.define(
    'buang',
    function (data) {
        console.log('buang', arguments);
        return data;
    });


PROCESSOR('buang').
    pipe(function (data) {
        console.log('piped1', arguments);
        return 'piped1';
    }).
    pipe(function (data) {
        console.log('piped2', arguments);
        return 'piped2';
    }).
    $runner({name: "diko"}, 1, 2);