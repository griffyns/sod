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

    it("create polygon", function() {
        var poly = sod.polygon([
            [
                [-109.05, 41.00],
                [-102.06, 40.99],
                [-102.03, 36.99],
                [-109.04, 36.99],
                [-109.05, 41.00]
            ]
        ], {
            "prop": "here"
        });

        expect(JSON.stringify(poly)).toBe(JSON.stringify({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-109.05, 41.00],
                        [-102.06, 40.99],
                        [-102.03, 36.99],
                        [-109.04, 36.99],
                        [-109.05, 41.00]
                    ]
                ]
            },
            "properties": {
                "prop": "here"
            }
        }));
    });
});
