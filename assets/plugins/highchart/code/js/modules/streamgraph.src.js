/**
 * @license  Highcharts JS v6.0.6 (2018-02-05)
 * Streamgraph module
 *
 * (c) 2010-2017 Torstein Honsi
 *
 * License: www.highcharts.com/license
 */
'use strict';
(function(factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory;
    } else {
        factory(Highcharts);
    }
}(function(Highcharts) {
    (function(H) {
        /**
         * Streamgraph module
         *
         * (c) 2010-2017 Torstein Honsi
         *
         * License: www.highcharts.com/license
         */

        var seriesType = H.seriesType;

        /**
         * A streamgraph is a type of stacked area graph which is displaced around a
         * central axis, resulting in a flowing, organic shape.
         * 
         * @extends {plotOptions.areaspline}
         * @product highcharts highstock
         * @sample {highcharts|highstock} highcharts/demo/streamgraph/
         *         Streamgraph
         * @since 6.0.0
         * @optionparent plotOptions.streamgraph
         */
        seriesType('streamgraph', 'areaspline', {
            fillOpacity: 1,
            lineWidth: 0,
            marker: {
                enabled: false
            },
            stacking: 'stream'
            // Prototype functions
        }, {
            negStacks: false,

            /**
             * Modifier function for stream stacks. It simply moves the point up or down
             * in order to center the full stack vertically.
             */
            streamStacker: function(pointExtremes, stack, i) {
                var reversedStacks = H.pick(this.yAxis.options.reversedStacks, true);

                // Y bottom value
                pointExtremes[0] -= stack.total / 2;
                // Y value
                pointExtremes[1] -= stack.total / 2;

                this.stackedYData[i] = this.index === 0 ?
                    pointExtremes[+reversedStacks] :
                    pointExtremes[+!reversedStacks];
            }
        });


        /**
         * A `streamgraph` series. If the [type](#series.streamgraph.type) option is not
         * specified, it is inherited from [chart.type](#chart.type).
         * 
         * For options that apply to multiple series, it is recommended to add
         * them to the [plotOptions.series](#plotOptions.series) options structure.
         * To apply to all series of this specific type, apply it to [plotOptions.
         * streamgraph](#plotOptions.streamgraph).
         * 
         * @type {Object}
         * @extends series,plotOptions.streamgraph
         * @excluding dataParser,dataURL
         * @product highcharts highstock
         * @apioption series.streamgraph
         */

        /**
         * An array of data points for the series. For the `streamgraph` series type,
         * points can be given in the following ways:
         * 
         * 1.  An array of numerical values. In this case, the numerical values
         * will be interpreted as `y` options. The `x` values will be automatically
         * calculated, either starting at 0 and incremented by 1, or from `pointStart`
         * and `pointInterval` given in the series options. If the axis has
         * categories, these will be used. Example:
         * 
         *  ```js
         *  data: [0, 5, 3, 5]
         *  ```
         * 
         * 2.  An array of arrays with 2 values. In this case, the values correspond
         * to `x,y`. If the first value is a string, it is applied as the name
         * of the point, and the `x` value is inferred.
         * 
         *  ```js
         *     data: [
         *         [0, 9],
         *         [1, 7],
         *         [2, 6]
         *     ]
         *  ```
         * 
         * 3.  An array of objects with named values. The objects are point
         * configuration objects as seen below. If the total number of data
         * points exceeds the series' [turboThreshold](#series.area.turboThreshold),
         * this option is not available.
         * 
         *  ```js
         *     data: [{
         *         x: 1,
         *         y: 9,
         *         name: "Point2",
         *         color: "#00FF00"
         *     }, {
         *         x: 1,
         *         y: 6,
         *         name: "Point1",
         *         color: "#FF00FF"
         *     }]
         *  ```
         * 
         * @type {Array<Object|Array|Number>}
         * @extends series.line.data
         * @sample {highcharts} highcharts/chart/reflow-true/
         *         Numerical values
         * @sample {highcharts} highcharts/series/data-array-of-arrays/
         *         Arrays of numeric x and y
         * @sample {highcharts} highcharts/series/data-array-of-arrays-datetime/
         *         Arrays of datetime x and y
         * @sample {highcharts} highcharts/series/data-array-of-name-value/
         *         Arrays of point.name and y
         * @sample {highcharts} highcharts/series/data-array-of-objects/
         *         Config objects    
         * @product highcharts highstock
         * @apioption series.streamgraph.data
         */

    }(Highcharts));
}));
