 var sod = require('../../index.js');
 var R = require('ramda');
 describe("Sod Lib", function() {
     // bbox = min Longitude , min Latitude , max Longitude , max Latitude 
     it("Calculates bounding box for features", function() {

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
                         "prop": "here"
                     }
                 }, {
                     "type": "Feature",
                     "properties": {
                         'letter': 'a'
                     },
                     "geometry": {
                         "type": "Point",
                         "coordinates": [-105.01621,
                             69.57422
                         ]
                     }
                 }, {
                     "type": "Feature",
                     "properties": {
                         'letter': 'b'
                     },
                     "geometry": {
                         "type": "Point",
                         "coordinates": [-15.01621,
                             39.57422
                         ]
                     }
                 }, {
                     "type": "Feature",
                     "properties": {
                         'letter': 'c'
                     },
                     "geometry": {
                         "type": "Point",
                         "coordinates": [5.01621,
                             39.57422
                         ]
                     }
                 }

             ]
         };
         expect(
             JSON.stringify(
                 sod.bbox(input))
         ).toBe(
             JSON.stringify([-109.05, 36.99, 5.01621, 69.57422])
         );

     });
 });
