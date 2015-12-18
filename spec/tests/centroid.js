 var sod = require('../../index.js');
 var R = require('ramda');
 describe("Sod Lib", function () {
     it("Generate the centroid of all the features in feature collection", function () {
         var input = {
             type: "FeatureCollection",
             features: [{
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

                     }
                 }

             ]
         };
         expect(
             sod.centroid(input)
         ).toEqual({
             type: "FeatureCollection",
             features: [{
                     "type": "Feature",
                     "geometry": {
                         "type": "Point",
                         "coordinates": [-106.246, 39.394]

                     },
                     "properties": {
                        "type":"centroid"
                     }
                 }

             ]
         });

     });
 });
