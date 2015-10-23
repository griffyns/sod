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

module.exports = {
    featurecollection: function(arrayOfFeatures) {
        return {
            type: "FeatureCollection",
            features: arrayOfFeatures
        };

    },
    filter: R.curry(function(key, value, fc) {
        var self = this;
        var areEqual = R.compose(hasKeyEqualTo(key,value), R.prop('properties'));
        return R.compose(self.featurecollection, R.filter(areEqual), R.prop('features'))(fc);
    }),
    map: R.curry(function(func, fc) {
        var self = this;
        return R.compose(self.featurecollection, R.map(func), R.prop('features'))(fc);
    })




}
