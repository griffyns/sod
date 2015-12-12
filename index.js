var R = require('ramda');
var d3 = require('d3');

var log = function(x) {
    console.log(x);
    return x;
};

var getLatLng = R.compose(R.prop('coordinates'), R.prop('geometry'));

var getLat = R.compose(R.nth(1), getLatLng);

var getLng = R.compose(R.nth(0), getLatLng);

var buildFeaturecollection = function(arrayOfFeatures) {
    return {
        type: "FeatureCollection",
        features: arrayOfFeatures
    };

};

var buildPointFeature = R.curry(function(coords, properties) {
    return {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: coords
        },
        properties: properties
    };
});

var buildPolygonFeature = R.curry(function(coords, properties) {
    return {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: coords
        },
        properties: properties
    }
});

var buildVoroniFeature = R.curry(function(voroni) {
    var props = (R.compose(R.prop('properties'), R.prop('point'))(voroni));
    delete voroni.point;
    var coords = (R.converge(R.append, [R.nth(0), R.identity])(voroni));
    return buildPolygonFeature(coords, props);
});

var createVoroni = R.curry(function(fc) {
    var V = d3.geom.voronoi().x(getLat).y(getLng).clipExtent([
        [-180, -90],
        [180, 90]
    ]);
    return (R.compose(V, R.prop('features'))(fc));
});

var propertyEqualTo = R.curry(function(key, value, feature) {
    var properties = (R.prop('properties')(feature));
    if (key in properties) {
        if (R.type(properties[key]) === 'Array') {
            return R.contains(value, properties[key]);
        } else {
            return properties[key] === value;
        }
    } else {
        return false;
    }
});

var getProperty = R.curry(function(key, feature) {
    return R.compose(
        R.prop(key),
        R.prop('properties'))(feature);
});

var combinePoints = function(array) {
    var properties = {
        features: R.pluck('properties', array)
    };
    var latLng = getLatLng(R.nth(0, array));
    return buildPointFeature(latLng, properties);

};

var XYZ = R.curry(function(zoom, feature) {
    var coords = getLatLng(feature);
    return [(Math.floor((1 - Math.log(Math.tan(coords[1] * Math.PI / 180) + 1 / Math.cos(coords[1] * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))), (Math.floor((coords[0] + 180) / 360 * Math.pow(2, zoom))),
        zoom
    ];
});

var isPoint = R.compose(R.equals('Point'), R.prop('type'), R.prop('geometry'));

var isValidType = function(geojson) {
    return R.contains(
        R.prop('type', geojson), ["FeatureCollection", "Point", "MultiPoint", "LineString", "MultiLineString", "Polygon", "MultiPolygon", "GeometryCollection"]);
};

var allCoords = R.compose(R.uniq, R.splitEvery(2), R.flatten, R.prop('coordinates'), R.prop('geometry'));

var explode = R.compose(buildFeaturecollection, R.filter(R.compose(R.not, isPoint)), R.prop('features'));

var coordsToFeatures = function(coords, properties){
    return (R.map(R.flip(buildPointFeature)(properties))(coords));

};


module.exports = {
    voroni: R.compose(buildFeaturecollection, R.map(buildVoroniFeature), createVoroni),
    featurecollection: buildFeaturecollection,
    polygon: buildPolygonFeature,
    point: buildPointFeature,
    explode: function(fc) {
        return (R.compose(buildFeaturecollection, R.nth(0), R.map(R.converge(coordsToFeatures, [allCoords, R.prop('properties')])), R.prop('features'))(fc));
    },
    propertyEqualTo: propertyEqualTo,
    merge: R.curry(function(fc) {
        return (R.compose(
            buildFeaturecollection,
            R.map(combinePoints),
            R.converge(R.props, [R.keys, R.identity]),
            R.groupBy(getLatLng),
            R.filter(isPoint),
            R.prop('features'))(fc));
    }),
    remove: R.curry(function(func, fc) {
        var self = this;
        return R.compose(
            self.featurecollection,
            R.filter(R.compose(R.not, func)),
            R.prop('features'))(fc);
    }),
    filter: R.curry(function(func, fc) {
        var self = this;
        return R.compose(
            self.featurecollection,
            R.filter(func),
            R.prop('features'))(fc);
    }),
    map: R.curry(function(func, fc) {
        var self = this;
        return R.compose(
            self.featurecollection,
            R.map(func),
            R.prop('features'))(fc);
    }),
    sort: R.curry(function(func, fc) {
        var self = this;
        return R.compose(
            self.featurecollection,
            R.sort(func),
            R.prop('features'))(fc);
    }),
    sortByLatLng: function(fc) {
        var self = this;
        return self.sort(function(a, b) {
            return getLng(a) == getLng(b) ? getLat(b) - getLat(a) : getLng(b) - getLng(a);
        }, fc);
    },
    convex: function(fc) {
        var self = this;
        return R.compose(
            self.featurecollection,
            R.prop('features'))(fc);
    },
    isValid: function(geojson) {
        return R.all(
            R.equals(true), [isValidType(geojson)]);
    },
    split: R.curry(function(key, fc) {
        return R.compose(
            R.groupBy(getProperty(key)),
            R.prop('features'))(fc);
    }),
    appendBbox: function(fc) {
        var self = this;
        var bboxLens = R.lensProp('bbox');
        return R.set(bboxLens, self.bbox(fc), fc);
    },
    bbox: function(fc) {
        var coords = (R.compose(
            R.splitEvery(2),
            R.flatten,
            R.pluck('coordinates'),
            R.pluck('geometry'),
            R.prop('features'))(fc));

        var minLng = (R.compose(R.reduce(R.min, Infinity),
            R.map(R.nth(0)))(coords));
        var minLat = (R.compose(
            R.reduce(R.min, Infinity),
            R.map(R.nth(1)))(coords));
        var maxLng = (R.compose(R.reduce(R.max, -Infinity), R.map(R.nth(0)))(coords));
        var maxLat = (R.compose(R.reduce(R.max, -Infinity), R.map(R.nth(1)))(coords));
        return [minLng, minLat, maxLng, maxLat];
    },

}
