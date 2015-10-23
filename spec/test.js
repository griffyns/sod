var sod = require('../index.js');
var R = require('ramda');
describe("Sod Lib", function() {
    it("create feature collection", function() {
        var fc = sod.featurecollection([{
            "type": "Point",
            "coordinates": [-105.01621,
                39.57422
            ]
        }]);
        expect(JSON.stringify(fc)).toBe(JSON.stringify({
            type: "FeatureCollection",
            features: [{
                "type": "Point",
                "coordinates": [-105.01621,
                    39.57422
                ]
            }]
        }));
    });

    it("filter feature collection", function() {
        var input = {
            type: "FeatureCollection",
            features: [{
                    "type": "Point",
                    "coordinates": [-105.01621,
                        39.57422
                    ],
                    properties: {
                        'letter': 'a'
                    }

                }, {
                    "type": "Point",
                    "coordinates": [-15.01621,
                        3.57422
                    ],
                    properties: {
                        'letter': 'b'
                    }

                }, {
                    "type": "Point",
                    "coordinates": [105.01621,
                        50.57422
                    ],
                    properties: {
                        'letter': 'c'
                    }

                }

            ]
        };
        expect(
            JSON.stringify(
                sod.filter('letter', 'a', input))
        ).toBe(
            JSON.stringify({
                type: "FeatureCollection",
                features: [{
                    "type": "Point",
                    "coordinates": [-105.01621,
                        39.57422
                    ],
                    properties: {
                        'letter': 'a'
                    }
                }]
            })
        )


    });
    it("filter feature collection", function() {
        var input = {
            type: "FeatureCollection",
            features: [{
                    "type": "Point",
                    "coordinates": [-105.01621,
                        39.57422
                    ],
                    properties: {
                        'letter': ['a', 'b']
                    }

                }, {
                    "type": "Point",
                    "coordinates": [-15.01621,
                        3.57422
                    ],
                    properties: {
                        'letter': 'b'
                    }

                }, {
                    "type": "Point",
                    "coordinates": [105.01621,
                        50.57422
                    ],
                    properties: {
                        'letter': 'c'
                    }

                }

            ]
        };
        expect(
            JSON.stringify(
                sod.filter('letter', 'a', input))
        ).toBe(
            JSON.stringify({
                type: "FeatureCollection",
                features: [{
                    "type": "Point",
                    "coordinates": [-105.01621,
                        39.57422
                    ],
                    properties: {
                        'letter': ['a', 'b']
                    }
                }]
            })
        )


    });
    it("map over features in feature collection", function() {
        var input = {
            type: "FeatureCollection",
            features: [{
                    "type": "Point",
                    "coordinates": [-105.01621,
                        39.57422
                    ],
                    properties: {
                        'letter': ['a', 'b']
                    }

                }, {
                    "type": "Point",
                    "coordinates": [-15.01621,
                        3.57422
                    ],
                    properties: {
                        'letter': 'b'
                    }

                }, {
                    "type": "Point",
                    "coordinates": [105.01621,
                        50.57422
                    ],
                    properties: {
                        'letter': 'c'
                    }

                }

            ]
        };
        expect(
            JSON.stringify(
                sod.map(function(obj) {
                    obj.properties.newProp = 'new';
                    return obj;

                }, input))
        ).toBe(
            JSON.stringify({
                type: "FeatureCollection",
                features: [{
                    "type": "Point",
                    "coordinates": [-105.01621,
                        39.57422
                    ],
                    properties: {

                        'letter': ['a', 'b'],
                        'newProp': 'new'
                    }
                }, {
                    "type": "Point",
                    "coordinates": [-15.01621,
                        3.57422
                    ],
                    properties: {
                        'letter': 'b',
                        'newProp': 'new'
                    }

                }, {
                    "type": "Point",
                    "coordinates": [105.01621,
                        50.57422
                    ],
                    properties: {

                        'letter': 'c',
                        'newProp': 'new'
                    }

                }]
            })
        )


    });
});
