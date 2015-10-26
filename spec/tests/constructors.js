var sod = require('../../index.js');
var R = require('ramda');
describe("Sod Lib", function() {
    it("create feature collection", function() {
        var fc = sod.featurecollection([{
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [-105.01621,
                    39.57422
                ]
            }
        }]);
        expect(JSON.stringify(fc)).toBe(JSON.stringify({
            type: "FeatureCollection",
            features: [{
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Point",
                    "coordinates": [-105.01621,
                        39.57422
                    ]
                }
            }]
        }));
    });
});