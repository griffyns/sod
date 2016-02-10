'use strict';
var R = require('ramda');
var d3 = require('d3');

var log = function (x) {
    console.log(x);
    return x;
};

function alphabetical(a, b) {
    var A = a.toLowerCase(),
        B = b.toLowerCase();
    if (A < B) {
        return -1;
    }
    if (A > B) {
        return 1;
    }
    return 0;
}

/********************************************************
Constants
********************************************************/
var VALIDGEOJSONTYPES = ['FeatureCollection', 'GeometryCollection', 'Feature', 'Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'],
    VALIDGEOJSONGEOMETRIES = ['Point', 'MultiPoint', 'LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'],
    VALIDGEOMETRYKEYS = ['coordinates', 'type'],
    REQUIREDGEOJSONPROPERTIES = {
        FeatureCollection: ['type', 'features'],
        GeometryCollection: ['type', 'geometries'],
        Feature: ['type', 'geometry', 'properties'],
        Point: ['type', 'coordinates'],
        MultiPoint: ['type', 'coordinates'],
        LineString: ['type', 'coordinates'],
        MultiLineString: ['type', 'coordinates'],
        Polygon: ['type', 'coordinates'],
        MultiPolygon: ['type', 'coordinates']
    };

/********************************************************
Get Functions
********************************************************/
var getType = R.prop('type'),
    getFeatures = R.prop('features'),
    getGeomtries = R.prop('geometries'),
    getGeometry = R.prop('geometry'),
    getLatLng = R.compose(R.prop('coordinates'), getGeometry),
    getLat = R.compose(R.nth(1), getLatLng),
    getLng = R.compose(R.nth(0), getLatLng);

var getProperty = R.curry(
    function (key, feature) {
        return R.compose(R.prop(key), R.prop('properties'))(feature);
    }
);

/********************************************************
Validation Functions
********************************************************/
var isArray = function (obj) {
    return Array.isArray(obj);
};

var isObject = function (obj) {
    return (!isArray(obj) && typeof obj === 'object');
};

var isType = R.curry(
    function (type, obj) {
        return (R.ifElse(
            R.has('type'),
            R.compose(
                R.equals(type),
                getType
            ),
            R.F
        )(obj));
    }
);

var validGeoKeys = function (geometry) {
    return (R.compose(
        R.equals(VALIDGEOMETRYKEYS),
        R.intersection(VALIDGEOMETRYKEYS),
        R.sort(alphabetical),
        R.keys
    )(geometry));
};

var validGeoType = function (geometry) {
    return R.contains(getType(geometry), VALIDGEOJSONGEOMETRIES);
};

var validGeometry = function (geometry) {
    return (R.compose(
        //needs coordinate validation, replace the R.T with R.identity
        R.ifElse(validGeoType, R.T, R.F),
        R.ifElse(validGeoKeys, R.identity, R.F)
    )(geometry));
};
/*
var isFeature = R.curry(
    function (obj) {
        return (

        )(obj))
    }
);*/

var isPoint = R.compose(
    isType('Point'),
    getGeometry
);

var isValidType = function (geojson) {
    return R.contains(getType(geojson), VALIDGEOJSONTYPES);
};

var isValid = function (geojson) {
    return R.all(R.equals(true), [isValidType(geojson)]);
};

var buildGeometry = R.curry(
    function (type, coordinates) {
        return {
            'type': type,
            'coordinates': coordinates
        };
    }
);

var buildFeature = R.curry(
    function (properties, geometry) {
        return {
            'type': 'Feature',
            'geometry': geometry,
            'properties': properties
        };
    }
);

var toFeature = R.curry(
    function (type, coordinates, properties) {
        return (R.compose(
            buildFeature(properties),
            buildGeometry(type)
        )(coordinates));
    }
);

var buildCollection = R.curry(
    function (type, array) {
        var collection = {},
            arrayKey;
        if (R.contains(R.toLower(type), ['feature', 'featurecollection'])) {
            arrayKey = 'features';
            type = 'FeatureCollection';
        } else if (R.contains(R.toLower(type), ['geometry', 'geometrycollection'])) {
            arrayKey = 'geometries';
            type = 'GeometryCollection';
        } else {
            arrayKey = type;
        }
        collection.type = type;
        collection[arrayKey] = array;
        return collection;
    }
);

var buildPointFeature = toFeature('Point');
var buildPolygonFeature = toFeature('Polygon');
var buildFeaturecollection = buildCollection('Feature');

var createVoroni = R.curry(
    function (FeatureCollection) {
        var V = d3.geom.voronoi().x(getLat).y(getLng).clipExtent([
            [-180, -90],
            [180, 90]
        ]);
        return (R.compose(V, R.prop('features'))(FeatureCollection));
    }
);

var buildVoroniFeature = R.curry(
    function (voroni) {
        var props = (R.compose(R.prop('properties'), R.prop('point'))(voroni)),
            coords = (R.converge(R.append, [R.nth(0), R.identity])(voroni));
        return buildPolygonFeature(coords, props);
    }
);

var voroni = R.compose(buildFeaturecollection, R.map(buildVoroniFeature), createVoroni);

var propertyEqualTo = R.curry(
    function (key, value, feature) {
        return (R.compose(
            R.ifElse(
                R.has(key),
                R.compose(
                    R.ifElse(
                        R.compose(isArray),
                        R.contains(value),
                        R.equals(value)
                    ),
                    R.prop(key)
                ),
                R.F
            ),
            R.prop('properties')
        )(feature));
    }
);

var combinePoints = function (array) {
    var properties = {
            features: R.pluck('properties', array)
        },
        latLng = getLatLng(R.nth(0, array));
    return buildPointFeature(latLng, properties);
};

