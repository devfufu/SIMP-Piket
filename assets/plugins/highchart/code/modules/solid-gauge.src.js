/**
 * @license  Highcharts JS v6.0.6 (2018-02-05)
 * Solid angular gauge module
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
         * Solid angular gauge module
         *
         * (c) 2010-2017 Torstein Honsi
         *
         * License: www.highcharts.com/license
         */
        /* eslint max-len: 0 */

        var pInt = H.pInt,
            pick = H.pick,
            each = H.each,
            isNumber = H.isNumber,
            wrap = H.wrap,
            Renderer = H.Renderer,
            colorAxisMethods;

        /**
         * Symbol definition of an arc with round edges.
         * 
         * @param  {Number} x - The X coordinate for the top left position.
         * @param  {Number} y - The Y coordinate for the top left position.
         * @param  {Number} w - The pixel width.
         * @param  {Number} h - The pixel height.
         * @param  {Object} [options] - Additional options, depending on the actual
         *    symbol drawn.
         * @param {boolean} [options.rounded] - Whether to draw rounded edges.
         * @return {Array} Path of the created arc. 
         */
        wrap(Renderer.prototype.symbols, 'arc', function(proceed, x, y, w, h, options) {
            var arc = proceed,
                path = arc(x, y, w, h, options);
            if (options.rounded) {
                var r = options.r || w,
                    smallR = (r - options.innerR) / 2,
                    x1 = path[1],
                    y1 = path[2],
                    x2 = path[12],
                    y2 = path[13],
                    roundStart = ['A', smallR, smallR, 0, 1, 1, x1, y1],
                    roundEnd = ['A', smallR, smallR, 0, 1, 1, x2, y2];
                // Insert rounded edge on end, and remove line.
                path.splice.apply(path, [path.length - 1, 0].concat(roundStart));
                // Insert rounded edge on end, and remove line.
                path.splice.apply(path, [11, 3].concat(roundEnd));
            }

            return path;
        });

        // These methods are defined in the ColorAxis object, and copied here.
        // If we implement an AMD system we should make ColorAxis a dependency.
        colorAxisMethods = {


            initDataClasses: function(userOptions) {
                var chart = this.chart,
                    dataClasses,
                    colorCounter = 0,
                    options = this.options;
                this.dataClasses = dataClasses = [];

                each(userOptions.dataClasses, function(dataClass, i) {
                    var colors;

                    dataClass = H.merge(dataClass);
                    dataClasses.push(dataClass);
                    if (!dataClass.color) {
                        if (options.dataClassColor === 'category') {
                            colors = chart.options.colors;
                            dataClass.color = colors[colorCounter++];
                            // loop back to zero
                            if (colorCounter === colors.length) {
                                colorCounter = 0;
                            }
                        } else {
                            dataClass.color = H.color(options.minColor).tweenTo(
                                H.color(options.maxColor),
                                i / (userOptions.dataClasses.length - 1)
                            );
                        }
                    }
                });
            },

            initStops: function(userOptions) {
                this.stops = userOptions.stops || [
                    [0, this.options.minColor],
                    [1, this.options.maxColor]
                ];
                each(this.stops, function(stop) {
                    stop.color = H.color(stop[1]);
                });
            },
            /** 
             * Translate from a value to a color
             */
            toColor: function(value, point) {
                var pos,
                    stops = this.stops,
                    from,
                    to,
                    color,
                    dataClasses = this.dataClasses,
                    dataClass,
                    i;

                if (dataClasses) {
                    i = dataClasses.length;
                    while (i--) {
                        dataClass = dataClasses[i];
                        from = dataClass.from;
                        to = dataClass.to;
                        if ((from === undefined || value >= from) && (to === undefined || value <= to)) {
                            color = dataClass.color;
                            if (point) {
                                point.dataClass = i;
                            }
                            break;
                        }
                    }

                } else {

                    if (this.isLog) {
                        value = this.val2lin(value);
                    }
                    pos = 1 - ((this.max - value) / (this.max - this.min));
                    i = stops.length;
                    while (i--) {
                        if (pos > stops[i][0]) {
                            break;
                        }
                    }
                    from = stops[i] || stops[i + 1];
                    to = stops[i + 1] || from;

                    // The position within the gradient
                    pos = 1 - (to[0] - pos) / ((to[0] - from[0]) || 1);

                    color = from.color.tweenTo(
                        to.color,
                        pos
                    );
                }
                return color;
            }
        };
        /** 
         * A solid gauge is a circular gauge where the value is indicated by a filled
         * arc, and the color of the arc may variate with the value.
         *
         * @sample highcharts/demo/gauge-solid/ Solid gauges
         * @extends plotOptions.gauge
         * @excluding dial,pivot
         * @product highcharts
         * @optionparent plotOptions.solidgauge
         */
        var solidGaugeOptions = {
            /**
             * Whether the strokes of the solid gauge should be `round` or `square`.
             * 
             * @validvalue ["square", "round"]
             * @type {String}
             * @sample {highcharts} highcharts/demo/gauge-activity/ Rounded gauge
             * @default round
             * @since 4.2.2
             * @product highcharts
             * @apioption plotOptions.solidgauge.linecap
             */

            /**
             * Wether to draw rounded edges on the gauge.
             * 
             * @type {Boolean}
             * @sample {highcharts} highcharts/demo/gauge-activity/ Activity Gauge
             * @default false
             * @since 5.0.8
             * @product highcharts
             * @apioption plotOptions.solidgauge.rounded
             */

            /**
             * The threshold or base level for the gauge.
             * 
             * @type {Number}
             * @sample {highcharts} highcharts/plotoptions/solidgauge-threshold/
             *         Zero threshold with negative and positive values
             * @default null
             * @since 5.0.3
             * @product highcharts
             * @apioption plotOptions.solidgauge.threshold
             */

            /**
             * Whether to give each point an individual color.
             */
            colorByPoint: true

        };


        // The solidgauge series type
        H.seriesType('solidgauge', 'gauge', solidGaugeOptions, {

            /**
             * Extend the translate function to extend the Y axis with the necessary
             * decoration (#5895).
             */
            translate: function() {
                var axis = this.yAxis;
                H.extend(axis, colorAxisMethods);

                // Prepare data classes
                if (!axis.dataClasses && axis.options.dataClasses) {
                    axis.initDataClasses(axis.options);
                }
                axis.initStops(axis.options);

                // Generate points and inherit data label position
                H.seriesTypes.gauge.prototype.translate.call(this);
            },

            /**
             * Draw the points where each point is one needle
             */
            drawPoints: function() {
                var series = this,
                    yAxis = series.yAxis,
                    center = yAxis.center,
                    options = series.options,
                    renderer = series.chart.renderer,
                    overshoot = options.overshoot,
                    overshootVal = isNumber(overshoot) ? overshoot / 180 * Math.PI : 0,
                    thresholdAngleRad;

                // Handle the threshold option
                if (isNumber(options.threshold)) {
                    thresholdAngleRad = yAxis.startAngleRad + yAxis.translate(
                        options.threshold,
                        null,
                        null,
                        null,
                        true
                    );
                }
                this.thresholdAngleRad = pick(thresholdAngleRad, yAxis.startAngleRad);


                each(series.points, function(point) {
                    var graphic = point.graphic,
                        rotation = yAxis.startAngleRad + yAxis.translate(point.y, null, null, null, true),
                        radius = (pInt(pick(point.options.radius, options.radius, 100)) * center[2]) / 200,
                        innerRadius = (pInt(pick(point.options.innerRadius, options.innerRadius, 60)) * center[2]) / 200,
                        shapeArgs,
                        d,
                        toColor = yAxis.toColor(point.y, point),
                        axisMinAngle = Math.min(yAxis.startAngleRad, yAxis.endAngleRad),
                        axisMaxAngle = Math.max(yAxis.startAngleRad, yAxis.endAngleRad),
                        minAngle,
                        maxAngle;

                    if (toColor === 'none') { // #3708
                        toColor = point.color || series.color || 'none';
                    }
                    if (toColor !== 'none') {
                        point.color = toColor;
                    }

                    // Handle overshoot and clipping to axis max/min
                    rotation = Math.max(axisMinAngle - overshootVal, Math.min(axisMaxAngle + overshootVal, rotation));

                    // Handle the wrap option
                    if (options.wrap === false) {
                        rotation = Math.max(axisMinAngle, Math.min(axisMaxAngle, rotation));
                    }

                    minAngle = Math.min(rotation, series.thresholdAngleRad);
                    maxAngle = Math.max(rotation, series.thresholdAngleRad);

                    if (maxAngle - minAngle > 2 * Math.PI) {
                        maxAngle = minAngle + 2 * Math.PI;
                    }

                    point.shapeArgs = shapeArgs = {
                        x: center[0],
                        y: center[1],
                        r: radius,
                        innerR: innerRadius,
                        start: minAngle,
                        end: maxAngle,
                        rounded: options.rounded
                    };
                    point.startR = radius; // For PieSeries.animate

                    if (graphic) {
                        d = shapeArgs.d;
                        graphic.animate(H.extend({
                            fill: toColor
                        }, shapeArgs));
                        if (d) {
                            shapeArgs.d = d; // animate alters it
                        }
                    } else {
                        point.graphic = renderer.arc(shapeArgs)
                            .addClass(point.getClassName(), true)
                            .attr({
                                fill: toColor,
                                'sweep-flag': 0
                            })
                            .add(series.group);


                        if (options.linecap !== 'square') {
                            point.graphic.attr({
                                'stroke-linecap': 'round',
                                'stroke-linejoin': 'round'
                            });
                        }
                        point.graphic.attr({
                            stroke: options.borderColor || 'none',
                            'stroke-width': options.borderWidth || 0
                        });

                    }
                });
            },

            /**
             * Extend the pie slice animation by animating from start angle and up
             */
            animate: function(init) {

                if (!init) {
                    this.startAngleRad = this.thresholdAngleRad;
                    H.seriesTypes.pie.prototype.animate.call(this, init);
                }
            }
        });

        /**
         * A `solidgauge` series. If the [type](#series.solidgauge.type) option
         * is not specified, it is inherited from [chart.type](#chart.type).
         * 
         * 
         * For options that apply to multiple series, it is recommended to add
         * them to the [plotOptions.series](#plotOptions.series) options structure.
         * To apply to all series of this specific type, apply it to [plotOptions.
         * solidgauge](#plotOptions.solidgauge).
         * 
         * @type {Object}
         * @extends series,plotOptions.solidgauge
         * @excluding dataParser,dataURL,stack
         * @product highcharts
         * @apioption series.solidgauge
         */

        /**
         * An array of data points for the series. For the `solidgauge` series
         * type, points can be given in the following ways:
         * 
         * 1.  An array of numerical values. In this case, the numerical values
         * will be interpreted as `y` options. Example:
         * 
         *  ```js
         *  data: [0, 5, 3, 5]
         *  ```
         * 
         * 2.  An array of objects with named values. The objects are point
         * configuration objects as seen below. If the total number of data
         * points exceeds the series' [turboThreshold](#series.solidgauge.turboThreshold),
         * this option is not available.
         * 
         *  ```js
         *     data: [{
         *         y: 5,
         *         name: "Point2",
         *         color: "#00FF00"
         *     }, {
         *         y: 7,
         *         name: "Point1",
         *         color: "#FF00FF"
         *     }]
         *  ```
         * 
         * The typical gauge only contains a single data value.
         * 
         * @type {Array<Object|Number>}
         * @extends series.gauge.data
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
         * @product highcharts
         * @apioption series.solidgauge.data
         */

        /**
         * The inner radius of an individual point in a solid gauge. Can be
         * given as a number (pixels) or percentage string.
         * 
         * @type {Number|String}
         * @sample {highcharts} highcharts/plotoptions/solidgauge-radius/ Individual radius and innerRadius
         * @since 4.1.6
         * @product highcharts
         * @apioption series.solidgauge.data.innerRadius
         */

        /**
         * The outer radius of an individual point in a solid gauge. Can be
         * given as a number (pixels) or percentage string.
         * 
         * @type {Number|String}
         * @sample {highcharts} highcharts/plotoptions/solidgauge-radius/ Individual radius and innerRadius
         * @since 4.1.6
         * @product highcharts
         * @apioption series.solidgauge.data.radius
         */

    }(Highcharts));
}));
