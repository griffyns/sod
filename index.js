var R = require('ramda');

var log = function(x) {
    console.log(x);
    return x;
}

var hasKeyEqualTo = R.curry(function(key, value, obj) {
    if (key in obj) {
        if (R.type(obj[key]) === 'Array') {
            return R.contains(value, obj[key]);
        } else {
            return obj[key] === value;
        }
    } else {
        return false;
    }
});
var getProperty = R.curry(function(key, obj) {
    return R.compose(R.prop(key), R.prop('properties'))(obj);
});
var getLatLng = R.compose(R.prop('coordinates'), R.prop('geometry'));
var getLat = R.compose(R.nth(1), getLatLng);
var getLng = R.compose(R.nth(0), getLatLng);

var buildPointFeature = function(array) {
    return {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: getLatLng(R.nth(0, array))
        },
        properties: {
            features: R.pluck('properties', array)
        }
    };

};

var XYZ = R.curry(function(zoom, feature) {
    var coords = getLatLng(feature);
    return [(Math.floor((1 - Math.log(Math.tan(coords[1] * Math.PI / 180) + 1 / Math.cos(coords[1] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))), (Math.floor((coords[0] + 180) / 360 * Math.pow(2, zoom))), zoom];
});

var isPoint = R.compose(R.equals('Point'), R.prop('type'), R.prop('geometry'));

var isValidType = function(geojson) {
    return R.contains(R.prop('type', geojson), ["FeatureCollection", "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"]);
};
module.exports = {
    featurecollection: function(arrayOfFeatures) {
        return {
            type: "FeatureCollection",
            features: arrayOfFeatures
        };

    },
    point: R.curry(function(coords, properties) {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: coordinates
            },
            properties: properties
        };
    }),
    merge: R.curry(function(fc) {
        var self = this;
        return R.compose(
            self.featurecollection,
            R.map(buildPointFeature),
            R.converge(R.props, [R.keys, R.identity]),
            R.groupBy(XYZ(25)),
            R.filter(isPoint),
            R.prop('features'))(fc);
    }),
    filter: R.curry(function(key, value, fc) {
        var self = this;
        var areEqual = R.compose(hasKeyEqualTo(key, value), R.prop('properties'));
        return R.compose(self.featurecollection, R.filter(areEqual), R.prop('features'))(fc);
    }),
    map: R.curry(function(func, fc) {
        var self = this;
        return R.compose(self.featurecollection, R.map(func), R.prop('features'))(fc);
    }),
    sortByLatLng: function(fc) {
        var self = this;
        var compare = function(a, b) {
            return getLng(a) == getLng(b) ? getLat(b) - getLat(a) : getLng(b) - getLng(a);
        };
        return R.compose(self.featurecollection, R.sort(compare), R.prop('features'))(fc);
    },
    convex: function(fc) {
        var self = this;
        return R.compose(self.featurecollection, R.prop('features'))(fc);
    },
    isValid: function(geojson) {
        return R.all(R.equals(true), [isValidType(geojson)]);
    },
    split: R.curry(function(key, fc) {
        return R.compose(R.groupBy(getProperty(key)), R.prop('features'))(fc);
    }),
    polygon: R.curry(function(coords, properties) {
        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: coords
            },
            properties: properties
        }
    })



}
