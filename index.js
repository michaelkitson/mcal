#!/usr/bin/env node
(function () {
    "use strict";

    const monthLabels = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    const dayLabels = [
        'Su',
        'Mo',
        'Tu',
        'We',
        'Th',
        'Fr',
        'Sa'
    ];

    /**
     * Print a usage statement.
     */
    function usage(){
        console.log('Usage:');
        console.log('mcal [month] [year]');
        console.log('mcal [year] [month] ');
        console.log('mcal YYYY-MM');
    }

    /**
     * Right pad a string with spaces to the given length.
     *
     * @param {string} text
     * @param {int} length
     * @returns {string} The padded string
     */
    function rightPad(text, length) {
        return text + " ".repeat(Math.max(0, length - text.length));
    }

    /**
     * Left pad a string with spaces to center it within the given width.
     *
     * @param {string} text
     * @param {int} width
     * @returns {string} The padded string
     */
    function leftPadToCenter(text, width) {
        return " ".repeat(Math.floor((width - text.length) / 2)) + text;
    }

    /**
     * Wraps a string with terminal escape codes to invert its color.
     *
     * @param {string} text
     * @returns {string}
     */
    function invertTerminalColor(text) {
        return '\x1b[7m' + text + '\x1b[0m';
    }

    /**
     * Get a rendered month.
     *
     * @param {int} year
     * @param {int} month
     * @param {boolean} [includeYearInLabel=false]
     * @return {string[]} Lines of output
     */
    function getMonth(year, month, includeYearInLabel) {
        includeYearInLabel = includeYearInLabel || false;
        let lines = new Array(8).fill('');

        const now = new Date();
        const firstOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 1, -1);

        const weekday = firstOfMonth.getDay();
        const lastDayOfMonth = endOfMonth.getDate();

        lines[0] = leftPadToCenter(monthLabels[month] + (includeYearInLabel ? ' ' + year : ''), 20);
        lines[1] = dayLabels.join(' ');

        let currentLine = 2;
        lines[currentLine] = "   ".repeat(weekday);

        for (let i = 1; i <= lastDayOfMonth; i++) {
            if ((weekday + i - 1) % 7 === 0 && i !== 1) {
                currentLine += 1;
            } else if (i > 1) {
                lines[currentLine] += ' ';
            }

            if (i < 10) {
                lines[currentLine] += ' ';
            }
            let printableDay = '' + i;
            if (i === now.getDate() && year === now.getFullYear() && month === now.getMonth()) {
                printableDay = invertTerminalColor(printableDay);
            }
            lines[currentLine] += printableDay;
        }
        return lines;
    }

    /**
     * Print a given month.
     *
     * @param {int} year
     * @param {int} month
     */
    function printMonth(year, month) {
        const lines = getMonth(year, month, true);
        for (const line of lines) {
            console.log(line);
        }
    }

    /**
     * Print a given year.
     *
     * @param {int} year
     */
    function printYear(year) {
        console.log(' '.repeat(29) + year + "\n");

        /**
         * Prints three given months outputs, side by side.
         *
         * @param {string[]} firstLines
         * @param {string[]} secondLines
         * @param {string[]} thirdLines
         */
        function print3Months(firstLines, secondLines, thirdLines) {
            for (let i = 0; i < firstLines.length; i++) {
                const line = rightPad(firstLines[i], 22) + rightPad(secondLines[i], 22) + thirdLines[i];
                console.log(line.replace(/ +$/,''));
            }
        }

        print3Months(getMonth(year, 0), getMonth(year, 1), getMonth(year, 2));
        print3Months(getMonth(year, 3), getMonth(year, 4), getMonth(year, 5));
        print3Months(getMonth(year, 6), getMonth(year, 7), getMonth(year, 8));
        print3Months(getMonth(year, 9), getMonth(year, 10), getMonth(year, 11));
    }

    const now = new Date();
    let year  = now.getFullYear();
    let month = now.getMonth();
    let yearRequested = false;

    // Get the parameters we might use.
    let parameters = process.argv.slice(2);

    // If we have one parameter like '2016-03', split it and treat it as '2016 03'
    if(parameters.length == 1 && /[0-9]{4}-[0-9]{1,2}/.test(parameters[0])){
        parameters = parameters[0].split('-');
    }

    // Lets make them integers.
    parameters = parameters.map(function (param) {
        return parseInt(param, 10);
    });

    if(parameters.length == 1){
        const param = parameters[0];
        if (param >= 1900) {
            yearRequested = true;
            year = param;
        } else if (param > 0 && param <= 12) {
            month = param - 1;
        } else {
            usage();
            return;
        }
    } else if(parameters.length == 2) {
        parameters = parameters.sort(function(a, b){return a > b;});
        if (parameters[0] <= 0 || parameters[0] > 12 || parameters[1] < 1900) {
            usage();
            return;
        }
        month = parameters[0] - 1;
        year = parameters[1];
    } else if(parameters.length) {
        usage();
        return;
    }

    // If all you request is a year, we'll print the whole year.
    if(yearRequested) {
        printYear(year);
    } else {
        printMonth(year, month);
    }
}());
