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

var getLatLng = R.compose(R.prop('coordinates'), R.prop('geometry'));
var getLat = R.compose(R.nth(1), getLatLng);
var getLng = R.compose(R.nth(0), getLatLng);

module.exports = {
    featurecollection: function(arrayOfFeatures) {
        return {
            type: "FeatureCollection",
            features: arrayOfFeatures
        };

    },
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
            return getLng(a) == getLng(b) ? getLat(a) - getLat(b) : getLng(a) - getLng(b);
        };
        return R.compose(self.featurecollection, R.sort(compare), R.prop('features'))(fc);
    },
    convex: function(fc) {
        var self = this;
        return R.compose(self.featurecollection, R.prop('features'))(fc);
    }




}
