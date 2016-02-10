 var sod = require('../../index.js');
 var R = require('ramda');
 var test = require('tape');

 var pt1 = {
     "type": "Feature",
     "properties": {},
     "geometry": {
         "type": "Point",
         "coordinates": [144.834823, -37.771257]
     }
 };
 var pt2 = {
     "type": "Feature",
     "properties": {},
     "geometry": {
         "type": "Point",
         "coordinates": [145.14244, -37.830937]
     }
 };


    var midpt = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                144.9886315, -37.801097
            ]
        },
        "properties":{}
    };

test('Midpoint', function (assert) {
    assert.deepEqual(sod.midpoint(pt1,pt2), midpt, 'deepEqual Midpoint check.');
    assert.end();
});