var XYZ = R.curry(
    function (zoom, feature) {
        var coords = getLatLng(feature);
        return [
            (Math.floor((1 - Math.log(Math.tan(coords[1] * Math.PI / 180) + 1 / Math.cos(coords[1] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))), (Math.floor((coords[0] + 180) / 360 * Math.pow(2, zoom))),
            zoom
        ];
    }
);

var allCoords = R.compose(R.uniq, R.splitEvery(2), R.flatten, R.prop('coordinates'), R.prop('geometry'));

var coordsToFeatures = R.curry(
    function (coords, properties) {
        return (R.map(R.flip(buildPointFeature)(properties))(coords));

    }
);

var buildBoundingBox = function (featureCollection) {
    var coords = (R.compose(R.splitEvery(2), R.flatten, R.pluck('coordinates'), R.pluck('geometry'), R.prop('features'))(featureCollection)),
        minLng = (R.compose(R.reduce(R.min, Infinity), R.map(R.nth(0)))(coords)),
        minLat = (R.compose(R.reduce(R.min, Infinity), R.map(R.nth(1)))(coords)),
        maxLng = (R.compose(R.reduce(R.max, -Infinity), R.map(R.nth(0)))(coords)),
        maxLat = (R.compose(R.reduce(R.max, -Infinity), R.map(R.nth(1)))(coords));
    return [minLng, minLat, maxLng, maxLat];
};

var merge = R.curry(
    function (featureCollection) {
        return (R.compose(
            buildFeaturecollection,
            R.map(combinePoints),
            R.converge(R.props, [R.keys, R.identity]),
            R.groupBy(getLatLng),
            R.filter(isPoint),
            R.prop('features')
        )(featureCollection));
    }
);

var remove = R.curry(
    function (func, featureCollection) {
        return R.compose(
            buildFeaturecollection,
            R.filter(R.compose(R.not, func)),
            R.prop('features')
        )(featureCollection);
    }
);

var filter = R.curry(
    function (func, fc) {
        return R.compose(buildFeaturecollection, R.filter(func), R.prop('features'))(fc);
    }
);

var map = R.curry(
    function (func, fc) {
        return R.compose(buildFeaturecollection, R.map(func), R.prop('features'))(fc);
    }
);

var sort = R.curry(
    function (func, fc) {
        return R.compose(buildFeaturecollection, R.sort(func), R.prop('features'))(fc);
    }
);

var sortByLatLng = function (fc) {
    return sort(function (a, b) {
        return getLng(a) === getLng(b) ? getLat(b) - getLat(a) : getLng(b) - getLng(a);
    }, fc);
};

var convex = function (fc) {
    return R.compose(buildFeaturecollection, R.prop('features'))(fc);
};

var split = R.curry(
    function (key, fc) {
        return R.compose(R.groupBy(getProperty(key)), R.prop('features'))(fc);
    }
);

var appendBbox = function (featureCollection) {
    var bboxLens = R.lensProp('bbox');
    return R.set(bboxLens, buildBoundingBox(featureCollection), featureCollection);
};

var explode = function (featureCollection) {
    return (R.compose(
        buildFeaturecollection,
        R.nth(0),
        R.map(R.converge(coordsToFeatures, [allCoords, R.prop('properties')])),
        R.prop('features')
    )(featureCollection));
};

var centroid = R.compose(
    buildFeaturecollection,
    R.concat([]),
    R.flip(buildPointFeature)({
        'type': 'centroid'
    }),
    R.converge(function (a, b) {
        a = a.toFixed(3);
        b = b.toFixed(3);
        return [parseFloat(a), parseFloat(b)];
    }, [
        R.compose(R.mean, R.pluck(0)),
        R.compose(R.mean, R.pluck(1))
    ]),
    R.splitEvery(2),
    R.flatten,
    R.pluck('coordinates'),
    R.pluck('geometry'),
    R.prop('features')
);


var closest = R.identity;

var toRadians = R.multiply(R.divide(Math.PI, 180));

var distance = R.curry(
    function (feature1, feature2) {
        var radius = 6373000, //meters
            lat1 = getLat(feature1),
            lng1 = getLng(feature1),
            lat2 = getLat(feature2),
            lng2 = getLng(feature2),
            dLat = toRadians(lat2 - lat1),
            dLon = toRadians(lng2 - lng1),
            a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2),
            c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
            d = radius * c;
        return Math.round(d);
    }
);
var midpoint = R.curry(
    function (feature1, feature2) {
        var avgCoord = function (func) {
            return R.compose(lift, R.mean, R.map(func));
        };
        var lift = function (value) {
            return [value];
        };
        return (R.compose(
            (R.flip(buildPointFeature)({})),
            R.converge(
                R.concat,
                [avgCoord(getLng), avgCoord(getLat)]
            )
        )([feature1, feature2]));
    }
);


module.exports = {
    midpoint: midpoint,
    buildGeometry: buildGeometry,
    buildFeature: buildFeature,
    toFeature: toFeature,
    buildCollection: buildCollection,
    validGeoKeys: validGeoKeys,
    validGeoType: validGeoType,
    validGeometry: validGeometry,
    isObject: isObject,
    getType: getType,
    isType: isType,
    voroni: voroni,
    featurecollection: buildFeaturecollection,
    polygon: buildPolygonFeature,
    point: buildPointFeature,
    explode: explode,
    propertyEqualTo: propertyEqualTo,
    merge: merge,
    remove: remove,
    filter: filter,
    map: map,
    sort: sort,
    sortByLatLng: sortByLatLng,
    convex: convex,
    isValid: isValid,
    split: split,
    appendBbox: appendBbox,
    bbox: buildBoundingBox,
    centroid: centroid,
    closest: closest,
    distance: distance
};
