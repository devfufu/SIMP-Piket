/**
 * @license Highcharts JS v6.0.6 (2018-02-05)
 *
 * (c) 2009-2017 Torstein Honsi
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
         * (c) 2009-2017 Torstein Honsi
         *
         * License: www.highcharts.com/license
         */
        /**
         * Highcharts module to place labels next to a series in a natural position.
         *
         * TODO:
         * - add column support (box collision detection, boxesToAvoid logic)
         * - avoid data labels, when data labels above, show series label below.
         * - add more options (connector, format, formatter)
         * 
         * http://jsfiddle.net/highcharts/L2u9rpwr/
         * http://jsfiddle.net/highcharts/y5A37/
         * http://jsfiddle.net/highcharts/264Nm/
         * http://jsfiddle.net/highcharts/y5A37/
         */
        /* eslint max-len: 0 */


        var labelDistance = 3,
            wrap = H.wrap,
            each = H.each,
            extend = H.extend,
            isNumber = H.isNumber,
            pick = H.pick,
            Series = H.Series,
            SVGRenderer = H.SVGRenderer,
            Chart = H.Chart;

        H.setOptions({
            /**
             * @optionparent plotOptions
             */
            plotOptions: {
                series: {
                    /**
                     * Series labels are placed as close to the series as possible in a
                     * natural way, seeking to avoid other series. The goal of this
                     * feature is to make the chart more easily readable, like if a
                     * human designer placed the labels in the optimal position.
                     *
                     * The series labels currently work with series types having a
                     * `graph` or an `area`.
                     *
                     * Requires the `series-label.js` module.
                     *
                     * @sample highcharts/series-label/line-chart
                     *         Line chart
                     * @sample highcharts/demo/streamgraph
                     *         Stream graph
                     * @sample highcharts/series-label/stock-chart
                     *         Stock chart
                     * @since 6.0.0
                     * @product highcharts highstock
                     */
                    label: {
                        /**
                         * Enable the series label per series.
                         */
                        enabled: true,
                        /**
                         * Allow labels to be placed distant to the graph if necessary,
                         * and draw a connector line to the graph.
                         */
                        connectorAllowed: true,
                        /**
                         * If the label is closer than this to a neighbour graph, draw a
                         * connector.
                         */
                        connectorNeighbourDistance: 24,
                        /**
                         * For area-like series, allow the font size to vary so that
                         * small areas get a smaller font size. The default applies this
                         * effect to area-like series but not line-like series.
                         *
                         * @type {Number}
                         */
                        minFontSize: null,
                        /**
                         * For area-like series, allow the font size to vary so that
                         * small areas get a smaller font size. The default applies this
                         * effect to area-like series but not line-like series.
                         *
                         * @type {Number}
                         */
                        maxFontSize: null,
                        /**
                         * Draw the label on the area of an area series. By default it
                         * is drawn on the area. Set it to `false` to draw it next to
                         * the graph instead.
                         * 
                         * @type {Boolean}
                         */
                        onArea: null,

                        /**
                         * Styles for the series label. The color defaults to the series
                         * color, or a contrast color if `onArea`.
                         */
                        style: {
                            fontWeight: 'bold'
                        },

                        /**
                         * An array of boxes to avoid when laying out the labels. Each 
                         * item has a `left`, `right`, `top` and `bottom` property.
                         *
                         * @type {Array.<Object>}
                         */
                        boxesToAvoid: []
                    }
                }
            }
        });

        /**
         * Counter-clockwise, part of the fast line intersection logic
         */
        function ccw(x1, y1, x2, y2, x3, y3) {
            var cw = ((y3 - y1) * (x2 - x1)) - ((y2 - y1) * (x3 - x1));
            return cw > 0 ? true : cw < 0 ? false : true;
        }

        /**
         * Detect if two lines intersect
         */
        function intersectLine(x1, y1, x2, y2, x3, y3, x4, y4) {
            return ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) &&
                ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4);
        }

        /**
         * Detect if a box intersects with a line
         */
        function boxIntersectLine(x, y, w, h, x1, y1, x2, y2) {
            return (
                intersectLine(x, y, x + w, y, x1, y1, x2, y2) || // top of label
                intersectLine(x + w, y, x + w, y + h, x1, y1, x2, y2) || // right
                intersectLine(x, y + h, x + w, y + h, x1, y1, x2, y2) || // bottom
                intersectLine(x, y, x, y + h, x1, y1, x2, y2) // left of label
            );
        }

        /**
         * General symbol definition for labels with connector
         */
        SVGRenderer.prototype.symbols.connector = function(x, y, w, h, options) {
            var anchorX = options && options.anchorX,
                anchorY = options && options.anchorY,
                path,
                yOffset,
                lateral = w / 2;

            if (isNumber(anchorX) && isNumber(anchorY)) {

                path = ['M', anchorX, anchorY];

                // Prefer 45 deg connectors
                yOffset = y - anchorY;
                if (yOffset < 0) {
                    yOffset = -h - yOffset;
                }
                if (yOffset < w) {
                    lateral = anchorX < x + (w / 2) ? yOffset : w - yOffset;
                }

                // Anchor below label
                if (anchorY > y + h) {
                    path.push('L', x + lateral, y + h);

                    // Anchor above label
                } else if (anchorY < y) {
                    path.push('L', x + lateral, y);

                    // Anchor left of label
                } else if (anchorX < x) {
                    path.push('L', x, y + h / 2);

                    // Anchor right of label
                } else if (anchorX > x + w) {
                    path.push('L', x + w, y + h / 2);
                }
            }
            return path || [];
        };

        /**
         * Points to avoid. In addition to actual data points, the label should avoid
         * interpolated positions.
         */
        Series.prototype.getPointsOnGraph = function() {

            if (!this.xAxis && !this.yAxis) {
                return;
            }

            var distance = 16,
                points = this.points,
                point,
                last,
                interpolated = [],
                i,
                deltaX,
                deltaY,
                delta,
                len,
                n,
                j,
                d,
                graph = this.graph || this.area,
                node = graph.element,
                inverted = this.chart.inverted,
                xAxis = this.xAxis,
                yAxis = this.yAxis,
                paneLeft = inverted ? yAxis.pos : xAxis.pos,
                paneTop = inverted ? xAxis.pos : yAxis.pos,
                onArea = pick(this.options.label.onArea, !!this.area),
                translatedThreshold = yAxis.getThreshold(this.options.threshold);

            // For splines, get the point at length (possible caveat: peaks are not
            // correctly detected)
            if (this.getPointSpline && node.getPointAtLength && !onArea) {
                // If it is animating towards a path definition, use that briefly, and
                // reset
                if (graph.toD) {
                    d = graph.attr('d');
                    graph.attr({
                        d: graph.toD
                    });
                }
                len = node.getTotalLength();
                for (i = 0; i < len; i += distance) {
                    point = node.getPointAtLength(i);
                    interpolated.push({
                        chartX: paneLeft + point.x,
                        chartY: paneTop + point.y,
                        plotX: point.x,
                        plotY: point.y
                    });
                }
                if (d) {
                    graph.attr({
                        d: d
                    });
                }
                // Last point
                point = points[points.length - 1];
                point.chartX = paneLeft + point.plotX;
                point.chartY = paneTop + point.plotY;
                interpolated.push(point);

                // Interpolate
            } else {
                len = points.length;
                for (i = 0; i < len; i += 1) {

                    point = points[i];
                    last = points[i - 1];

                    // Absolute coordinates so we can compare different panes
                    point.chartX = paneLeft + point.plotX;
                    point.chartY = paneTop + point.plotY;
                    if (onArea) {
                        // Vertically centered inside area
                        point.chartCenterY = paneTop + (
                            point.plotY +
                            pick(point.yBottom, translatedThreshold)
                        ) / 2;
                    }

                    // Add interpolated points
                    if (i > 0) {
                        deltaX = Math.abs(point.chartX - last.chartX);
                        deltaY = Math.abs(point.chartY - last.chartY);
                        delta = Math.max(deltaX, deltaY);
                        if (delta > distance) {

                            n = Math.ceil(delta / distance);

                            for (j = 1; j < n; j += 1) {
                                interpolated.push({
                                    chartX: last.chartX +
                                        (point.chartX - last.chartX) * (j / n),
                                    chartY: last.chartY +
                                        (point.chartY - last.chartY) * (j / n),
                                    chartCenterY: last.chartCenterY +
                                        (point.chartCenterY - last.chartCenterY) *
                                        (j / n),
                                    plotX: last.plotX +
                                        (point.plotX - last.plotX) * (j / n),
                                    plotY: last.plotY +
                                        (point.plotY - last.plotY) * (j / n)
                                });
                            }
                        }
                    }

                    // Add the real point in order to find positive and negative peaks
                    if (isNumber(point.plotY)) {
                        interpolated.push(point);
                    }
                }
            }

            // Get the bounding box so we can do a quick check first if the bounding
            // boxes overlap.
            /*
            interpolated.bBox = node.getBBox();
            interpolated.bBox.x += paneLeft;
            interpolated.bBox.y += paneTop;
            */

            return interpolated;
        };

        /**
         * Overridable function to return series-specific font sizes for the labels. By
         * default it returns bigger font sizes for series with the greater sum of y
         * values.
         */
        Series.prototype.labelFontSize = function(minFontSize, maxFontSize) {
            return minFontSize + (
                (this.sum / this.chart.labelSeriesMaxSum) *
                (maxFontSize - minFontSize)
            ) + 'px';
        };

        /**
         * Check whether a proposed label position is clear of other elements
         */
        Series.prototype.checkClearPoint = function(x, y, bBox, checkDistance) {
            var distToOthersSquared = Number.MAX_VALUE, // distance to other graphs
                distToPointSquared = Number.MAX_VALUE,
                dist,
                connectorPoint,
                connectorEnabled = this.options.label.connectorAllowed,
                onArea = pick(this.options.label.onArea, !!this.area),
                chart = this.chart,
                series,
                points,
                leastDistance = 16,
                withinRange,
                xDist,
                yDist,
                i,
                j;

            function intersectRect(r1, r2) {
                return !(r2.left > r1.right ||
                    r2.right < r1.left ||
                    r2.top > r1.bottom ||
                    r2.bottom < r1.top);
            }

            /**
             * Get the weight in order to determine the ideal position. Larger distance
             * to other series gives more weight. Smaller distance to the actual point
             * (connector points only) gives more weight.
             */
            function getWeight(distToOthersSquared, distToPointSquared) {
                return distToOthersSquared - distToPointSquared;
            }

            // First check for collision with existing labels
            for (i = 0; i < chart.boxesToAvoid.length; i += 1) {
                if (intersectRect(chart.boxesToAvoid[i], {
                        left: x,
                        right: x + bBox.width,
                        top: y,
                        bottom: y + bBox.height
                    })) {
                    return false;
                }
            }

            // For each position, check if the lines around the label intersect with any
            // of the graphs.
            for (i = 0; i < chart.series.length; i += 1) {
                series = chart.series[i];
                points = series.interpolatedPoints;
                if (series.visible && points) {
                    for (j = 1; j < points.length; j += 1) {

                        if (
                            // To avoid processing, only check intersection if the X
                            // values are close to the box.
                            points[j].chartX >= x - leastDistance &&
                            points[j - 1].chartX <= x + bBox.width + leastDistance
                        ) {
                            // If any of the box sides intersect with the line, return.
                            if (boxIntersectLine(
                                    x,
                                    y,
                                    bBox.width,
                                    bBox.height,
                                    points[j - 1].chartX,
                                    points[j - 1].chartY,
                                    points[j].chartX,
                                    points[j].chartY
                                )) {
                                return false;
                            }

                            // But if it is too far away (a padded box doesn't
                            // intersect), also return.
                            if (this === series && !withinRange && checkDistance) {
                                withinRange = boxIntersectLine(
                                    x - leastDistance,
                                    y - leastDistance,
                                    bBox.width + 2 * leastDistance,
                                    bBox.height + 2 * leastDistance,
                                    points[j - 1].chartX,
                                    points[j - 1].chartY,
                                    points[j].chartX,
                                    points[j].chartY
                                );
                            }
                        }

                        // Find the squared distance from the center of the label. On
                        // area series, avoid its own graph.
                        if (
                            (connectorEnabled || withinRange) &&
                            (this !== series || onArea)
                        ) {
                            xDist = x + bBox.width / 2 - points[j].chartX;
                            yDist = y + bBox.height / 2 - points[j].chartY;
                            distToOthersSquared = Math.min(
                                distToOthersSquared,
                                xDist * xDist + yDist * yDist
                            );
                        }
                    }

                    // Do we need a connector? 
                    if (!onArea &&
                        connectorEnabled &&
                        this === series &&
                        (
                            (checkDistance && !withinRange) ||
                            distToOthersSquared < Math.pow(
                                this.options.label.connectorNeighbourDistance,
                                2
                            )
                        )
                    ) {
                        for (j = 1; j < points.length; j += 1) {
                            dist = Math.min(
                                (
                                    Math.pow(x + bBox.width / 2 - points[j].chartX, 2) +
                                    Math.pow(y + bBox.height / 2 - points[j].chartY, 2)
                                ),
                                (
                                    Math.pow(x - points[j].chartX, 2) +
                                    Math.pow(y - points[j].chartY, 2)
                                ),
                                (
                                    Math.pow(x + bBox.width - points[j].chartX, 2) +
                                    Math.pow(y - points[j].chartY, 2)
                                ),
                                (
                                    Math.pow(x + bBox.width - points[j].chartX, 2) +
                                    Math.pow(y + bBox.height - points[j].chartY, 2)
                                ),
                                (
                                    Math.pow(x - points[j].chartX, 2) +
                                    Math.pow(y + bBox.height - points[j].chartY, 2)
                                )
                            );
                            if (dist < distToPointSquared) {
                                distToPointSquared = dist;
                                connectorPoint = points[j];
                            }
                        }
                        withinRange = true;
                    }
                }
            }

            return !checkDistance || withinRange ? {
                x: x,
                y: y,
                weight: getWeight(
                    distToOthersSquared,
                    connectorPoint ? distToPointSquared : 0
                ),
                connectorPoint: connectorPoint
            } : false;

        };

        /**
         * The main initiator method that runs on chart level after initiation and redraw. It runs in 
         * a timeout to prevent locking, and loops over all series, taking all series and labels into
         * account when placing the labels.
         */
        Chart.prototype.drawSeriesLabels = function() {

            // console.time('drawSeriesLabels');

            var chart = this,
                labelSeries = this.labelSeries;

            chart.boxesToAvoid = [];

            // Build the interpolated points
            each(labelSeries, function(series) {
                series.interpolatedPoints = series.getPointsOnGraph();

                each(series.options.label.boxesToAvoid || [], function(box) {
                    chart.boxesToAvoid.push(box);
                });
            });

            each(chart.series, function(series) {

                if (!series.xAxis && !series.yAxis) {
                    return;
                }

                var bBox,
                    x,
                    y,
                    results = [],
                    clearPoint,
                    i,
                    best,
                    labelOptions = series.options.label,
                    inverted = chart.inverted,
                    paneLeft = inverted ? series.yAxis.pos : series.xAxis.pos,
                    paneTop = inverted ? series.xAxis.pos : series.yAxis.pos,
                    paneWidth = chart.inverted ? series.yAxis.len : series.xAxis.len,
                    paneHeight = chart.inverted ? series.xAxis.len : series.yAxis.len,
                    points = series.interpolatedPoints,
                    onArea = pick(labelOptions.onArea, !!series.area),
                    label = series.labelBySeries,
                    minFontSize = labelOptions.minFontSize,
                    maxFontSize = labelOptions.maxFontSize;

                function insidePane(x, y, bBox) {
                    return x > paneLeft && x <= paneLeft + paneWidth - bBox.width &&
                        y >= paneTop && y <= paneTop + paneHeight - bBox.height;
                }

                if (series.visible && !series.isSeriesBoosting && points) {
                    if (!label) {
                        series.labelBySeries = label = chart.renderer
                            .label(series.name, 0, -9999, 'connector')
                            .css(extend({
                                color: onArea ?
                                    chart.renderer.getContrast(series.color) : series.color
                            }, series.options.label.style));

                        // Adapt label sizes to the sum of the data
                        if (minFontSize && maxFontSize) {
                            label.css({
                                fontSize: series.labelFontSize(minFontSize, maxFontSize)
                            });
                        }

                        label
                            .attr({
                                padding: 0,
                                opacity: chart.renderer.forExport ? 1 : 0,
                                stroke: series.color,
                                'stroke-width': 1,
                                zIndex: 3
                            })
                            .add(series.group)
                            .animate({
                                opacity: 1
                            }, {
                                duration: 200
                            });
                    }

                    bBox = label.getBBox();
                    bBox.width = Math.round(bBox.width);

                    // Ideal positions are centered above or below a point on right side
                    // of chart
                    for (i = points.length - 1; i > 0; i -= 1) {

                        if (onArea) {

                            // Centered
                            x = points[i].chartX - bBox.width / 2;
                            y = points[i].chartCenterY - bBox.height / 2;
                            if (insidePane(x, y, bBox)) {
                                best = series.checkClearPoint(
                                    x,
                                    y,
                                    bBox
                                );
                            }
                            if (best) {
                                results.push(best);
                            }


                        } else {

                            // Right - up
                            x = points[i].chartX + labelDistance;
                            y = points[i].chartY - bBox.height - labelDistance;
                            if (insidePane(x, y, bBox)) {
                                best = series.checkClearPoint(
                                    x,
                                    y,
                                    bBox
                                );
                            }
                            if (best) {
                                results.push(best);
                            }

                            // Right - down
                            x = points[i].chartX + labelDistance;
                            y = points[i].chartY + labelDistance;
                            if (insidePane(x, y, bBox)) {
                                best = series.checkClearPoint(
                                    x,
                                    y,
                                    bBox
                                );
                            }
                            if (best) {
                                results.push(best);
                            }

                            // Left - down
                            x = points[i].chartX - bBox.width - labelDistance;
                            y = points[i].chartY + labelDistance;
                            if (insidePane(x, y, bBox)) {
                                best = series.checkClearPoint(
                                    x,
                                    y,
                                    bBox
                                );
                            }
                            if (best) {
                                results.push(best);
                            }

                            // Left - up
                            x = points[i].chartX - bBox.width - labelDistance;
                            y = points[i].chartY - bBox.height - labelDistance;
                            if (insidePane(x, y, bBox)) {
                                best = series.checkClearPoint(
                                    x,
                                    y,
                                    bBox
                                );
                            }
                            if (best) {
                                results.push(best);
                            }
                        }
                    }

                    // Brute force, try all positions on the chart in a 16x16 grid
                    if (!results.length && !onArea) {
                        for (x = paneLeft + paneWidth - bBox.width; x >= paneLeft; x -= 16) {
                            for (y = paneTop; y < paneTop + paneHeight - bBox.height; y += 16) {
                                clearPoint = series.checkClearPoint(x, y, bBox, true);
                                if (clearPoint) {
                                    results.push(clearPoint);
                                }
                            }
                        }
                    }

                    if (results.length) {

                        results.sort(function(a, b) {
                            return b.weight - a.weight;
                        });

                        best = results[0];

                        chart.boxesToAvoid.push({
                            left: best.x,
                            right: best.x + bBox.width,
                            top: best.y,
                            bottom: best.y + bBox.height
                        });

                        // Move it if needed
                        var dist = Math.sqrt(
                            Math.pow(Math.abs(best.x - label.x), 2),
                            Math.pow(Math.abs(best.y - label.y), 2)
                        );

                        if (dist) {

                            // Move fast and fade in - pure animation movement is 
                            // distractive...
                            var attr = {
                                    opacity: chart.renderer.forExport ? 1 : 0,
                                    x: best.x - paneLeft,
                                    y: best.y - paneTop
                                },
                                anim = {
                                    opacity: 1
                                };
                            // ... unless we're just moving a short distance
                            if (dist <= 10) {
                                anim = {
                                    x: attr.x,
                                    y: attr.y
                                };
                                attr = {};
                            }
                            series.labelBySeries
                                .attr(extend(attr, {
                                    anchorX: best.connectorPoint &&
                                        best.connectorPoint.plotX,
                                    anchorY: best.connectorPoint &&
                                        best.connectorPoint.plotY
                                }))
                                .animate(anim);

                            // Record closest point to stick to for sync redraw
                            series.options.kdNow = true;
                            series.buildKDTree();
                            var closest = series.searchPoint({
                                chartX: best.x,
                                chartY: best.y
                            }, true);
                            label.closest = [
                                closest,
                                best.x - paneLeft - closest.plotX,
                                best.y - paneTop - closest.plotY
                            ];

                        }

                    } else if (label) {
                        series.labelBySeries = label.destroy();
                    }
                }
            });
            // console.timeEnd('drawSeriesLabels');
        };

        /**
         * Prepare drawing series labels
         */
        function drawLabels(proceed) {

            var chart = this,
                delay = Math.max(
                    H.animObject(chart.renderer.globalAnimation).duration,
                    250
                ),
                initial = !chart.hasRendered;

            proceed.apply(chart, [].slice.call(arguments, 1));

            chart.labelSeries = [];
            chart.labelSeriesMaxSum = 0;

            clearTimeout(chart.seriesLabelTimer);

            // Which series should have labels
            each(chart.series, function(series) {
                var options = series.options.label,
                    label = series.labelBySeries,
                    closest = label && label.closest;

                if (
                    options.enabled &&
                    series.visible &&
                    (series.graph || series.area) &&
                    !series.isSeriesBoosting
                ) {
                    chart.labelSeries.push(series);

                    if (options.minFontSize && options.maxFontSize) {
                        series.sum = H.reduce(series.yData, function(pv, cv) {
                            return (pv || 0) + (cv || 0);
                        }, 0);
                        chart.labelSeriesMaxSum = Math.max(
                            chart.labelSeriesMaxSum,
                            series.sum
                        );
                    }

                    // The labels are processing heavy, wait until the animation is done
                    if (initial) {
                        delay = Math.max(
                            delay,
                            H.animObject(series.options.animation).duration
                        );
                    }

                    // Keep the position updated to the axis while redrawing
                    if (closest) {
                        if (closest[0].plotX !== undefined) {
                            label.animate({
                                x: closest[0].plotX + closest[1],
                                y: closest[0].plotY + closest[2]
                            });
                        } else {
                            label.attr({
                                opacity: 0
                            });
                        }
                    }
                }
            });

            chart.seriesLabelTimer = H.syncTimeout(function() {
                chart.drawSeriesLabels();
            }, chart.renderer.forExport ? 0 : delay);

        }
        wrap(Chart.prototype, 'render', drawLabels);
        wrap(Chart.prototype, 'redraw', drawLabels);

    }(Highcharts));
}));
