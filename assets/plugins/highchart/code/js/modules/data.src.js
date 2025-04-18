/**
 * @license Highcharts JS v6.0.6 (2018-02-05)
 * Data module
 *
 * (c) 2012-2017 Torstein Honsi
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
    (function(Highcharts) {
        /**
         * Data module
         *
         * (c) 2012-2017 Torstein Honsi
         *
         * License: www.highcharts.com/license
         */
        /* eslint max-len: 0 */
        /* global XMLHttpRequest */

        // Utilities
        var win = Highcharts.win,
            doc = win.document,
            each = Highcharts.each,
            objectEach = Highcharts.objectEach,
            pick = Highcharts.pick,
            inArray = Highcharts.inArray,
            isNumber = Highcharts.isNumber,
            splat = Highcharts.splat,
            fireEvent = Highcharts.fireEvent,
            some,
            SeriesBuilder;

        // `some` function
        if (!Array.prototype.some) {
            some = function(arr, fn, ctx) { // legacy
                var i = 0,
                    len = arr.length;

                for (; i < len; i++) {
                    if (fn.call(ctx, arr[i], i, arr) === true) {
                        return;
                    }
                }
            };
        } else {
            some = function(arr, fn, ctx) {
                Array.prototype.some.call(arr, fn, ctx);
            };
        }

        /**
         * @typedef {Object} AjaxSettings
         * @property {String} url - The URL to call
         * @property {('get'|'post'|'update'|'delete')} type - The verb to use
         * @property {('json'|'xml'|'text'|'octet')} dataType - The data type expected
         * @property {Function} success - Function to call on success
         * @property {Function} error - Function to call on error
         * @property {Object} data - The payload to send
         * @property {Object} headers - The headers; keyed on header name
         */

        /**
         * Perform an Ajax call.
         *
         * @memberof Highcharts
         * @param {AjaxSettings} - The Ajax settings to use
         *
         */
        Highcharts.ajax = function(attr) {
            var options = Highcharts.merge(true, {
                    url: false,
                    type: 'GET',
                    dataType: 'json',
                    success: false,
                    error: false,
                    data: false,
                    headers: {}
                }, attr),
                headers = {
                    json: 'application/json',
                    xml: 'application/xml',
                    text: 'text/plain',
                    octet: 'application/octet-stream'
                },
                r = new XMLHttpRequest();

            function handleError(xhr, err) {
                if (options.error) {
                    options.error(xhr, err);
                } else {
                    // Maybe emit a highcharts error event here
                }
            }

            if (!options.url) {
                return false;
            }

            r.open(options.type.toUpperCase(), options.url, true);
            r.setRequestHeader(
                'Content-Type',
                headers[options.dataType] || headers.text
            );

            Highcharts.objectEach(options.headers, function(val, key) {
                r.setRequestHeader(key, val);
            });

            r.onreadystatechange = function() {
                var res;

                if (r.readyState === 4) {
                    if (r.status === 200) {
                        res = r.responseText;
                        if (options.dataType === 'json') {
                            try {
                                res = JSON.parse(res);
                            } catch (e) {
                                return handleError(r, e);
                            }
                        }
                        return options.success && options.success(res);
                    }

                    handleError(r, r.responseText);
                }
            };

            try {
                options.data = JSON.stringify(options.data);
            } catch (e) {}

            r.send(options.data || true);
        };

        /**
         * The Data module provides a simplified interface for adding data to
         * a chart from sources like CVS, HTML tables or grid views. See also
         * the [tutorial article on the Data module](http://www.highcharts.com/docs/working-
         * with-data/data-module).
         *
         * It requires the `modules/data.js` file to be loaded.
         *
         * Please note that the default way of adding data in Highcharts, without
         * the need of a module, is through the [series.data](#series.data)
         * option.
         *
         * @sample {highcharts} highcharts/demo/column-parsed/ HTML table
         * @sample {highcharts} highcharts/data/csv/ CSV
         * @since 4.0
         * @product highcharts
         * @apioption data
         */

        /**
         * A two-dimensional array representing the input data on tabular form.
         * This input can be used when the data is already parsed, for example
         * from a grid view component. Each cell can be a string or number.
         * If not switchRowsAndColumns is set, the columns are interpreted as
         * series.
         *
         * @type {Array<Array<Mixed>>}
         * @see [data.rows](#data.rows)
         * @sample {highcharts} highcharts/data/columns/ Columns
         * @since 4.0
         * @product highcharts
         * @apioption data.columns
         */

        /**
         * The callback that is evaluated when the data is finished loading,
         * optionally from an external source, and parsed. The first argument
         * passed is a finished chart options object, containing the series.
         * These options can be extended with additional options and passed
         * directly to the chart constructor.
         *
         * @type {Function}
         * @see [data.parsed](#data.parsed)
         * @sample {highcharts} highcharts/data/complete/ Modify data on complete
         * @since 4.0
         * @product highcharts
         * @apioption data.complete
         */

        /**
         * A comma delimited string to be parsed. Related options are [startRow](#data.
         * startRow), [endRow](#data.endRow), [startColumn](#data.startColumn)
         * and [endColumn](#data.endColumn) to delimit what part of the table
         * is used. The [lineDelimiter](#data.lineDelimiter) and [itemDelimiter](#data.
         * itemDelimiter) options define the CSV delimiter formats.
         *
         * The built-in CSV parser doesn't support all flavours of CSV, so in
         * some cases it may be necessary to use an external CSV parser. See
         * [this example](http://jsfiddle.net/highcharts/u59176h4/) of parsing
         * CSV through the MIT licensed [Papa Parse](http://papaparse.com/)
         * library.
         *
         * @type {String}
         * @sample {highcharts} highcharts/data/csv/ Data from CSV
         * @since 4.0
         * @product highcharts
         * @apioption data.csv
         */

        /**
         * Which of the predefined date formats in Date.prototype.dateFormats
         * to use to parse date values. Defaults to a best guess based on what
         * format gives valid and ordered dates.
         *
         * Valid options include:
         *
         * *   `YYYY/mm/dd`
         * *   `dd/mm/YYYY`
         * *   `mm/dd/YYYY`
         * *   `dd/mm/YY`
         * *   `mm/dd/YY`
         *
         * @validvalue [undefined, "YYYY/mm/dd", "dd/mm/YYYY", "mm/dd/YYYY", "dd/mm/YYYY", "dd/mm/YY", "mm/dd/YY"]
         * @type {String}
         * @see [data.parseDate](#data.parseDate)
         * @sample {highcharts} highcharts/data/dateformat-auto/ Best guess date format
         * @since 4.0
         * @product highcharts
         * @apioption data.dateFormat
         */

        /**
         * The decimal point used for parsing numbers in the CSV.
         *
         * If both this and data.delimiter is set to false, the parser will
         * attempt to deduce the decimal point automatically.
         *
         * @type {String}
         * @sample {highcharts} highcharts/data/delimiters/ Comma as decimal point
         * @default .
         * @since 4.1.0
         * @product highcharts
         * @apioption data.decimalPoint
         */

        /**
         * In tabular input data, the last column (indexed by 0) to use. Defaults
         * to the last column containing data.
         *
         * @type {Number}
         * @sample {highcharts} highcharts/data/start-end/ Limited data
         * @since 4.0
         * @product highcharts
         * @apioption data.endColumn
         */

        /**
         * In tabular input data, the last row (indexed by 0) to use. Defaults
         * to the last row containing data.
         *
         * @type {Number}
         * @sample {highcharts} highcharts/data/start-end/ Limited data
         * @since 4.0.4
         * @product highcharts
         * @apioption data.endRow
         */

        /**
         * Whether to use the first row in the data set as series names.
         *
         * @type {Boolean}
         * @sample {highcharts} highcharts/data/start-end/ Don't get series names from the CSV
         * @sample {highstock} highcharts/data/start-end/ Don't get series names from the CSV
         * @default true
         * @since 4.1.0
         * @product highcharts highstock
         * @apioption data.firstRowAsNames
         */

        /**
         * The key for a Google Spreadsheet to load. See [general information
         * on GS](https://developers.google.com/gdata/samples/spreadsheet_sample).
         *
         * @type {String}
         * @sample {highcharts} highcharts/data/google-spreadsheet/ Load a Google Spreadsheet
         * @since 4.0
         * @product highcharts
         * @apioption data.googleSpreadsheetKey
         */

        /**
         * The Google Spreadsheet worksheet to use in combination with [googleSpreadsheetKey](#data.
         * googleSpreadsheetKey). The available id's from your sheet can be
         * read from `https://spreadsheets.google.com/feeds/worksheets/{key}/public/basic`
         *
         * @type {String}
         * @sample {highcharts} highcharts/data/google-spreadsheet/ Load a Google Spreadsheet
         * @since 4.0
         * @product highcharts
         * @apioption data.googleSpreadsheetWorksheet
         */

        /**
         * Item or cell delimiter for parsing CSV. Defaults to the tab character
         * `\t` if a tab character is found in the CSV string, if not it defaults
         * to `,`.
         *
         * If this is set to false or undefined, the parser will attempt to deduce
         * the delimiter automatically.
         *
         * @type {String}
         * @sample {highcharts} highcharts/data/delimiters/ Delimiters
         * @since 4.0
         * @product highcharts
         * @apioption data.itemDelimiter
         */

        /**
         * Line delimiter for parsing CSV.
         *
         * @type {String}
         * @sample {highcharts} highcharts/data/delimiters/ Delimiters
         * @default \n
         * @since 4.0
         * @product highcharts
         * @apioption data.lineDelimiter
         */

        /**
         * A callback function to parse string representations of dates into
         * JavaScript timestamps. Should return an integer timestamp on success.
         *
         * @type {Function}
         * @see [dateFormat](#data.dateFormat)
         * @since 4.0
         * @product highcharts
         * @apioption data.parseDate
         */

        /**
         * A callback function to access the parsed columns, the two-dimentional
         * input data array directly, before they are interpreted into series
         * data and categories. Return `false` to stop completion, or call
         * `this.complete()` to continue async.
         *
         * @type {Function}
         * @see [data.complete](#data.complete)
         * @sample {highcharts} highcharts/data/parsed/ Modify data after parse
         * @since 4.0
         * @product highcharts
         * @apioption data.parsed
         */

        /**
         * The same as the columns input option, but defining rows intead of
         * columns.
         *
         * @type {Array<Array<Mixed>>}
         * @see [data.columns](#data.columns)
         * @sample {highcharts} highcharts/data/rows/ Data in rows
         * @since 4.0
         * @product highcharts
         * @apioption data.rows
         */

        /**
         * An array containing object with Point property names along with what
         * column id the property should be taken from.
         *
         * @type {Array<Object>}
         * @sample {highcharts} highcharts/data/seriesmapping-label/ Label from data set
         * @since 4.0.4
         * @product highcharts
         * @apioption data.seriesMapping
         */

        /**
         * In tabular input data, the first column (indexed by 0) to use.
         *
         * @type {Number}
         * @sample {highcharts} highcharts/data/start-end/ Limited data
         * @default 0
         * @since 4.0
         * @product highcharts
         * @apioption data.startColumn
         */

        /**
         * In tabular input data, the first row (indexed by 0) to use.
         *
         * @type {Number}
         * @sample {highcharts} highcharts/data/start-end/ Limited data
         * @default 0
         * @since 4.0
         * @product highcharts
         * @apioption data.startRow
         */

        /**
         * Switch rows and columns of the input data, so that `this.columns`
         * effectively becomes the rows of the data set, and the rows are interpreted
         * as series.
         *
         * @type {Boolean}
         * @sample {highcharts} highcharts/data/switchrowsandcolumns/ Switch rows and columns
         * @default false
         * @since 4.0
         * @product highcharts
         * @apioption data.switchRowsAndColumns
         */

        /**
         * A HTML table or the id of such to be parsed as input data. Related
         * options are `startRow`, `endRow`, `startColumn` and `endColumn` to
         * delimit what part of the table is used.
         *
         * @type {String|HTMLElement}
         * @sample {highcharts} highcharts/demo/column-parsed/ Parsed table
         * @since 4.0
         * @product highcharts
         * @apioption data.table
         */


        // The Data constructor
        var Data = function(dataOptions, chartOptions) {
            this.init(dataOptions, chartOptions);
        };

        // Set the prototype properties
        Highcharts.extend(Data.prototype, {

            /**
             * Initialize the Data object with the given options
             */
            init: function(options, chartOptions) {

                var decimalPoint = options.decimalPoint;

                if (decimalPoint !== '.' && decimalPoint !== ',') {
                    decimalPoint = undefined;
                }
                this.options = options;
                this.chartOptions = chartOptions;
                this.columns = options.columns || this.rowsToColumns(options.rows) || [];
                this.firstRowAsNames = pick(options.firstRowAsNames, true);

                this.decimalRegex = (
                    decimalPoint &&
                    new RegExp('^(-?[0-9]+)' + decimalPoint + '([0-9]+)$') // eslint-disable-line security/detect-non-literal-regexp
                );

                // This is a two-dimensional array holding the raw, trimmed string values
                // with the same organisation as the columns array. It makes it possible
                // for example to revert from interpreted timestamps to string-based
                // categories.
                this.rawColumns = [];

                // No need to parse or interpret anything
                if (this.columns.length) {
                    this.dataFound();

                    // Parse and interpret
                } else {

                    // Parse a CSV string if options.csv is given
                    this.parseCSV();

                    // Parse a HTML table if options.table is given
                    this.parseTable();

                    // Parse a Google Spreadsheet
                    this.parseGoogleSpreadsheet();
                }

            },

            /**
             * Get the column distribution. For example, a line series takes a single column for
             * Y values. A range series takes two columns for low and high values respectively,
             * and an OHLC series takes four columns.
             */
            getColumnDistribution: function() {
                var chartOptions = this.chartOptions,
                    options = this.options,
                    xColumns = [],
                    getValueCount = function(type) {
                        return (Highcharts.seriesTypes[type || 'line'].prototype.pointArrayMap || [0]).length;
                    },
                    getPointArrayMap = function(type) {
                        return Highcharts.seriesTypes[type || 'line'].prototype.pointArrayMap;
                    },
                    globalType = chartOptions && chartOptions.chart && chartOptions.chart.type,
                    individualCounts = [],
                    seriesBuilders = [],
                    seriesIndex = 0,
                    i;

                each((chartOptions && chartOptions.series) || [], function(series) {
                    individualCounts.push(getValueCount(series.type || globalType));
                });

                // Collect the x-column indexes from seriesMapping
                each((options && options.seriesMapping) || [], function(mapping) {
                    xColumns.push(mapping.x || 0);
                });

                // If there are no defined series with x-columns, use the first column as x column
                if (xColumns.length === 0) {
                    xColumns.push(0);
                }

                // Loop all seriesMappings and constructs SeriesBuilders from
                // the mapping options.
                each((options && options.seriesMapping) || [], function(mapping) {
                    var builder = new SeriesBuilder(),
                        numberOfValueColumnsNeeded = individualCounts[seriesIndex] || getValueCount(globalType),
                        seriesArr = (chartOptions && chartOptions.series) || [],
                        series = seriesArr[seriesIndex] || {},
                        pointArrayMap = getPointArrayMap(series.type || globalType) || ['y'];

                    // Add an x reader from the x property or from an undefined column
                    // if the property is not set. It will then be auto populated later.
                    builder.addColumnReader(mapping.x, 'x');

                    // Add all column mappings
                    objectEach(mapping, function(val, name) {
                        if (name !== 'x') {
                            builder.addColumnReader(val, name);
                        }
                    });

                    // Add missing columns
                    for (i = 0; i < numberOfValueColumnsNeeded; i++) {
                        if (!builder.hasReader(pointArrayMap[i])) {
                            // builder.addNextColumnReader(pointArrayMap[i]);
                            // Create and add a column reader for the next free column index
                            builder.addColumnReader(undefined, pointArrayMap[i]);
                        }
                    }

                    seriesBuilders.push(builder);
                    seriesIndex++;
                });

                var globalPointArrayMap = getPointArrayMap(globalType);
                if (globalPointArrayMap === undefined) {
                    globalPointArrayMap = ['y'];
                }

                this.valueCount = {
                    global: getValueCount(globalType),
                    xColumns: xColumns,
                    individual: individualCounts,
                    seriesBuilders: seriesBuilders,
                    globalPointArrayMap: globalPointArrayMap
                };
            },

            /**
             * When the data is parsed into columns, either by CSV, table, GS or direct input,
             * continue with other operations.
             */
            dataFound: function() {

                if (this.options.switchRowsAndColumns) {
                    this.columns = this.rowsToColumns(this.columns);
                }

                // Interpret the info about series and columns
                this.getColumnDistribution();

                // Interpret the values into right types
                this.parseTypes();

                // Handle columns if a handleColumns callback is given
                if (this.parsed() !== false) {

                    // Complete if a complete callback is given
                    this.complete();
                }

            },

            /**
             * Parse a CSV input string
             */
            parseCSV: function(inOptions) {
                var self = this,
                    options = inOptions || this.options,
                    csv = options.csv,
                    columns,
                    startRow = typeof options.startRow !== 'undefined' && options.startRow ? options.startRow : 0,
                    endRow = options.endRow || Number.MAX_VALUE,
                    startColumn = typeof options.startColumn !== 'undefined' && options.startColumn ? options.startColumn : 0,
                    endColumn = options.endColumn || Number.MAX_VALUE,
                    itemDelimiter,
                    lines,
                    rowIt = 0,
                    // activeRowNo = 0,
                    dataTypes = [],
                    // We count potential delimiters in the prepass, and use the
                    // result as the basis of half-intelligent guesses.
                    potDelimiters = {
                        ',': 0,
                        ';': 0,
                        '\t': 0
                    };

                columns = this.columns = [];

                /*
                	This implementation is quite verbose. It will be shortened once
                	it's stable and passes all the test.

                	It's also not written with speed in mind, instead everything is
                	very seggregated, and there a several redundant loops.
                	This is to make it easier to stabilize the code initially.

                	We do a pre-pass on the first 4 rows to make some intelligent
                	guesses on the set. Guessed delimiters are in this pass counted.

                	Auto detecting delimiters
                		- If we meet a quoted string, the next symbol afterwards
                		  (that's not \s, \t) is the delimiter
                		- If we meet a date, the next symbol afterwards is the delimiter

                	Date formats
                		- If we meet a column with date formats, check all of them to
                		  see if one of the potential months crossing 12. If it does,
                		  we now know the format

                	It would make things easier to guess the delimiter before
                	doing the actual parsing.

                	General rules:
                		- Quoting is allowed, e.g: "Col 1",123,321
                		- Quoting is optional, e.g.: Col1,123,321
                		- Doubble quoting is escaping, e.g. "Col ""Hello world""",123
                		- Spaces are considered part of the data: Col1 ,123
                		- New line is always the row delimiter
                		- Potential column delimiters are , ; \t
                		- First row may optionally contain headers
                		- The last row may or may not have a row delimiter
                		- Comments are optionally supported, in which case the comment
                		  must start at the first column, and the rest of the line will
                		  be ignored
                */

                // Parse a single row
                function parseRow(columnStr, rowNumber, noAdd, callbacks) {
                    var i = 0,
                        c = '',
                        cl = '',
                        cn = '',
                        token = '',
                        actualColumn = 0,
                        column = 0;

                    function read(j) {
                        c = columnStr[j];
                        cl = columnStr[j - 1];
                        cn = columnStr[j + 1];
                    }

                    function pushType(type) {
                        if (dataTypes.length < column + 1) {
                            dataTypes.push([type]);
                        }
                        if (dataTypes[column][dataTypes[column].length - 1] !== type) {
                            dataTypes[column].push(type);
                        }
                    }

                    function push() {
                        if (startColumn > actualColumn || actualColumn > endColumn) {
                            // Skip this column, but increment the column count (#7272)
                            ++actualColumn;
                            token = '';
                            return;
                        }

                        if (!isNaN(parseFloat(token)) && isFinite(token)) {
                            token = parseFloat(token);
                            pushType('number');
                        } else if (!isNaN(Date.parse(token))) {
                            token = token.replace(/\//g, '-');
                            pushType('date');
                        } else {
                            pushType('string');
                        }


                        if (columns.length < column + 1) {
                            columns.push([]);
                        }

                        if (!noAdd) {
                            // Don't push - if there's a varrying amount of columns
                            // for each row, pushing will skew everything down n slots
                            columns[column][rowNumber] = token;
                        }

                        token = '';
                        ++column;
                        ++actualColumn;
                    }

                    if (!columnStr.trim().length) {
                        return;
                    }

                    if (columnStr.trim()[0] === '#') {
                        return;
                    }

                    for (; i < columnStr.length; i++) {
                        read(i);

                        // Quoted string
                        if (c === '#') {
                            // The rest of the row is a comment
                            push();
                            return;
                        } else if (c === '"') {
                            read(++i);

                            while (i < columnStr.length) {
                                if (c === '"' && cl !== '"' && cn !== '"') {
                                    break;
                                }

                                if (c !== '"' || (c === '"' && cl !== '"')) {
                                    token += c;
                                }

                                read(++i);
                            }

                            // Perform "plugin" handling
                        } else if (callbacks && callbacks[c]) {
                            if (callbacks[c](c, token)) {
                                push();
                            }

                            // Delimiter - push current token
                        } else if (c === itemDelimiter) {
                            push();

                            // Actual column data
                        } else {
                            token += c;
                        }
                    }

                    push();

                }

                // Attempt to guess the delimiter
                // We do a separate parse pass here because we need
                // to count potential delimiters softly without making any assumptions.
                function guessDelimiter(lines) {
                    var points = 0,
                        commas = 0,
                        guessed = false;

                    some(lines, function(columnStr, i) {
                        var inStr = false,
                            c,
                            cn,
                            cl,
                            token = '';


                        // We should be able to detect dateformats within 13 rows
                        if (i > 13) {
                            return true;
                        }

                        for (var j = 0; j < columnStr.length; j++) {
                            c = columnStr[j];
                            cn = columnStr[j + 1];
                            cl = columnStr[j - 1];

                            if (c === '#') {
                                // Skip the rest of the line - it's a comment
                                return;
                            } else if (c === '"') {
                                if (inStr) {
                                    if (cl !== '"' && cn !== '"') {
                                        while (cn === ' ' && j < columnStr.length) {
                                            cn = columnStr[++j];
                                        }

                                        // After parsing a string, the next non-blank
                                        // should be a delimiter if the CSV is properly
                                        // formed.

                                        if (typeof potDelimiters[cn] !== 'undefined') {
                                            potDelimiters[cn]++;
                                        }

                                        inStr = false;
                                    }
                                } else {
                                    inStr = true;
                                }
                            } else if (typeof potDelimiters[c] !== 'undefined') {

                                token = token.trim();

                                if (!isNaN(Date.parse(token))) {
                                    potDelimiters[c]++;
                                } else if (isNaN(token) || !isFinite(token)) {
                                    potDelimiters[c]++;
                                }

                                token = '';

                            } else {
                                token += c;
                            }

                            if (c === ',') {
                                commas++;
                            }

                            if (c === '.') {
                                points++;
                            }
                        }
                    });

                    // Count the potential delimiters.
                    // This could be improved by checking if the number of delimiters
                    // equals the number of columns - 1

                    if (potDelimiters[';'] > potDelimiters[',']) {
                        guessed = ';';
                    } else if (potDelimiters[','] > potDelimiters[';']) {
                        guessed = ',';
                    } else {
                        // No good guess could be made..
                        guessed = ',';
                    }

                    // Try to deduce the decimal point if it's not explicitly set.
                    // If both commas or points is > 0 there is likely an issue
                    if (!options.decimalPoint) {
                        if (points > commas) {
                            options.decimalPoint = '.';
                        } else {
                            options.decimalPoint = ',';
                        }

                        // Apply a new decimal regex based on the presumed decimal sep.
                        self.decimalRegex = new RegExp( // eslint-disable-line security/detect-non-literal-regexp
                            '^(-?[0-9]+)' +
                            options.decimalPoint +
                            '([0-9]+)$'
                        );
                    }

                    return guessed;
                }

                /* Tries to guess the date format
                 *	- Check if either month candidate exceeds 12
                 *  - Check if year is missing (use current year)
                 *  - Check if a shortened year format is used (e.g. 1/1/99)
                 *  - If no guess can be made, the user must be prompted
                 * data is the data to deduce a format based on
                 */
                function deduceDateFormat(data, limit) {
                    var format = 'YYYY/mm/dd',
                        thing,
                        guessedFormat,
                        calculatedFormat,
                        i = 0,
                        madeDeduction = false,
                        // candidates = {},
                        stable = [],
                        max = [],
                        j;

                    if (!limit || limit > data.length) {
                        limit = data.length;
                    }

                    for (; i < limit; i++) {
                        if (typeof data[i] !== 'undefined' && data[i] && data[i].length) {
                            thing = data[i]
                                .trim()
                                .replace(/\//g, ' ')
                                .replace(/\-/g, ' ')
                                .split(' ');

                            guessedFormat = [
                                '',
                                '',
                                ''
                            ];


                            for (j = 0; j < thing.length; j++) {
                                if (j < guessedFormat.length) {
                                    thing[j] = parseInt(thing[j], 10);

                                    if (thing[j]) {

                                        max[j] = (!max[j] || max[j] < thing[j]) ? thing[j] : max[j];

                                        if (typeof stable[j] !== 'undefined') {
                                            if (stable[j] !== thing[j]) {
                                                stable[j] = false;
                                            }
                                        } else {
                                            stable[j] = thing[j];
                                        }

                                        if (thing[j] > 31) {
                                            if (thing[j] < 100) {
                                                guessedFormat[j] = 'YY';
                                            } else {
                                                guessedFormat[j] = 'YYYY';
                                            }
                                            // madeDeduction = true;
                                        } else if (thing[j] > 12 && thing[j] <= 31) {
                                            guessedFormat[j] = 'dd';
                                            madeDeduction = true;
                                        } else if (!guessedFormat[j].length) {
                                            guessedFormat[j] = 'mm';
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (madeDeduction) {

                        // This handles a few edge cases with hard to guess dates
                        for (j = 0; j < stable.length; j++) {
                            if (stable[j] !== false) {
                                if (max[j] > 12 && guessedFormat[j] !== 'YY' && guessedFormat[j] !== 'YYYY') {
                                    guessedFormat[j] = 'YY';
                                }
                            } else if (max[j] > 12 && guessedFormat[j] === 'mm') {
                                guessedFormat[j] = 'dd';
                            }
                        }

                        // If the middle one is dd, and the last one is dd,
                        // the last should likely be year.
                        if (guessedFormat.length === 3 &&
                            guessedFormat[1] === 'dd' &&
                            guessedFormat[2] === 'dd') {
                            guessedFormat[2] = 'YY';
                        }

                        calculatedFormat = guessedFormat.join('/');

                        // If the caculated format is not valid, we need to present an error.

                        if (!(options.dateFormats || self.dateFormats)[calculatedFormat]) {
                            // This should emit an event instead
                            fireEvent('invalidDateFormat');
                            Highcharts.error('Could not deduce date format');
                            return format;
                        }

                        return calculatedFormat;
                    }

                    return format;
                }

                /* Figure out the best axis types for the data
                 * - If the first column is a number, we're good
                 * - If the first column is a date, set to date/time
                 * - If the first column is a string, set to categories
                 */
                function deduceAxisTypes() {

                }

                if (csv) {

                    lines = csv
                        .replace(/\r\n/g, '\n') // Unix
                        .replace(/\r/g, '\n') // Mac
                        .split(options.lineDelimiter || '\n');

                    if (!startRow || startRow < 0) {
                        startRow = 0;
                    }

                    if (!endRow || endRow >= lines.length) {
                        endRow = lines.length - 1;
                    }

                    if (options.itemDelimiter) {
                        itemDelimiter = options.itemDelimiter;
                    } else {
                        itemDelimiter = null;
                        itemDelimiter = guessDelimiter(lines);
                    }

                    var offset = 0;

                    for (rowIt = startRow; rowIt <= endRow; rowIt++) {
                        if (lines[rowIt][0] === '#') {
                            offset++;
                        } else {
                            parseRow(lines[rowIt], rowIt - startRow - offset);
                        }
                    }

                    // //Make sure that there's header columns for everything
                    // each(columns, function (col) {

                    // });

                    deduceAxisTypes();

                    if ((!options.columnTypes || options.columnTypes.length === 0) &&
                        dataTypes.length &&
                        dataTypes[0].length &&
                        dataTypes[0][1] === 'date' &&
                        !options.dateFormat) {
                        options.dateFormat = deduceDateFormat(columns[0]);
                    }


                    // each(lines, function (line, rowNo) {
                    //	var trimmed = self.trim(line),
                    //		isComment = trimmed.indexOf('#') === 0,
                    //		isBlank = trimmed === '',
                    //		items;

                    //	if (rowNo >= startRow && rowNo <= endRow && !isComment && !isBlank) {
                    //		items = line.split(itemDelimiter);
                    //		each(items, function (item, colNo) {
                    //			if (colNo >= startColumn && colNo <= endColumn) {
                    //				if (!columns[colNo - startColumn]) {
                    //					columns[colNo - startColumn] = [];
                    //				}

                    //				columns[colNo - startColumn][activeRowNo] = item;
                    //			}
                    //		});
                    //		activeRowNo += 1;
                    //	}
                    // });
                    //

                    this.dataFound();
                }

                return columns;
            },

            /**
             * Parse a HTML table
             */
            parseTable: function() {
                var options = this.options,
                    table = options.table,
                    columns = this.columns,
                    startRow = options.startRow || 0,
                    endRow = options.endRow || Number.MAX_VALUE,
                    startColumn = options.startColumn || 0,
                    endColumn = options.endColumn || Number.MAX_VALUE;

                if (table) {

                    if (typeof table === 'string') {
                        table = doc.getElementById(table);
                    }

                    each(table.getElementsByTagName('tr'), function(tr, rowNo) {
                        if (rowNo >= startRow && rowNo <= endRow) {
                            each(tr.children, function(item, colNo) {
                                if ((item.tagName === 'TD' || item.tagName === 'TH') && colNo >= startColumn && colNo <= endColumn) {
                                    if (!columns[colNo - startColumn]) {
                                        columns[colNo - startColumn] = [];
                                    }

                                    columns[colNo - startColumn][rowNo - startRow] = item.innerHTML;
                                }
                            });
                        }
                    });

                    this.dataFound(); // continue
                }
            },

            /**
             * Parse a Google spreadsheet.
             */
            parseGoogleSpreadsheet: function() {
                var self = this,
                    options = this.options,
                    googleSpreadsheetKey = options.googleSpreadsheetKey,
                    // use sheet 1 as the default rather than od6
                    // as the latter sometimes cause issues (it looks like it can
                    // be renamed in some cases, ref. a fogbugz case).
                    worksheet = options.googleSpreadsheetWorksheet || 1,
                    columns = this.columns,
                    startRow = options.startRow || 0,
                    endRow = options.endRow || Number.MAX_VALUE,
                    startColumn = options.startColumn || 0,
                    endColumn = options.endColumn || Number.MAX_VALUE,
                    gr, // google row
                    gc; // google column

                /*
                 * Fetch the actual spreadsheet using XMLHttpRequest
                 */
                function fetchSheet(fn) {
                    var url = [
                        'https://spreadsheets.google.com/feeds/cells',
                        googleSpreadsheetKey,
                        worksheet,
                        'public/values?alt=json'
                    ].join('/');

                    Highcharts.ajax({
                        url: url,
                        dataType: 'json',
                        success: fn,
                        error: function(xhr, text) {
                            return options.error && options.error(text, xhr);
                        }
                    });
                }

                if (googleSpreadsheetKey) {
                    fetchSheet(function(json) {
                        // Prepare the data from the spreadsheat
                        var cells = json.feed.entry,
                            cell,
                            cellCount = cells.length,
                            colCount = 0,
                            rowCount = 0,
                            val,
                            cellInner,
                            i;

                        // First, find the total number of columns and rows that
                        // are actually filled with data
                        for (i = 0; i < cellCount; i++) {
                            cell = cells[i];
                            colCount = Math.max(colCount, cell.gs$cell.col);
                            rowCount = Math.max(rowCount, cell.gs$cell.row);
                        }

                        // Set up arrays containing the column data
                        for (i = 0; i < colCount; i++) {
                            if (i >= startColumn && i <= endColumn) {
                                // Create new columns with the length of either end-start or rowCount
                                columns[i - startColumn] = [];

                                // Setting the length to avoid jslint warning
                                columns[i - startColumn].length = Math.min(rowCount, endRow - startRow);
                            }
                        }

                        // Loop over the cells and assign the value to the right
                        // place in the column arrays
                        for (i = 0; i < cellCount; i++) {
                            cell = cells[i];
                            gr = cell.gs$cell.row - 1; // rows start at 1
                            gc = cell.gs$cell.col - 1; // columns start at 1

                            // If both row and col falls inside start and end
                            // set the transposed cell value in the newly created columns
                            if (gc >= startColumn && gc <= endColumn &&
                                gr >= startRow && gr <= endRow) {

                                cellInner = cell.gs$cell || cell.content;

                                val = null;

                                if (cellInner.numericValue) {
                                    if (cellInner.$t.indexOf('/') >= 0 ||
                                        cellInner.$t.indexOf('-') >= 0) {
                                        // This is a date - for future reference.
                                        val = cellInner.$t;
                                    } else if (cellInner.$t.indexOf('%') > 0) {
                                        // Percentage
                                        val = parseFloat(cellInner.numericValue) * 100;
                                    } else {
                                        val = parseFloat(cellInner.numericValue);
                                    }
                                } else if (cellInner.$t && cellInner.$t.length) {
                                    val = cellInner.$t;
                                }

                                columns[gc - startColumn][gr - startRow] = val;
                            }
                        }

                        // Insert null for empty spreadsheet cells (#5298)
                        each(columns, function(column) {
                            for (i = 0; i < column.length; i++) {
                                if (column[i] === undefined) {
                                    column[i] = null;
                                }
                            }
                        });

                        self.dataFound();
                    });
                }
            },

            /**
             * Trim a string from whitespace
             */
            trim: function(str, inside) {
                if (typeof str === 'string') {
                    str = str.replace(/^\s+|\s+$/g, '');

                    // Clear white space insdie the string, like thousands separators
                    if (inside && /^[0-9\s]+$/.test(str)) {
                        str = str.replace(/\s/g, '');
                    }

                    if (this.decimalRegex) {
                        str = str.replace(this.decimalRegex, '$1.$2');
                    }
                }
                return str;
            },

            /**
             * Parse numeric cells in to number types and date types in to true dates.
             */
            parseTypes: function() {
                var columns = this.columns,
                    col = columns.length;

                while (col--) {
                    this.parseColumn(columns[col], col);
                }

            },

            /**
             * Parse a single column. Set properties like .isDatetime and .isNumeric.
             */
            parseColumn: function(column, col) {
                var rawColumns = this.rawColumns,
                    columns = this.columns,
                    row = column.length,
                    val,
                    floatVal,
                    trimVal,
                    trimInsideVal,
                    firstRowAsNames = this.firstRowAsNames,
                    isXColumn = inArray(col, this.valueCount.xColumns) !== -1,
                    dateVal,
                    backup = [],
                    diff,
                    chartOptions = this.chartOptions,
                    descending,
                    columnTypes = this.options.columnTypes || [],
                    columnType = columnTypes[col],
                    forceCategory = isXColumn && ((chartOptions && chartOptions.xAxis && splat(chartOptions.xAxis)[0].type === 'category') || columnType === 'string');

                if (!rawColumns[col]) {
                    rawColumns[col] = [];
                }
                while (row--) {
                    val = backup[row] || column[row];

                    trimVal = this.trim(val);
                    trimInsideVal = this.trim(val, true);
                    floatVal = parseFloat(trimInsideVal);

                    // Set it the first time
                    if (rawColumns[col][row] === undefined) {
                        rawColumns[col][row] = trimVal;
                    }

                    // Disable number or date parsing by setting the X axis type to category
                    if (forceCategory || (row === 0 && firstRowAsNames)) {
                        column[row] = '' + trimVal;

                    } else if (+trimInsideVal === floatVal) { // is numeric

                        column[row] = floatVal;

                        // If the number is greater than milliseconds in a year, assume datetime
                        if (floatVal > 365 * 24 * 3600 * 1000 && columnType !== 'float') {
                            column.isDatetime = true;
                        } else {
                            column.isNumeric = true;
                        }

                        if (column[row + 1] !== undefined) {
                            descending = floatVal > column[row + 1];
                        }

                        // String, continue to determine if it is a date string or really a string
                    } else {
                        if (trimVal && trimVal.length) {
                            dateVal = this.parseDate(val);
                        }

                        // Only allow parsing of dates if this column is an x-column
                        if (isXColumn && isNumber(dateVal) && columnType !== 'float') { // is date
                            backup[row] = val;
                            column[row] = dateVal;
                            column.isDatetime = true;

                            // Check if the dates are uniformly descending or ascending. If they
                            // are not, chances are that they are a different time format, so check
                            // for alternative.
                            if (column[row + 1] !== undefined) {
                                diff = dateVal > column[row + 1];
                                if (diff !== descending && descending !== undefined) {
                                    if (this.alternativeFormat) {
                                        this.dateFormat = this.alternativeFormat;
                                        row = column.length;
                                        this.alternativeFormat = this.dateFormats[this.dateFormat].alternative;
                                    } else {
                                        column.unsorted = true;
                                    }
                                }
                                descending = diff;
                            }

                        } else { // string
                            column[row] = trimVal === '' ? null : trimVal;
                            if (row !== 0 && (column.isDatetime || column.isNumeric)) {
                                column.mixed = true;
                            }
                        }
                    }
                }

                // If strings are intermixed with numbers or dates in a parsed column, it is an indication
                // that parsing went wrong or the data was not intended to display as numbers or dates and
                // parsing is too aggressive. Fall back to categories. Demonstrated in the
                // highcharts/demo/column-drilldown sample.
                if (isXColumn && column.mixed) {
                    columns[col] = rawColumns[col];
                }

                // If the 0 column is date or number and descending, reverse all columns.
                if (isXColumn && descending && this.options.sort) {
                    for (col = 0; col < columns.length; col++) {
                        columns[col].reverse();
                        if (firstRowAsNames) {
                            columns[col].unshift(columns[col].pop());
                        }
                    }
                }
            },

            /**
             * A collection of available date formats, extendable from the outside to support
             * custom date formats.
             */
            dateFormats: {
                'YYYY/mm/dd': {
                    regex: /^([0-9]{4})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{1,2})$/,
                    parser: function(match) {
                        return Date.UTC(+match[1], match[2] - 1, +match[3]);
                    }
                },
                'dd/mm/YYYY': {
                    regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,
                    parser: function(match) {
                        return Date.UTC(+match[3], match[2] - 1, +match[1]);
                    },
                    alternative: 'mm/dd/YYYY' // different format with the same regex
                },
                'mm/dd/YYYY': {
                    regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{4})$/,
                    parser: function(match) {
                        return Date.UTC(+match[3], match[1] - 1, +match[2]);
                    }
                },
                'dd/mm/YY': {
                    regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,
                    parser: function(match) {
                        var year = +match[3],
                            d = new Date();

                        if (year > (d.getFullYear() - 2000)) {
                            year += 1900;
                        } else {
                            year += 2000;
                        }

                        return Date.UTC(year, match[2] - 1, +match[1]);
                    },
                    alternative: 'mm/dd/YY' // different format with the same regex
                },
                'mm/dd/YY': {
                    regex: /^([0-9]{1,2})[\-\/\.]([0-9]{1,2})[\-\/\.]([0-9]{2})$/,
                    parser: function(match) {
                        return Date.UTC(+match[3] + 2000, match[1] - 1, +match[2]);
                    }
                }
            },

            /**
             * Parse a date and return it as a number. Overridable through options.parseDate.
             */
            parseDate: function(val) {
                var parseDate = this.options.parseDate,
                    ret,
                    key,
                    format,
                    dateFormat = this.options.dateFormat || this.dateFormat,
                    match;

                if (parseDate) {
                    ret = parseDate(val);

                } else if (typeof val === 'string') {
                    // Auto-detect the date format the first time
                    if (!dateFormat) {
                        for (key in this.dateFormats) {
                            format = this.dateFormats[key];
                            match = val.match(format.regex);
                            if (match) {
                                this.dateFormat = dateFormat = key;
                                this.alternativeFormat = format.alternative;
                                ret = format.parser(match);
                                break;
                            }
                        }
                        // Next time, use the one previously found
                    } else {
                        format = this.dateFormats[dateFormat];


                        if (!format) {
                            // The selected format is invalid
                            format = this.dateFormats['YYYY/mm/dd'];
                        }

                        match = val.match(format.regex);
                        if (match) {
                            ret = format.parser(match);
                        }

                    }
                    // Fall back to Date.parse
                    if (!match) {
                        match = Date.parse(val);
                        // External tools like Date.js and MooTools extend Date object and
                        // returns a date.
                        if (typeof match === 'object' && match !== null && match.getTime) {
                            ret = match.getTime() - match.getTimezoneOffset() * 60000;

                            // Timestamp
                        } else if (isNumber(match)) {
                            ret = match - (new Date(match)).getTimezoneOffset() * 60000;
                        }
                    }
                }
                return ret;
            },

            /**
             * Reorganize rows into columns
             */
            rowsToColumns: function(rows) {
                var row,
                    rowsLength,
                    col,
                    colsLength,
                    columns;

                if (rows) {
                    columns = [];
                    rowsLength = rows.length;
                    for (row = 0; row < rowsLength; row++) {
                        colsLength = rows[row].length;
                        for (col = 0; col < colsLength; col++) {
                            if (!columns[col]) {
                                columns[col] = [];
                            }
                            columns[col][row] = rows[row][col];
                        }
                    }
                }
                return columns;
            },

            /**
             * A hook for working directly on the parsed columns
             */
            parsed: function() {
                if (this.options.parsed) {
                    return this.options.parsed.call(this, this.columns);
                }
            },

            getFreeIndexes: function(numberOfColumns, seriesBuilders) {
                var s,
                    i,
                    freeIndexes = [],
                    freeIndexValues = [],
                    referencedIndexes;

                // Add all columns as free
                for (i = 0; i < numberOfColumns; i = i + 1) {
                    freeIndexes.push(true);
                }

                // Loop all defined builders and remove their referenced columns
                for (s = 0; s < seriesBuilders.length; s = s + 1) {
                    referencedIndexes = seriesBuilders[s].getReferencedColumnIndexes();

                    for (i = 0; i < referencedIndexes.length; i = i + 1) {
                        freeIndexes[referencedIndexes[i]] = false;
                    }
                }

                // Collect the values for the free indexes
                for (i = 0; i < freeIndexes.length; i = i + 1) {
                    if (freeIndexes[i]) {
                        freeIndexValues.push(i);
                    }
                }

                return freeIndexValues;
            },

            /**
             * If a complete callback function is provided in the options, interpret the
             * columns into a Highcharts options object.
             */
            complete: function() {

                var columns = this.columns,
                    xColumns = [],
                    type,
                    options = this.options,
                    series,
                    data,
                    i,
                    j,
                    r,
                    seriesIndex,
                    chartOptions,
                    allSeriesBuilders = [],
                    builder,
                    freeIndexes,
                    typeCol,
                    index;

                xColumns.length = columns.length;
                if (options.complete || options.afterComplete) {

                    // Get the names and shift the top row
                    for (i = 0; i < columns.length; i++) {
                        if (this.firstRowAsNames) {
                            columns[i].name = columns[i].shift();
                        }
                    }

                    // Use the next columns for series
                    series = [];
                    freeIndexes = this.getFreeIndexes(columns.length, this.valueCount.seriesBuilders);

                    // Populate defined series
                    for (seriesIndex = 0; seriesIndex < this.valueCount.seriesBuilders.length; seriesIndex++) {
                        builder = this.valueCount.seriesBuilders[seriesIndex];

                        // If the builder can be populated with remaining columns, then add it to allBuilders
                        if (builder.populateColumns(freeIndexes)) {
                            allSeriesBuilders.push(builder);
                        }
                    }

                    // Populate dynamic series
                    while (freeIndexes.length > 0) {
                        builder = new SeriesBuilder();
                        builder.addColumnReader(0, 'x');

                        // Mark index as used (not free)
                        index = inArray(0, freeIndexes);
                        if (index !== -1) {
                            freeIndexes.splice(index, 1);
                        }

                        for (i = 0; i < this.valueCount.global; i++) {
                            // Create and add a column reader for the next free column index
                            builder.addColumnReader(undefined, this.valueCount.globalPointArrayMap[i]);
                        }

                        // If the builder can be populated with remaining columns, then add it to allBuilders
                        if (builder.populateColumns(freeIndexes)) {
                            allSeriesBuilders.push(builder);
                        }
                    }

                    // Get the data-type from the first series x column
                    if (allSeriesBuilders.length > 0 && allSeriesBuilders[0].readers.length > 0) {
                        typeCol = columns[allSeriesBuilders[0].readers[0].columnIndex];
                        if (typeCol !== undefined) {
                            if (typeCol.isDatetime) {
                                type = 'datetime';
                            } else if (!typeCol.isNumeric) {
                                type = 'category';
                            }
                        }
                    }
                    // Axis type is category, then the "x" column should be called "name"
                    if (type === 'category') {
                        for (seriesIndex = 0; seriesIndex < allSeriesBuilders.length; seriesIndex++) {
                            builder = allSeriesBuilders[seriesIndex];
                            for (r = 0; r < builder.readers.length; r++) {
                                if (builder.readers[r].configName === 'x') {
                                    builder.readers[r].configName = 'name';
                                }
                            }
                        }
                    }

                    // Read data for all builders
                    for (seriesIndex = 0; seriesIndex < allSeriesBuilders.length; seriesIndex++) {
                        builder = allSeriesBuilders[seriesIndex];

                        // Iterate down the cells of each column and add data to the series
                        data = [];
                        for (j = 0; j < columns[0].length; j++) {
                            data[j] = builder.read(columns, j);
                        }

                        // Add the series
                        series[seriesIndex] = {
                            data: data
                        };
                        if (builder.name) {
                            series[seriesIndex].name = builder.name;
                        }
                        if (type === 'category') {
                            series[seriesIndex].turboThreshold = 0;
                        }
                    }



                    // Do the callback
                    chartOptions = {
                        series: series
                    };
                    if (type) {
                        chartOptions.xAxis = {
                            type: type
                        };
                        if (type === 'category') {
                            chartOptions.xAxis.uniqueNames = false;
                        }
                    }

                    if (options.complete) {
                        options.complete(chartOptions);
                    }

                    // The afterComplete hook is used internally to avoid conflict with the externally
                    // available complete option.
                    if (options.afterComplete) {
                        options.afterComplete(chartOptions);
                    }
                }

            },

            update: function(options, redraw) {
                var chart = this.chart;
                if (options) {
                    // Set the complete handler
                    options.afterComplete = function(dataOptions) {
                        chart.update(dataOptions, redraw);
                    };
                    // Apply it
                    Highcharts.data(options);
                }
            }
        });

        // Register the Data prototype and data function on Highcharts
        Highcharts.Data = Data;
        Highcharts.data = function(options, chartOptions) {
            return new Data(options, chartOptions);
        };

        // Extend Chart.init so that the Chart constructor accepts a new configuration
        // option group, data.
        Highcharts.wrap(Highcharts.Chart.prototype, 'init', function(proceed, userOptions, callback) {
            var chart = this;

            if (userOptions && userOptions.data) {
                chart.data = new Data(Highcharts.extend(userOptions.data, {

                    afterComplete: function(dataOptions) {
                        var i, series;

                        // Merge series configs
                        if (userOptions.hasOwnProperty('series')) {
                            if (typeof userOptions.series === 'object') {
                                i = Math.max(userOptions.series.length, dataOptions.series.length);
                                while (i--) {
                                    series = userOptions.series[i] || {};
                                    userOptions.series[i] = Highcharts.merge(series, dataOptions.series[i]);
                                }
                            } else { // Allow merging in dataOptions.series (#2856)
                                delete userOptions.series;
                            }
                        }

                        // Do the merge
                        userOptions = Highcharts.merge(dataOptions, userOptions);

                        proceed.call(chart, userOptions, callback);
                    }
                }), userOptions);
                chart.data.chart = chart;
            } else {
                proceed.call(chart, userOptions, callback);
            }
        });

        /**
         * Creates a new SeriesBuilder. A SeriesBuilder consists of a number
         * of ColumnReaders that reads columns and give them a name.
         * Ex: A series builder can be constructed to read column 3 as 'x' and
         * column 7 and 8 as 'y1' and 'y2'.
         * The output would then be points/rows of the form {x: 11, y1: 22, y2: 33}
         *
         * The name of the builder is taken from the second column. In the above
         * example it would be the column with index 7.
         * @constructor
         */
        SeriesBuilder = function() {
            this.readers = [];
            this.pointIsArray = true;
        };

        /**
         * Populates readers with column indexes. A reader can be added without
         * a specific index and for those readers the index is taken sequentially
         * from the free columns (this is handled by the ColumnCursor instance).
         * @returns {boolean}
         */
        SeriesBuilder.prototype.populateColumns = function(freeIndexes) {
            var builder = this,
                enoughColumns = true;

            // Loop each reader and give it an index if its missing.
            // The freeIndexes.shift() will return undefined if there
            // are no more columns.
            each(builder.readers, function(reader) {
                if (reader.columnIndex === undefined) {
                    reader.columnIndex = freeIndexes.shift();
                }
            });

            // Now, all readers should have columns mapped. If not
            // then return false to signal that this series should
            // not be added.
            each(builder.readers, function(reader) {
                if (reader.columnIndex === undefined) {
                    enoughColumns = false;
                }
            });

            return enoughColumns;
        };

        /**
         * Reads a row from the dataset and returns a point or array depending
         * on the names of the readers.
         * @param columns
         * @param rowIndex
         * @returns {Array | Object}
         */
        SeriesBuilder.prototype.read = function(columns, rowIndex) {
            var builder = this,
                pointIsArray = builder.pointIsArray,
                point = pointIsArray ? [] : {},
                columnIndexes;

            // Loop each reader and ask it to read its value.
            // Then, build an array or point based on the readers names.
            each(builder.readers, function(reader) {
                var value = columns[reader.columnIndex][rowIndex];
                if (pointIsArray) {
                    point.push(value);
                } else {
                    point[reader.configName] = value;
                }
            });

            // The name comes from the first column (excluding the x column)
            if (this.name === undefined && builder.readers.length >= 2) {
                columnIndexes = builder.getReferencedColumnIndexes();
                if (columnIndexes.length >= 2) {
                    // remove the first one (x col)
                    columnIndexes.shift();

                    // Sort the remaining
                    columnIndexes.sort();

                    // Now use the lowest index as name column
                    this.name = columns[columnIndexes.shift()].name;
                }
            }

            return point;
        };

        /**
         * Creates and adds ColumnReader from the given columnIndex and configName.
         * ColumnIndex can be undefined and in that case the reader will be given
         * an index when columns are populated.
         * @param columnIndex {Number | undefined}
         * @param configName
         */
        SeriesBuilder.prototype.addColumnReader = function(columnIndex, configName) {
            this.readers.push({
                columnIndex: columnIndex,
                configName: configName
            });

            if (!(configName === 'x' || configName === 'y' || configName === undefined)) {
                this.pointIsArray = false;
            }
        };

        /**
         * Returns an array of column indexes that the builder will use when
         * reading data.
         * @returns {Array}
         */
        SeriesBuilder.prototype.getReferencedColumnIndexes = function() {
            var i,
                referencedColumnIndexes = [],
                columnReader;

            for (i = 0; i < this.readers.length; i = i + 1) {
                columnReader = this.readers[i];
                if (columnReader.columnIndex !== undefined) {
                    referencedColumnIndexes.push(columnReader.columnIndex);
                }
            }

            return referencedColumnIndexes;
        };

        /**
         * Returns true if the builder has a reader for the given configName.
         * @param configName
         * @returns {boolean}
         */
        SeriesBuilder.prototype.hasReader = function(configName) {
            var i, columnReader;
            for (i = 0; i < this.readers.length; i = i + 1) {
                columnReader = this.readers[i];
                if (columnReader.configName === configName) {
                    return true;
                }
            }
            // Else return undefined
        };

    }(Highcharts));
}));
